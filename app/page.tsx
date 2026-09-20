import type { Metadata } from "next";
import { and, desc, eq } from "drizzle-orm";
import HomeClient, { type LatestItem } from "./HomeClient";
import { loadSiteSettings } from "./load-site-settings";
import { ensurePlatformSchema } from "../db/platform";
import { getDb } from "../db";
import { posts } from "../db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { "fa-AF": "/", en: "/en" } },
  openGraph: { url: "/" },
};

export default async function Home() {
  const settings = await loadSiteSettings();
  let latest: LatestItem[] = [];

  try {
    await ensurePlatformSchema();
    const db = await getDb();
    latest = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        excerpt: posts.excerpt,
        category: posts.category,
        contentType: posts.contentType,
        coverImage: posts.coverImage,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .where(and(eq(posts.status, "published"), eq(posts.visibility, "public")))
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(3);
  } catch {
    latest = [];
  }

  return <HomeClient settings={settings} latest={latest} />;
}