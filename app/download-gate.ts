import { getPlatformDbBinding } from "../db/platform";

type RuntimeEnv = { SESSION_SECRET?: string };

type PermitPayload = {
  postId: number;
  exp: number;
  nonce: string;
};

function bytesToBase64Url(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - (normalized.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function secret() {
  const { env } = await import("cloudflare:workers");
  const value = (env as unknown as RuntimeEnv).SESSION_SECRET?.trim();
  if (!value) throw new Error("تنظیم امنیتی دانلود فعال نیست.");
  return value;
}

async function hmac(value: string, keyValue: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyValue),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
  );
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value.trim().toLowerCase()),
  );
  return bytesToBase64Url(new Uint8Array(digest));
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function decodeAndVerify(token: string) {
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;

  const expected = await hmac(`download:${encoded}`, await secret());
  let actual: Uint8Array;
  try {
    actual = base64UrlToBytes(signature);
  } catch {
    return null;
  }
  if (!equalBytes(expected, actual)) return null;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(encoded)),
    ) as PermitPayload;
    if (
      !Number.isInteger(payload.postId) ||
      payload.postId <= 0 ||
      !payload.nonce ||
      !Number.isInteger(payload.exp)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function createDownloadPermit(postId: number, email: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: PermitPayload = {
    postId,
    exp: now + 10 * 60,
    nonce: crypto.randomUUID(),
  };
  const encoded = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const signature = bytesToBase64Url(
    await hmac(`download:${encoded}`, await secret()),
  );

  const db = await getPlatformDbBinding();
  await db
    .prepare(`
      INSERT INTO download_permits
        (nonce, post_id, email_hash, expires_at, consumed_at, created_at)
      VALUES (?, ?, ?, ?, NULL, ?)
    `)
    .bind(payload.nonce, postId, await sha256(email), payload.exp, now)
    .run();

  return `${encoded}.${signature}`;
}

export async function consumeDownloadPermit(token: string, postId: number) {
  const payload = await decodeAndVerify(token);
  const now = Math.floor(Date.now() / 1000);
  if (!payload || payload.postId !== postId || payload.exp < now) return false;

  const db = await getPlatformDbBinding();
  const result = await db
    .prepare(`
      UPDATE download_permits
      SET consumed_at = ?
      WHERE nonce = ?
        AND post_id = ?
        AND expires_at >= ?
        AND consumed_at IS NULL
    `)
    .bind(now, payload.nonce, postId, now)
    .run();

  return (result.meta.changes ?? 0) === 1;
}
