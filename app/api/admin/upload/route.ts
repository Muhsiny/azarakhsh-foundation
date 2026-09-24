import { isAdminRequest } from "../../../admin-auth";
import {
  detectUploadType,
  isSameOriginMutation,
  safeOriginalFileName,
} from "../../../security";

type RuntimeEnv = {
  MEDIA?: KVNamespace;
};

const allowedTypes = new Set([
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

export async function POST(request: Request) {
  try {
    if (!(await isAdminRequest())) {
      return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
    }
    if (!isSameOriginMutation(request)) {
      return Response.json({ error: "درخواست نامعتبر است." }, { status: 403 });
    }

    const contentLength = Number(request.headers.get("Content-Length") || "0");
    if (contentLength > 20 * 1024 * 1024 + 512 * 1024) {
      return Response.json(
        { error: "حجم فایل باید کمتر از ۲۰ مگابایت باشد." },
        { status: 413 },
      );
    }

    const { env } = await import("cloudflare:workers");
    const media = (env as unknown as RuntimeEnv).MEDIA;
    if (!media) {
      return Response.json(
        { error: "فضای ذخیره‌سازی رسانه در Cloudflare به Worker وصل نشده است." },
        { status: 503 },
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "فایل معتبر نیست." }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return Response.json(
        { error: "حجم فایل باید کمتر از ۲۰ مگابایت باشد." },
        { status: 413 },
      );
    }

    const verified = await detectUploadType(file);
    if (!verified || !allowedTypes.has(verified.mime)) {
      return Response.json(
        { error: "نوع واقعی فایل مجاز نیست یا با قالب مورد انتظار سازگار نیست." },
        { status: 400 },
      );
    }

    const key = `${Date.now()}-${crypto.randomUUID()}.${verified.extension}`;
    await media.put(key, await file.arrayBuffer(), {
      metadata: {
        contentType: verified.mime,
        fileName: safeOriginalFileName(file.name),
        verified: "magic-bytes-v1",
      },
    });

    return Response.json(
      { url: `/api/media/${encodeURIComponent(key)}` },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("media upload failed", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? `آپلود انجام نشد: ${error.message}`
            : "آپلود به دلیل خطای ناشناخته انجام نشد.",
      },
      { status: 500 },
    );
  }
}
