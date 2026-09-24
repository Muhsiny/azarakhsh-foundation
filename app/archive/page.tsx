import type { Metadata } from "next";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../db";
import { ensurePlatformSchema } from "../../db/platform";
import { posts } from "../../db/schema";
import { getAdminUser } from "../admin-auth";
import PublicationsClient from "../publications/PublicationsClient";
import { readFilters } from "../publications/search";

export const metadata: Metadata = {
  title: "آرشیو اسناد و تاریخ شفاهی",
  description: "آرشیو تاریخی بنیاد آذرخش؛ اسناد، تصاویر، صوت، ویدیو و تاریخ شفاهی با شناسنامه و معیارهای پژوهشی.",
  alternates: { canonical: "/archive" },
  openGraph: { url: "/archive", title: "آرشیو تاریخی آذرخش", description: "اسناد، تصاویر، صوت، ویدیو و تاریخ شفاهی بنیاد آذرخش." },
};

const sections = [
  { title: "اسناد مکتوب", text: "نامه‌ها، فرمان‌ها، اعلامیه‌ها، صورت‌جلسه‌ها و یادداشت‌ها با شناسهٔ یکتا، تاریخ، پدیدآورنده، منشأ و وضعیت اعتبار ثبت می‌شوند." },
  { title: "آرشیو تصویر", text: "هر تصویر همراه با شرح، تاریخ تقریبی، مکان، اشخاص حاضر، مالک اثر و وضعیت اجازهٔ نشر نگهداری می‌شود." },
  { title: "صوت و ویدئو", text: "فایل‌های شنیداری و دیداری همراه با متن پیاده‌شده، مدت، کیفیت نسخه و اطلاعات منشأ دسته‌بندی خواهند شد." },
  { title: "تاریخ شفاهی", text: "مصاحبه‌ها با رضایت آگاهانه، معرفی راوی، تاریخ ثبت، موضوع، محدودیت دسترسی و توضیح روش‌شناختی آرشیو می‌شوند." },
  { title: "نظام شناسه‌گذاری", text: "هر مدرک یک شناسهٔ پایدار دریافت می‌کند تا ارجاع، بازیابی، نسخه‌بندی و تشخیص ارتباط میان اسناد ممکن باشد.", points: ["AZ-DOC: سند مکتوب", "AZ-PHO: تصویر", "AZ-AUD: صوت", "AZ-VID: ویدئو", "AZ-OH: تاریخ شفاهی"] },
  { title: "دسترسی و حقوق", text: "نمایش عمومی، دسترسی پژوهشی یا محدودیت زمانی بر اساس حقوق صاحب اثر، حریم خصوصی و حساسیت تاریخی تعیین می‌شود." },
];

export default async function ArchivePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) if (typeof value === "string") params.set(key, value);
  await ensurePlatformSchema();
  const user = await getAdminUser();
  const visibility = user ? ["public", "members"] : ["public"];
  const db = await getDb();
  const archivePosts = await db
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
      ),
    )
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(200);
  const files = archivePosts.filter(post => ["book", "document", "oral-history", "image", "audio", "video"].includes(post.contentType));
  return (
    <>
      <PublicationsClient initialPosts={files} initialFilters={readFilters(params)} archive />
      <details className="az-archive-guide" data-inline-static><summary>دربارهٔ آرشیف، شناسه‌گذاری و شرایط دسترسی</summary><div>{sections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p>{section.points && <ul>{section.points.map(point => <li key={point}>{point}</li>)}</ul>}</section>)}</div><p>دریافت فایل تابع شرایط دسترسی و آزمون تاریخی موجود در صفحهٔ هر منبع است.</p></details>
    </>
  );
}
