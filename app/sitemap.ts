import type { MetadataRoute } from "next";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { ensurePlatformSchema } from "../db/platform";
import { posts } from "../db/schema";
import { SITE_URL } from "./site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    ["", 1, "weekly"],
    ["/publications", 0.9, "weekly"],
    ["/beheshti", 0.95, "monthly"],
    ["/council", 0.9, "monthly"],
    ["/archive", 0.9, "weekly"],
    ["/about", 0.7, "monthly"],
    ["/standards", 0.75, "monthly"],
    ["/contact", 0.6, "monthly"],
    ["/privacy", 0.5, "monthly"],
    ["/join", 0.55, "monthly"],
    ["/contribute", 0.6, "monthly"],
  ] as const;

  const staticLastModified = new Date("2026-09-19T00:00:00Z");
  const result: MetadataRoute.Sitemap = staticPages.map(
    ([path, priority, changeFrequency]) => ({
      url: `${SITE_URL}${path}`,
      lastModified: staticLastModified,
      changeFrequency,
      priority,
    }),
  );

  try {
    await ensurePlatformSchema();
    const db = await getDb();
    const publicPosts = await db
      .select({
        slug: posts.slug,
        contentType: posts.contentType,
        tags: posts.tags,
        updatedAt: posts.updatedAt,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .where(
        and(
          eq(posts.status, "published"),
          eq(posts.visibility, "public"),
        ),
      )
      .orderBy(desc(posts.updatedAt))
      .limit(5000);

    const seen = new Set(result.map((entry) => entry.url));
    for (const post of publicPosts) {
      const tags = post.tags.split(",").map((tag) => tag.trim());
      if (tags.includes("leader-page")) continue;
      const path =
        post.contentType === "page"
          ? `/pages/${encodeURIComponent(post.slug)}`
          : `/publications/${encodeURIComponent(post.slug)}`;
      const url = `${SITE_URL}${path}`;
      if (seen.has(url)) continue;
      seen.add(url);
      result.push({
        url,
        lastModified: new Date(post.updatedAt || post.publishedAt || staticLastModified),
        changeFrequency: "monthly",
        priority: post.contentType === "page" ? 0.65 : 0.7,
      });
    }
  } catch (error) {
    console.error("sitemap post listing failed", error);
  }

  return result;
}
