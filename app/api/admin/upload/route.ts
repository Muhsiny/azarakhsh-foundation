import { isAdminRequest } from "../../../admin-auth";

type RuntimeEnv = {
  BUCKET?: R2Bucket;
};

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as RuntimeEnv).BUCKET;
  if (!bucket) {
    return Response.json({ error: "فضای تصاویر فعال نیست." }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !allowedTypes.has(file.type)) {
    return Response.json(
      { error: "فقط تصویر JPG، PNG، WebP یا GIF پذیرفته می‌شود." },
      { status: 400 },
    );
  }
  if (file.size > 8 * 1024 * 1024) {
    return Response.json(
      { error: "حجم تصویر باید کمتر از ۸ مگابایت باشد." },
      { status: 400 },
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const key = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return Response.json({ url: `/api/media/${encodeURIComponent(key)}` });
}
