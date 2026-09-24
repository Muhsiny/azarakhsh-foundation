import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { posts } from "../../../../../db/schema";
import { loadReadableDownloadablePostById } from "../../../../content-access";
import { consumeDownloadPermit } from "../../../../download-gate";

function resolveDownloadUrl(value: string, requestUrl: string) {
  try {
    const resolved = new URL(value, requestUrl);
    if (resolved.protocol !== "https:" && resolved.protocol !== "http:") {
      return null;
    }
    return resolved;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response("Not found", { status: 404 });
  }

  const { post } = await loadReadablePublicationById(id);
  if (!post?.fileUrl) return new Response("Not found", { status: 404 });

  const target = resolveDownloadUrl(post.fileUrl, request.url);
  if (!target) {
    return new Response("نشانی فایل معتبر نیست.", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token || !(await consumeDownloadPermit(token, id))) {
    return new Response(
      "برای دانلود، ابتدا پرسش‌های پیش از دریافت فایل را تکمیل کنید. این مجوز فقط یک‌بار قابل استفاده است.",
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const db = await getDb();
  await db
    .update(posts)
    .set({ downloads: sql`${posts.downloads} + 1` })
    .where(eq(posts.id, id));

  return new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
    },
  });
}
