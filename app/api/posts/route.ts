import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensurePlatformSchema } from "../../../db/platform";
import { posts } from "../../../db/schema";
import { getAdminUser } from "../../admin-auth";

export async function GET(request: Request) {
  try {
    await ensurePlatformSchema();
    const user = await getAdminUser();
    const visibility = user ? ["public", "members"] : ["public"];
    const db = await getDb();
    const slug = new URL(request.url).searchParams.get("slug")?.trim();
    if (slug) {
      const [post] = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);
      if (!post || post.status !== "published") {
        return Response.json({ error: "مطلب یافت نشد." }, { status: 404 });
      }
      return Response.json({ post });
    }
    const rows = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.status, "published"),
          inArray(posts.visibility, visibility),
        ),
      )
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(100);

    return Response.json({ posts: rows });
  } catch {
    return Response.json({ posts: [] });
  }
}
