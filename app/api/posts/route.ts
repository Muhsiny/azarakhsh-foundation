import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensurePlatformSchema } from "../../../db/platform";
import { posts } from "../../../db/schema";
import { getAdminUser } from "../../admin-auth";

const publicPostSelection = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  category: posts.category,
  contentType: posts.contentType,
  language: posts.language,
  visibility: posts.visibility,
  authorName: posts.authorName,
  coverImage: posts.coverImage,
  sourceNote: posts.sourceNote,
  tags: posts.tags,
  featured: posts.featured,
  views: posts.views,
  downloads: posts.downloads,
  publishedAt: posts.publishedAt,
} as const;

function publicShape<T extends Record<string, unknown>>(post: T, hasFile: boolean) {
  return {
    ...post,
    hasFile,
    url:
      post.contentType === "page"
        ? `/pages/${encodeURIComponent(String(post.slug))}`
        : `/publications/${encodeURIComponent(String(post.slug))}`,
  };
}

export async function GET(request: Request) {
  try {
    await ensurePlatformSchema();
    const user = await getAdminUser();
    const visibility = user ? ["public", "members"] : ["public"];
    const db = await getDb();
    const slug = new URL(request.url).searchParams.get("slug")?.trim();

    if (slug) {
      const [post] = await db
        .select({
          ...publicPostSelection,
          fileUrl: posts.fileUrl,
        })
        .from(posts)
        .where(
          and(
            eq(posts.slug, slug),
            eq(posts.status, "published"),
            inArray(posts.visibility, visibility),
          ),
        )
        .limit(1);

      if (!post) {
        return Response.json({ error: "مطلب یافت نشد." }, { status: 404 });
      }
      const legacyTargetCategories = new Set(["حکومت شورای اتفاق", "آیت‌الله بهشتی"]);
      if (post.contentType === "article" && legacyTargetCategories.has(post.category)) {
        return Response.json({ error: "مطلب یافت نشد." }, { status: 404 });
      }
      const { fileUrl, ...safePost } = post;
      return Response.json(
        { post: publicShape(safePost, Boolean(fileUrl)) },
        { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
      );
    }

    const rows = await db
      .select({
        ...publicPostSelection,
        fileUrl: posts.fileUrl,
      })
      .from(posts)
      .where(
        and(
          eq(posts.status, "published"),
          inArray(posts.visibility, visibility),
        ),
      )
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(100);

    return Response.json(
      {
        posts: rows
          .filter((post) => !(
            post.contentType === "article" &&
            new Set(["حکومت شورای اتفاق", "آیت‌الله بهشتی"]).has(post.category)
          ))
          .map(({ fileUrl, ...post }) =>
            publicShape(post, Boolean(fileUrl)),
          ),
      },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
    );
  } catch {
    return Response.json(
      { posts: [] },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
