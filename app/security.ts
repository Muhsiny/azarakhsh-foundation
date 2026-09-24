import { ensurePlatformSchema } from "../db/platform";

type RuntimeEnv = {
  DB?: D1Database;
};

async function runtimeEnv() {
  const { env } = await import("cloudflare:workers");
  return env as unknown as RuntimeEnv;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

export function requestIp(request: Request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function isSameOriginMutation(request: Request) {
  const target = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      return new URL(origin).origin === target.origin;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("Referer");
  if (referer) {
    try {
      return new URL(referer).origin === target.origin;
    } catch {
      return false;
    }
  }

  // Some privacy-focused clients omit both headers. SameSite=Strict cookies
  // still protect authenticated browser actions in that case.
  return true;
}

export async function consumeRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number,
  discriminator = "",
) {
  const env = await runtimeEnv();
  if (!env.DB) return { allowed: true, remaining: limit, retryAfter: 0 };

  await ensurePlatformSchema();

  const now = Math.floor(Date.now() / 1000);
  const resetAt = now + windowSeconds;
  const bucket = await sha256(
    `${scope}|${requestIp(request)}|${discriminator.trim().toLowerCase()}`,
  );

  await env.DB.prepare(`
    INSERT INTO security_rate_limits (bucket, count, reset_at, updated_at)
    VALUES (?, 1, ?, ?)
    ON CONFLICT(bucket) DO UPDATE SET
      count = CASE
        WHEN security_rate_limits.reset_at <= ? THEN 1
        ELSE security_rate_limits.count + 1
      END,
      reset_at = CASE
        WHEN security_rate_limits.reset_at <= ? THEN excluded.reset_at
        ELSE security_rate_limits.reset_at
      END,
      updated_at = excluded.updated_at
  `)
    .bind(bucket, resetAt, now, now, now)
    .run();

  const row = await env.DB.prepare(
    "SELECT count, reset_at FROM security_rate_limits WHERE bucket = ? LIMIT 1",
  )
    .bind(bucket)
    .first<{ count: number; reset_at: number }>();

  await env.DB.prepare("DELETE FROM security_rate_limits WHERE reset_at < ?")
    .bind(now - 86400)
    .run();

  const count = row?.count ?? 1;
  const retryAfter = Math.max(0, (row?.reset_at ?? resetAt) - now);
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfter,
  };
}

export type VerifiedUpload = {
  mime: string;
  extension: string;
};

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

export async function detectUploadType(file: File): Promise<VerifiedUpload | null> {
  const bytes = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  if (bytes.length < 4) return null;

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return { mime: "image/jpeg", extension: "jpg" };
  }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: "image/png", extension: "png" };
  }
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return { mime: "image/webp", extension: "webp" };
  }
  if (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a") {
    return { mime: "image/gif", extension: "gif" };
  }
  if (ascii(bytes, 0, 5) === "%PDF-") {
    return { mime: "application/pdf", extension: "pdf" };
  }
  if (ascii(bytes, 0, 4) === "OggS") {
    return { mime: "audio/ogg", extension: "ogg" };
  }
  if (
    ascii(bytes, 0, 3) === "ID3" ||
    (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
  ) {
    return { mime: "audio/mpeg", extension: "mp3" };
  }
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === "ftyp") {
    const claimed = file.type === "audio/mp4" ? "audio/mp4" : "video/mp4";
    return { mime: claimed, extension: "mp4" };
  }

  return null;
}

export function safeOriginalFileName(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/]/g, "_")
    .trim()
    .slice(0, 180) || "attachment";
}
