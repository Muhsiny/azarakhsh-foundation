import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { posts } from "../../../db/schema";
import { canonicalPosts } from "../../../db/canonical-posts";
import { getAdminUser } from "../../admin-auth";

const publicPostSelection = {
  id: posts.id,
  slug: posts.slug,
  articleNo: posts.articleNo,
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

function canonicalRows() {
  return canonicalPosts
    .filter((post) => post.status === "published" && post.visibility === "public")
    .map((post) =>
      publicShape(
        {
          id: -post.articleNo,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          category: post.category,
          contentType: post.contentType,
          language: post.language,
          visibility: post.visibility,
          authorName: post.authorName,
          coverImage: post.coverImage,
          sourceNote: post.sourceNote,
          tags: post.tags,
          featured: post.featured,
          views: 0,
          downloads: 0,
          publishedAt: post.publishedAt,
        },
        false,
      ),
    );
}

const cacheHeaders = {
  "Cache-Control": "public, max-age=120, stale-while-revalidate=900",
};

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  const cacheHeaders = {
    "Cache-Control": "public, max-age=120, stale-while-revalidate=900",
  };

  try {
    const user = await getAdminUser();
    const visibility = user ? ["public", "members"] : ["public"];
    const db = await getDb();

    if (slug) {
      const [post] = await db
        .select({ ...publicPostSelection, fileUrl: posts.fileUrl })
        .from(posts)
        .where(
          and(
            eq(posts.slug, slug),
            eq(posts.status, "published"),
            inArray(posts.visibility, visibility),
          ),
        )
        .limit(1);
      if (!post) return Response.json({ error: "مطلب یافت نشد." }, { status: 404, headers: cacheHeaders });
      const { fileUrl, ...safePost } = post;
      return Response.json({ post: publicShape(safePost, Boolean(fileUrl)) }, { headers: cacheHeaders });
    }

    const rows = await db
      .select({ ...publicPostSelection, fileUrl: posts.fileUrl })
      .from(posts)
      .where(
        and(
          eq(posts.status, "published"),
          inArray(posts.visibility, visibility),
        ),
      )
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(200);

    return Response.json(
      { posts: rows.map(({ fileUrl, ...post }) => publicShape(post, Boolean(fileUrl))) },
      { headers: cacheHeaders },
    );
  } catch {
    const fallback = canonicalRows();
    if (slug) {
      const fixed = fallback.find((post) => post.slug === slug);
      return fixed
        ? Response.json({ post: fixed }, { headers: cacheHeaders })
        : Response.json({ error: "مطلب یافت نشد." }, { status: 404, headers: cacheHeaders });
    }
    return Response.json({ posts: fallback }, { headers: cacheHeaders });
  }
}
