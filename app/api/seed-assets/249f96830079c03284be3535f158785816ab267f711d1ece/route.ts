type RuntimeEnv = {
  MEDIA?: KVNamespace;
};

const allowedNames = new Set([
  "ayatollah-beheshti.webp",
  "shura-e-ettefaq-emblem.webp",
]);

export async function POST(request: Request) {
  const { env } = await import("cloudflare:workers");
  const media = (env as unknown as RuntimeEnv).MEDIA;
  if (!media) return Response.json({ error: "Media storage unavailable" }, { status: 503 });

  const form = await request.formData();
  const name = String(form.get("name") ?? "");
  const file = form.get("file");

  if (!allowedNames.has(name) || !(file instanceof File)) {
    return Response.json({ error: "Invalid asset" }, { status: 400 });
  }

  if (file.type !== "image/webp" || file.size > 2_000_000) {
    return Response.json({ error: "Invalid image format or size" }, { status: 400 });
  }

  const key = `site/${name}`;
  await media.put(key, await file.arrayBuffer(), {
    metadata: {
      contentType: "image/webp",
      fileName: name,
    },
  });

  return Response.json({ url: `/api/media/${encodeURIComponent(key)}` });
}
