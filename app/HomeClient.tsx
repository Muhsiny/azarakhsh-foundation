"use client";

import type { SiteSettings } from "./site-settings";

export type LatestItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  contentType: string;
  coverImage: string | null;
  publishedAt: string | null;
};

const typeLabels: Record<string, string> = {
  article: "مقاله",
  book: "کتاب",
  document: "سند",
  "oral-history": "تاریخ شفاهی",
  image: "تصویر",
  audio: "صوت",
  video: "ویدئو",
  page: "پرونده",
};

type FallbackCard = { title: string; type: string; href: string };

const fallbackCards: FallbackCard[] = [
  { title: "نقش حکومت شورای اتفاق در تحولات افغانستان", type: "مقاله", href: "/council" },
  { title: "بازخوانی تجربهٔ حکومت موقت در مناطق مرکزی", type: "تحلیل", href: "/council" },
  { title: "بامیان؛ جغرافیا، مردم و حافظهٔ تاریخی", type: "پژوهش", href: "/archive" },
];

type FeaturedCard = LatestItem | FallbackCard;

export default function HomeClient({ settings, latest }: { settings: SiteSettings; latest: LatestItem[] }) {
  const featured = latest.slice(0, 3);
  return (
    <main className="az-reference-home">
      <section className="az-reference-hero" aria-labelledby="az-ref-title">
        <div className="az-reference-hero-photo">
          <img src="/reference-v2/hero-left.webp" alt="تصویر تاریخی آیت‌الله سید علی بهشتی در میان همراهان" />
          <div className="az-reference-photo-quote">
            <strong>مردی<br/>از جنس ایمان<br/>از تبار مردم<br/>برای آزادی<br/>و عزت افغانستان</strong>
            <span />
          </div>
        </div>

        <div className="az-reference-hero-center">
          <h1 id="az-ref-title"><span>تاریخ، آنگاه روشن می‌شود</span><em>که اسناد سخن بگویند.</em></h1>
          <p>بنیاد آذرخش؛ نهاد مستقل پژوهشی<br/>برای بازخوانی دقیق تاریخ افغانستان</p>
          <div className="az-reference-hero-actions">
            <a className="az-ref-btn az-ref-btn-outline" href="/about">دربارهٔ بنیاد</a>
            <a className="az-ref-btn az-ref-btn-solid" href="/archive">کاوش در آرشیف ←</a>
          </div>
        </div>

        <div className="az-reference-hero-emblem">
          <img src={settings.media.councilEmblemUrl || "/media/council-emblem.webp"} alt={settings.media.councilEmblemAlt} />
          <strong>حکومت شورای اتفاق<br/>اسلامی افغانستان</strong>
        </div>

        <div className="az-reference-hero-motto">
          <strong>از مردم<br/>با مردم<br/>برای مردم</strong>
          <span />
        </div>
      </section>

      <section className="az-reference-paths" aria-label="مسیرهای اصلی پژوهش">
        <a href="/publications?type=book"><span className="az-ref-icon">▣</span><div><strong>نشریات و کتاب‌ها</strong><small>آثار و منابع پژوهشی منتشرشده</small></div></a>
        <a href="/publications?type=document"><span className="az-ref-icon">⌕</span><div><strong>اسناد تاریخی</strong><small>نامه‌ها، اعلامیه‌ها و منابع مکتوب</small></div></a>
        <a href="/publications?type=article"><span className="az-ref-icon">▤</span><div><strong>مقالات و پژوهش‌ها</strong><small>تحلیل‌ها و پژوهش‌های تاریخی</small></div></a>
        <a href="/publications?type=oral-history"><span className="az-ref-icon">●</span><div><strong>حافظهٔ جمعی</strong><small>روایت‌ها و خاطرات شاهدان</small></div></a>
      </section>

      <section className="az-reference-lower az-container">
        <aside className="az-reference-quote-card">
          <blockquote>«ملت‌ها با حافظهٔ تاریخی زنده‌اند.»</blockquote>
          <span>— آیت‌الله سید علی بهشتی (رح)</span>
        </aside>

        <div className="az-reference-latest">
          <div className="az-reference-section-heading">
            <h2>آخرین مطالب</h2>
            <a href="/publications">همهٔ مطالب ←</a>
          </div>
          <div className="az-reference-latest-grid">
            {((featured.length ? featured : fallbackCards) as FeaturedCard[]).map((item, index) => {
              const href = "slug" in item ? "/publications/" + item.slug : item.href;
              const label = "contentType" in item ? (typeLabels[item.contentType] || item.category) : item.type;
              const image = "coverImage" in item ? item.coverImage : null;
              return (
                <article key={"id" in item ? item.id : index}>
                  <a href={href} className="az-reference-latest-media">
                    {image ? <img src={image} alt="" /> : <img src="/media/hero-historical.webp" alt="" />}
                    <span>{label}</span>
                  </a>
                  <h3><a href={href}>{item.title}</a></h3>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="az-reference-note-card">
          <span className="az-reference-feather">❧</span>
          <strong>اگر سند نباشد،<br/>تاریخ به روایت دیگران نوشته می‌شود.</strong>
          <small>— بنیاد آذرخش</small>
        </aside>
      </section>
    </main>
  );
}
