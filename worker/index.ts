/** Cloudflare Worker entry point for the vinext application. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
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
