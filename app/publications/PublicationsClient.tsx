"use client";

import { useEffect, useMemo, useState } from "react";
import { emptyFilters, matchesFilters, readFilters, typeLabels, type SearchFilters } from "./search";

export type PublicationListItem = {
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
};
const languageLabels: Record<string, string> = { fa: "فارسی", ps: "پښتو", en: "English" };

export default function PublicationsClient({ initialPosts, initialFilters = emptyFilters, archive = false }: { initialPosts: PublicationListItem[]; initialFilters?: SearchFilters; archive?: boolean }) {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  useEffect(() => {
    const restore = () => { setFilters(readFilters(new URLSearchParams(location.search))); setPage(1); };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  function update(next: SearchFilters) {
    setFilters(next); setPage(1);
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) if (value && value !== "all") params.set(key, value);
    window.history.replaceState(null, "", `${location.pathname}${params.size ? `?${params}` : ""}`);
  }
  const visiblePosts = useMemo(() => initialPosts.filter(post => matchesFilters(post, filters)), [initialPosts, filters]);
  const shown = visiblePosts.slice(0, page * 12);
  const active = filters.q || filters.topic || filters.type !== "all" || filters.language !== "all";
  return (
    <main className="publications-shell" data-inline-static>
      <section className="publications-hero">
        <p className="section-kicker">{archive ? "حافظهٔ مستند" : "گنجینهٔ پژوهش"}</p>
        <h1>{archive ? "آرشیف تاریخی آذرخش" : "نشریات و منابع پژوهشی"}</h1>
        <p>{archive ? "کتاب، سند، تصویر و روایت؛ فایل‌های منتشرشده را بر اساس موضوع، نوع و زبان پیدا کنید." : "مقالات، کتاب‌ها و روایت‌های منتشرشدهٔ بنیاد؛ با مسیر روشن برای مطالعه و مراجعه به منابع."}</p>
      </section>
      <section className="publications-body" aria-label="جست‌وجو و نتایج">
        {initialPosts.length > 0 && <>
        <div className="az-catalogue-toolbar" role="search">
          <label>جست‌وجو در منابع<input type="search" value={filters.q} placeholder="نام، عنوان، موضوع یا برچسب…" onChange={e => update({ ...filters, q: e.target.value })} /></label>
          <label>موضوع<select value={filters.topic} onChange={e => update({ ...filters, topic: e.target.value })}><option value="">همهٔ موضوعات</option><option value="council">شورای اتفاق</option><option value="beheshti">آیت‌الله بهشتی</option><option value="history">تاریخ معاصر</option>{filters.topic && !["council", "beheshti", "history"].includes(filters.topic) && <option value={filters.topic}>{filters.topic}</option>}</select></label>
          <label>نوع منبع<select value={filters.type} onChange={e => update({ ...filters, type: e.target.value })}><option value="all">همهٔ منابع</option>{Object.entries(typeLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label>زبان<select value={filters.language} onChange={e => update({ ...filters, language: e.target.value })}><option value="all">همهٔ زبان‌ها</option><option value="fa">فارسی</option><option value="ps">پښتو</option><option value="en">English</option></select></label>
        </div>
        <div className="az-results-info"><span role="status" aria-live="polite">{visiblePosts.length.toLocaleString("fa-AF")} نتیجه در مجموعهٔ قابل‌دسترسی</span>{active && <button onClick={() => update(emptyFilters)} type="button">پاک‌کردن جست‌وجو و فیلترها</button>}<a href="/join">عضویت پژوهشی ↗</a></div>
        </>}
        {!visiblePosts.length ? <>
          <div className="az-empty">
            <div className="az-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M6.5 4.5h11v15h-11zM9 8h6M9 11.5h6M9 15h4" /></svg>
            </div>
            <div className="az-empty-copy">
              <h2>{initialPosts.length ? "منبعی با این مشخصات پیدا نشد." : "هنوز منبعی در این مجموعه در دسترس نیست."}</h2>
              <p>{initialPosts.length ? "عبارت کوتاه‌تری بنویسید یا یکی از فیلترها را بردارید." : "تا تکمیل این مجموعه، می‌توانید پرونده‌های اصلی بنیاد را مطالعه کنید یا برای غنی‌سازی آرشیف، سند و روایت خود را بفرستید."}</p>
              <div className="az-actions">
                {active ? <button className="az-action" type="button" onClick={() => update(emptyFilters)}>نمایش همهٔ منابع</button> : <a className="az-action" href="/archive">مرور آرشیف</a>}
                <a className="az-small-link" href="/contribute">ارسال منبع ←</a>
              </div>
            </div>
          </div>
          {!initialPosts.length && (
            <div className="az-empty-dossiers" aria-label="پرونده‌های پیشنهادی برای مطالعه">
              <a href="/beheshti">
                <span>پروندهٔ زندگی و زمانه</span>
                <strong>آیت‌الله سید علی بهشتی</strong>
                <small>زندگی، فعالیت‌های علمی و سیاسی، اسناد و روایت‌ها ←</small>
              </a>
              <a href="/council">
                <span>پروندهٔ محوری / ۰۱</span>
                <strong>حکومت شورای اتفاق اسلامی افغانستان</strong>
                <small>ساختار، حکومت‌داری، اسناد و سلسله‌مراتب شواهد ←</small>
              </a>
            </div>
          )}
        </> : <><div className="publication-grid">{shown.map(post => <article key={post.id}>{post.coverImage ? <img src={post.coverImage} alt={`تصویر ${post.title}`} loading="lazy" width="600" height="400" /> : <div className="archive-placeholder" aria-hidden="true">آ</div>}<div><span className="az-post-type">{typeLabels[post.contentType] || post.category} · {languageLabels[post.language] || post.language}</span><h2>{post.title}</h2><p style={{display:"-webkit-box",WebkitBoxOrient:"vertical",WebkitLineClamp:3,overflow:"hidden"}}>{post.excerpt || "برای مطالعهٔ متن کامل و مشخصات منبع، پرونده را باز کنید."}</p><small>{post.authorName || "تحریریهٔ بنیاد"}{post.visibility === "members" ? " · ویژهٔ اعضا" : ""}</small><a className="publication-read" href={post.tags.split(",").map(t=>t.trim()).includes("leader-page") ? "/beheshti" : post.contentType === "page" ? `/pages/${post.slug}` : `/publications/${post.slug}`}>مطالعه و مشخصات منبع ←</a></div></article>)}</div>{shown.length < visiblePosts.length && <div className="az-actions"><button className="az-action" type="button" onClick={() => setPage(page+1)}>نمایش منابع بیشتر</button></div>}</>}
      </section>
    </main>
  );
}
