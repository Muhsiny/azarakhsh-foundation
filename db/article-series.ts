import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";
import { getDb } from ".";
import { posts } from "./schema";
import { canonicalPosts } from "./canonical-posts";
import { ensurePlatformSchema } from "./platform";

export type SeriesPost = typeof posts.$inferSelect;

function fallbackSeries(visibility: string[]) {
  return canonicalPosts
    .filter((post) => post.status === "published" && visibility.includes(post.visibility))
    .sort((a, b) => a.articleNo - b.articleNo)
    .map((post) => ({
      id: -post.articleNo,
      slug: post.slug,
      articleNo: post.articleNo,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      contentType: post.contentType,
      language: post.language,
      visibility: post.visibility,
      authorName: post.authorName,
      coverImage: post.coverImage,
      fileUrl: null,
      fileName: null,
      sourceNote: post.sourceNote,
      tags: post.tags,
      featured: post.featured,
      views: 0,
      downloads: 0,
      quizEnabled: 1,
      quizConfig: "",
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.publishedAt,
      updatedAt: post.updatedAt,
    })) as SeriesPost[];
}

export async function getNumberedSeries(visibility: string[] = ["public"]) {
  try {
    await ensurePlatformSchema();
    const db = await getDb();
    return await db
      .select()
      .from(posts)
      .where(
        and(
          isNotNull(posts.articleNo),
          eq(posts.status, "published"),
          inArray(posts.visibility, visibility),
        ),
      )
      .orderBy(asc(posts.articleNo));
  } catch {
    return fallbackSeries(visibility);
  }
}

export async function getPostBySlug(slug: string, visibility: string[] = ["public"]) {
  try {
    await ensurePlatformSchema();
    const db = await getDb();
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);

    if (!post) return null;
    if (post.status !== "published" || !visibility.includes(post.visibility)) return null;
    return post;
  } catch {
    const post = canonicalPosts.find((item) => item.slug === slug);
    if (!post || post.status !== "published" || !visibility.includes(post.visibility)) return null;
    return fallbackSeries(visibility).find((item) => item.slug === slug) ?? null;
  }
}
