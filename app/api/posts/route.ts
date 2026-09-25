import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { posts } from "../../../db/schema";
import { canonicalPosts } from "../../../db/canonical-posts";
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
  const canonical = canonicalRows();

  if (slug) {
    const fixed = canonical.find((post) => post.slug === slug);
    if (fixed) return Response.json({ post: fixed }, { headers: cacheHeaders });
  }

  try {
    const user = await getAdminUser();
    const visibility = user ? ["public", "members"] : ["public"];
    const db = await getDb();

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

      if (!post) return Response.json({ error: "مطلب یافت نشد." }, { status: 404 });

      const canonicalSlugs = new Set(canonical.map((item) => String(item.slug)));
      const legacyTargetCategories = new Set(["حکومت شورای اتفاق", "آیت‌الله بهشتی"]);
      if (
        canonicalSlugs.has(post.slug) ||
        (post.contentType === "article" && legacyTargetCategories.has(post.category))
      ) {
        return Response.json({ error: "مطلب یافت نشد." }, { status: 404 });
      }

      const { fileUrl, ...safePost } = post;
      return Response.json(
        { post: publicShape(safePost, Boolean(fileUrl)) },
        { headers: cacheHeaders },
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

    const canonicalSlugs = new Set(canonical.map((item) => String(item.slug)));
    const legacyTargetCategories = new Set(["حکومت شورای اتفاق", "آیت‌الله بهشتی"]);
    const extras = rows
      .filter(
        (post) =>
          !canonicalSlugs.has(post.slug) &&
          !(post.contentType === "article" && legacyTargetCategories.has(post.category)),
      )
      .map(({ fileUrl, ...post }) => publicShape(post, Boolean(fileUrl)));

    return Response.json(
      {
        posts: [...canonical, ...extras].sort((a, b) =>
          String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")),
        ),
      },
      { headers: cacheHeaders },
    );
  } catch {
    if (slug) return Response.json({ error: "مطلب یافت نشد." }, { status: 404, headers: cacheHeaders });
    return Response.json({ posts: canonical }, { headers: cacheHeaders });
  }
}
