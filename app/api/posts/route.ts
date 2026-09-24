import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensurePlatformSchema } from "../../../db/platform";
import { posts } from "../../../db/schema";
import { readableVisibilities } from "../../content-access";

export async function GET(request: Request) {
  try {
    await ensurePlatformSchema();
    const { visibility } = await readableVisibilities();
    const db = await getDb();
    const slug = new URL(request.url).searchParams.get("slug")?.trim();

    if (slug) {
      const [post] = await db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.slug, slug),
            eq(posts.status, "published"),
            inArray(posts.visibility, visibility),
            ne(posts.contentType, "page"),
          ),
        )
        .limit(1);

      if (!post) {
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
          ne(posts.contentType, "page"),
        ),
      )
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(100);

    return Response.json({ posts: rows });
  } catch {
    return Response.json({ posts: [] });
  }
}
