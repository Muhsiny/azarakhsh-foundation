"use client";

import { useMemo } from "react";

type ArchivePost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  contentType: string;
  language: string;
  authorName: string;
  coverImage: string | null;
  fileUrl: string | null;
  fileName: string | null;
  downloads: number;
};

const archiveTypes = new Set(["book", "document", "oral-history", "image", "audio", "video"]);

const typeLabels: Record<string, string> = {
  book: "کتاب",
  document: "سند تاریخی",
  "oral-history": "تاریخ شفاهی",
  image: "تصویر",
  audio: "صوت",
  video: "ویدیو",
};

export default function ArchiveBrowser({ posts }: { posts: ArchivePost[] }) {

  const files = useMemo(
    () => posts.filter((post) => archiveTypes.has(post.contentType) && Boolean(post.fileUrl)),
    [posts],
  );

  return (
    <section style={{ marginTop: 48 }}>
      <div style={{ marginBottom: 20 }}>
        <p className="section-kicker">فایل‌های قابل دسترسی</p>
        <h2>گنجینهٔ منتشرشده</h2>
        <p>فایل‌های زیر برای مشاهدهٔ عمومی منتشر شده‌اند. دریافت نسخهٔ اصلی پس از عبور موفق از آزمون تاریخی فعال می‌شود.</p>
      </div>

      {files.length === 0 ? (
        <p>هنوز فایل عمومی و منتشرشده‌ای در آرشیو قرار نگرفته است.</p>
      ) : (
        <div className="publication-grid">
          {files.map((post) => (
            <article key={post.id}>
              {post.coverImage ? <img src={post.coverImage} alt="" /> : <div className="archive-placeholder">آ</div>}
              <div>
                <span>{typeLabels[post.contentType] || post.category} · {post.language.toUpperCase()}</span>
                <h3>{post.title}</h3>
                <p style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 3, overflow: "hidden" }}>
                  {post.excerpt || "برای مشاهدهٔ مشخصات و دریافت فایل، پروندهٔ مستقل را باز کنید."}
                </p>
                <small>{post.authorName || "بنیاد آذرخش"} · {post.downloads} دریافت</small>
                <a className="publication-read" href={`/publications/${post.slug}`}>مشاهده و دریافت پس از آزمون ←</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
