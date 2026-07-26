type RuntimeEnv = {
  BUCKET?: R2Bucket;
};

type RouteContext = {
  params: Promise<{ key: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as RuntimeEnv).BUCKET;
  if (!bucket) return new Response("Not found", { status: 404 });

  const { key } = await context.params;
  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
