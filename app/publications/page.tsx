"use client";

import { useEffect, useMemo, useState } from "react";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string | null;
  publishedAt: string | null;
};

export default function PublicationsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((response) => response.json())
      .then((data: { posts?: Post[] }) => setPosts(data.posts ?? []))
      .finally(() => setLoading(false));
  }, []);

  const visiblePosts = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) return posts;
    return posts.filter((post) =>
      `${post.title} ${post.excerpt} ${post.category}`.includes(normalized),
    );
  }, [posts, query]);

  return (
    <main className="publications-shell">
      <header className="publication-nav">
        <a className="brand" href="/">
          <span className="brand-mark">
            <img src="/azarakhsh-logo-web.png" alt="" />
          </span>
          <span>
            <strong>بنیاد آذرخش</strong>
            <small>گنجینهٔ نشرها</small>
          </span>
        </a>
        <a href="/">بازگشت به صفحهٔ نخست ←</a>
      </header>
      <section className="publications-hero">
        <p className="section-kicker section-kicker-light">تحریریهٔ آذرخش</p>
        <h1>مقالات، اسناد و روایت‌های پژوهشی</h1>
        <p>
          مجموعهٔ نوشته‌های منتشرشدهٔ بنیاد با تمرکز بر تاریخ افغانستان،
          حکومت شورای اتفاق و میراث حضرت آیت‌الله العظمی بهشتی(ره).
        </p>
      </section>
      <section className="publications-body">
        <label className="archive-search">
          <span className="sr-only">جست‌وجو در نشرها</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جست‌وجو در نشرها..."
            type="search"
            value={query}
          />
          <span aria-hidden="true">⌕</span>
        </label>
        {loading ? (
          <p className="publication-empty">در حال بارگذاری...</p>
        ) : visiblePosts.length === 0 ? (
          <p className="publication-empty">
            هنوز نوشته‌ای در این بخش منتشر نشده است.
          </p>
        ) : (
          <div className="publication-grid">
            {visiblePosts.map((post) => (
              <article key={post.id}>
                {post.coverImage && (
                  <img src={post.coverImage} alt="" />
                )}
                <div>
                  <span>{post.category}</span>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <button onClick={() => setActivePost(post)} type="button">
                    مطالعهٔ کامل ←
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {activePost && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true">
          <article className="article-dialog">
            <button
              aria-label="بستن"
              className="dialog-close"
              onClick={() => setActivePost(null)}
              type="button"
            >
              ×
            </button>
            <span>{activePost.category}</span>
            <h2>{activePost.title}</h2>
            <p className="article-excerpt">{activePost.excerpt}</p>
            {activePost.coverImage && (
              <img src={activePost.coverImage} alt="" />
            )}
            <div className="article-content">{activePost.content}</div>
          </article>
        </div>
      )}
    </main>
  );
}
