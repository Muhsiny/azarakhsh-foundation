/** Cloudflare Worker entry point for the vinext application. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  MEDIA: KVNamespace;
  ADMIN_EMAIL?: string;
  SESSION_SECRET?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const allowedUploadTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "video/mp4",
]);

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - (normalized.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function authenticatedAdmin(request: Request, env: Env) {
  const secret = env.SESSION_SECRET?.trim();
  if (!secret) return false;
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)azarakhsh_admin=([^;]+)/);
  if (!match) return false;

  const token = decodeURIComponent(match[1]);
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;

  try {
    const expected = await hmac(payload, secret);
    if (!equalBytes(expected, base64UrlToBytes(signature))) return false;
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as { email?: string; exp?: number };
    if (!data.email || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return false;

    const email = data.email.trim().toLowerCase();
    if (email === env.ADMIN_EMAIL?.trim().toLowerCase()) return true;

    const row = await env.DB.prepare(
      "SELECT role, status FROM admin_users WHERE email = ? LIMIT 1",
    ).bind(email).first<{ role?: string; status?: string }>();
    return row?.status === "active" && ["admin", "reviewer", "editor"].includes(row.role || "");
  } catch {
    return false;
  }
}

async function directMediaUpload(request: Request, env: Env) {
  if (!(await authenticatedAdmin(request, env))) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > 20 * 1024 * 1024 + 512 * 1024) {
    return Response.json({ error: "حجم فایل باید کمتر از ۲۰ مگابایت باشد." }, { status: 413 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !allowedUploadTypes.has(file.type)) {
      return Response.json({ error: "فقط تصویر، PDF، صوت یا ویدیوی MP4 پذیرفته می‌شود." }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return Response.json({ error: "حجم فایل باید کمتر از ۲۰ مگابایت باشد." }, { status: 413 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const key = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    await env.MEDIA.put(key, await file.arrayBuffer(), {
      metadata: { contentType: file.type, fileName: file.name },
    });
    return Response.json({ url: `/api/media/${encodeURIComponent(key)}` });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? `آپلود انجام نشد: ${error.message}` : "آپلود انجام نشد." },
      { status: 500 },
    );
  }
}

function secureResponse(response: Response, pathname: string): Response {
  const secured = new Response(response.body, response);
  secured.headers.set("X-Content-Type-Options", "nosniff");
  secured.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  secured.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  secured.headers.set("X-Frame-Options", "SAMEORIGIN");
  secured.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  secured.headers.set("Cross-Origin-Resource-Policy", "same-site");
  secured.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  secured.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; font-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https:; upgrade-insecure-requests",
  );

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) {
    secured.headers.set("Cache-Control", "no-store, private");
  } else if (/\.(?:css|js|woff2?|png|jpe?g|webp|avif|svg|ico)$/i.test(pathname)) {
    secured.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (!secured.headers.has("Cache-Control")) {
    secured.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }

  return secured;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/admin/upload" && request.method === "POST") {
      return secureResponse(await directMediaUpload(request, env), url.pathname);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const imageResponse = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return secureResponse(imageResponse, url.pathname);
    }

    const response = await handler.fetch(request, env, ctx);
    return secureResponse(response, url.pathname);
  },
};

export default worker;
