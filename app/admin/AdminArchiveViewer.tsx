"use client";

import { useEffect, useMemo, useState } from "react";

type AdminPost = {
  id: number;
  slug: string;
  title: string;
  category: string;
  contentType: string;
  visibility: string;
  status: string;
  fileUrl: string | null;
  fileName: string | null;
  updatedAt: string;
};

const labels: Record<string, string> = {
  book: "کتاب",
  document: "سند",
  "oral-history": "تاریخ شفاهی",
  image: "تصویر",
  audio: "صوت",
  video: "ویدیو",
  article: "مقاله",
  biography: "زندگی‌نامه",
  news: "خبر",
};

export default function AdminArchiveViewer() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/posts", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { posts?: AdminPost[]; error?: string };
        if (!response.ok) throw new Error(data.error || "دریافت فایل‌های آرشیو انجام نشد.");
        setPosts(data.posts || []);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "دریافت فایل‌ها انجام نشد."))
      .finally(() => setLoading(false));
  }, []);

  const files = useMemo(() => posts.filter((post) => Boolean(post.fileUrl)), [posts]);

  return (
    <section className="admin-shell" style={{ paddingTop: 0 }}>
      <div className="post-manager" style={{ maxWidth: "none" }}>
        <div className="manager-heading">
          <div>
            <p className="section-kicker">بازبینی فایل‌های ذخیره‌شده</p>
            <h2>آرشیو مالک</h2>
          </div>
          <span>{files.length}</span>
        </div>

        {loading ? (
          <p className="manager-empty">در حال دریافت فایل‌ها…</p>
        ) : message ? (
          <p className="manager-empty">{message}</p>
        ) : files.length === 0 ? (
          <p className="manager-empty">هنوز فایلی در آرشیو ذخیره نشده است.</p>
        ) : (
          <div className="managed-posts">
            {files.map((post) => (
              <article key={post.id}>
                <span className={`status-chip ${post.status === "published" ? "published" : ""}`}>
                  {post.status === "published" ? "منتشرشده" : post.status === "draft" ? "پیش‌نویس" : post.status}
                </span>
                <h3>{post.title}</h3>
                <p>{labels[post.contentType] || post.category} · {post.fileName || "فایل آرشیوی"}</p>
                <small>دسترسی: {post.visibility}</small>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a href={post.fileUrl || "#"} target="_blank" rel="noreferrer">مشاهدهٔ خود فایل</a>
                  {post.status === "published" && post.visibility === "public" && (
                    <a href={`/publications/${post.slug}`} target="_blank" rel="noreferrer">مشاهدهٔ صفحهٔ عمومی</a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
