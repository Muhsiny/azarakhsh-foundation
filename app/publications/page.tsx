"use client";

import { useEffect, useMemo, useState } from "react";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  contentType: string;
  language: string;
  visibility: string;
  authorName: string;
  coverImage: string | null;
  fileUrl: string | null;
  fileName: string | null;
  sourceNote: string;
  tags: string;
  views: number;
  downloads: number;
  publishedAt: string | null;
};

const typeLabels: Record<string, string> = {
  article: "مقالات و پژوهش‌ها",
  book: "کتاب‌ها",
  document: "اسناد PDF",
  biography: "زندگی‌نامه",
  "oral-history": "تاریخ شفاهی",
  image: "گالری تصویر",
  video: "ویدیو",
  audio: "صوت",
  news: "اخبار بنیاد",
};

export default function PublicationsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [type, setType] = useState("all");
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then(async (response) => (await response.json()) as { posts?: Post[] })
      .then((data) => setPosts(data.posts ?? []))
      .finally(() => setLoading(false));
  }, []);

  const visiblePosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesQuery =
        !normalized ||
        `${post.title} ${post.excerpt} ${post.category} ${post.tags}`
          .toLowerCase()
          .includes(normalized);
      return (
        matchesQuery &&
        (language === "all" || post.language === language) &&
        (type === "all" || post.contentType === type)
      );
    });
  }, [posts, query, language, type]);

  function openPost(post: Post) {
    setActivePost(post);
    void fetch(`/api/posts/${post.id}/view`, { method: "POST" });
  }

  return (
    <main className="publications-shell">
      <header className="publication-nav">
        <a className="brand" href="/">
          <span className="brand-mark"><img src="/azarakhsh-logo-web.png" alt="" /></span>
          <span><strong>بنیاد آذرخش</strong><small>گنجینهٔ جهانی پژوهش</small></span>
        </a>
        <div className="archive-account-links">
          <a href="/join">درخواست عضویت</a>
          <a href="/admin/login?returnTo=/publications">ورود اعضا</a>
          <a href="/">صفحهٔ نخست ←</a>
        </div>
      </header>
      <section className="publications-hero">
        <p className="section-kicker section-kicker-light">آرشیو دیجیتال آذرخش</p>
        <h1>پژوهش، سند، کتاب و حافظهٔ تاریخی</h1>
        <p>محتوای عمومی و منابع ویژهٔ اعضای تأییدشده در سه زبان.</p>
      </section>
      <section className="publications-body">
        <div className="archive-toolbar">
          <label className="archive-search">
            <span className="sr-only">جست‌وجو</span>
            <input onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو در عنوان، موضوع و برچسب..." type="search" value={query} />
            <span aria-hidden="true">⌕</span>
          </label>
          <select aria-label="زبان" value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="all">همهٔ زبان‌ها</option>
            <option value="fa">فارسی</option>
            <option value="ps">پښتو</option>
            <option value="en">English</option>
          </select>
          <select aria-label="نوع آرشیو" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">همهٔ آرشیو</option>
            {Object.entries(typeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </div>
        {loading ? (
          <p className="publication-empty">در حال بارگذاری...</p>
        ) : visiblePosts.length === 0 ? (
          <p className="publication-empty">محتوایی با این مشخصات یافت نشد.</p>
        ) : (
          <div className="publication-grid">
            {visiblePosts.map((post) => (
              <article key={post.id}>
                {post.coverImage ? <img src={post.coverImage} alt="" /> : <div className="archive-placeholder">آ</div>}
                <div>
                  <span>{typeLabels[post.contentType] ?? post.category} · {post.language.toUpperCase()}</span>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <small>{post.authorName || "تیم پژوهشی بنیاد"} · {post.views} بازدید</small>
                  <button onClick={() => openPost(post)} type="button">گشودن پرونده ←</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {activePost && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true">
          <article className="article-dialog">
            <button aria-label="بستن" className="dialog-close" onClick={() => setActivePost(null)} type="button">×</button>
            <span>{typeLabels[activePost.contentType] ?? activePost.category}</span>
            <h2>{activePost.title}</h2>
            <p className="article-excerpt">{activePost.excerpt}</p>
            {activePost.coverImage && <img src={activePost.coverImage} alt="" />}
            <div className="article-content">{activePost.content}</div>
            {activePost.sourceNote && <p className="source-note">منبع: {activePost.sourceNote}</p>}
            {activePost.fileUrl && (
              <a className="button button-dark" href={`/api/posts/${activePost.id}/download`}>
                دانلود {activePost.fileName || "فایل آرشیوی"} ({activePost.downloads})
              </a>
            )}
          </article>
        </div>
      )}
    </main>
  );
}
