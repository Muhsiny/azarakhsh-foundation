type RuntimeEnv = {
  MEDIA?: KVNamespace;
};

type MediaMetadata = {
  contentType?: string;
  fileName?: string;
};

type RouteContext = {
  params: Promise<{ key: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { env } = await import("cloudflare:workers");
  const media = (env as unknown as RuntimeEnv).MEDIA;
  if (!media) return new Response("Not found", { status: 404 });

  const { key } = await context.params;
  const object = await media.getWithMetadata<MediaMetadata>(key, "arrayBuffer");
  if (!object.value) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  headers.set("content-type", object.metadata?.contentType || "application/octet-stream");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  if (object.metadata?.fileName) {
    headers.set("content-disposition", `inline; filename*=UTF-8''${encodeURIComponent(object.metadata.fileName)}`);
  }
  return new Response(object.value, { headers });
}
