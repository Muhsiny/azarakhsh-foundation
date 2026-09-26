import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { ensurePlatformSchema } from "../../../../../db/platform";
import { posts } from "../../../../../db/schema";
import { getAdminUser } from "../../../../admin-auth";
import { verifyAndConsumeDownloadPermit } from "../../../../download-gate";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response("Not found", { status: 404 });
  }

  await ensurePlatformSchema();
  const db = await getDb();
  const [item] = await db
    .select({
      id: posts.id,
      status: posts.status,
      visibility: posts.visibility,
      fileUrl: posts.fileUrl,
      quizEnabled: posts.quizEnabled,
    })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!item?.fileUrl || item.status !== "published") {
    return new Response("Not found", { status: 404 });
  }
  if (item.visibility === "members" && !(await getAdminUser())) {
    return new Response("برای دریافت این فایل، ابتدا وارد حساب عضو شوید.", { status: 403 });
  }
  if (item.visibility !== "public" && item.visibility !== "members") {
    return new Response("Not found", { status: 404 });
  }

  if (item.quizEnabled) {
    const token = new URL(request.url).searchParams.get("token") || "";
    if (!token || !(await verifyAndConsumeDownloadPermit(token, id))) {
      return new Response(
        "مجوز دانلود معتبر نیست، استفاده شده یا منقضی شده است. آزمون را دوباره تکمیل کنید.",
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  await db
    .update(posts)
    .set({ downloads: sql`${posts.downloads} + 1` })
    .where(eq(posts.id, id));

  return Response.redirect(new URL(item.fileUrl, request.url), 302);
}
