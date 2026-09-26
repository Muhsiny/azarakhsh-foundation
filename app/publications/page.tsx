import type { Metadata } from "next";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../db";
import { posts } from "../../db/schema";
import { canonicalPosts } from "../../db/canonical-posts";
import { getAdminUser } from "../admin-auth";
import PublicationsClient from "./PublicationsClient";
import { readFilters } from "./search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "نشریات و منابع پژوهشی",
  description: "مقالات، کتاب‌ها، اسناد، زندگی‌نامه، تاریخ شفاهی، تصویر، صوت و ویدیو در گنجینهٔ پژوهشی بنیاد آذرخش.",
  alternates: { canonical: "/publications" },
  openGraph: {
    url: "/publications",
    title: "گنجینهٔ پژوهش | بنیاد آذرخش",
    description: "مقالات، کتاب‌ها، اسناد و منابع چندرسانه‌ای بنیاد آذرخش.",
  },
};

export default async function PublicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) if (typeof value === "string") params.set(key, value);
  const user = await getAdminUser();
  const visibility = user ? ["public", "members"] : ["public"];
  let rows: Array<{
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    contentType: string;
    language: string;
    visibility: string;
    authorName: string;
    coverImage: string | null;
    tags: string;
    publishedAt: string | null;
    articleNo: number | null;
  }> = [];

  try {
    const db = await getDb();
    rows = await db
      .select({
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
        tags: posts.tags,
        publishedAt: posts.publishedAt,
        articleNo: posts.articleNo,
      })
      .from(posts)
      .where(
        and(
          eq(posts.status, "published"),
          inArray(posts.visibility, visibility),
        ),
      )
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(200);
  } catch {
    rows = [];
  }

  if (rows.length === 0) {
    rows = canonicalPosts
      .filter((post) => post.status === "published" && visibility.includes(post.visibility))
      .map((post) => ({
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
        tags: post.tags,
        publishedAt: post.publishedAt,
        articleNo: post.articleNo,
      }));
  }

  const mergedRows = rows.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));

  return <PublicationsClient initialPosts={mergedRows} initialFilters={readFilters(params)} />;
}
