import type { Metadata } from "next";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "../../db";
import { ensurePlatformSchema } from "../../db/platform";
import { posts } from "../../db/schema";
import { readableVisibilities } from "../content-access";
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
  await ensurePlatformSchema();
  const { visibility } = await readableVisibilities();
  const db = await getDb();
  const rows = await db
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
    })
    .from(posts)
    .where(
      and(
        eq(posts.status, "published"),
        inArray(posts.visibility, visibility),
        ne(posts.contentType, "page"),
      ),
    )
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(200);

  return <PublicationsClient initialPosts={rows} initialFilters={readFilters(params)} />;
}
