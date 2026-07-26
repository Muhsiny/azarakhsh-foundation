import { isAdminRequest } from "../../../admin-auth";

type RuntimeEnv = {
  MEDIA?: KVNamespace;
};

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  const { env } = await import("cloudflare:workers");
  const media = (env as unknown as RuntimeEnv).MEDIA;
  if (!media) {
    return Response.json({ error: "فضای فایل‌ها فعال نیست." }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !allowedTypes.has(file.type)) {
    return Response.json(
      { error: "فقط تصویر JPG، PNG، WebP، GIF یا فایل PDF پذیرفته می‌شود." },
      { status: 400 },
    );
  }
  if (file.size > 20 * 1024 * 1024) {
    return Response.json(
      { error: "حجم فایل باید کمتر از ۲۰ مگابایت باشد." },
      { status: 400 },
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const key = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await media.put(key, await file.arrayBuffer(), {
    metadata: {
      contentType: file.type,
      fileName: file.name,
    },
  });

  return Response.json({ url: `/api/media/${encodeURIComponent(key)}` });
}
