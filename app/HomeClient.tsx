"use client";

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

export type HomeMedia = {
  councilEmblemUrl: string;
  councilEmblemAlt: string;
};

export default function HomeClient({ media, latest }: { media: HomeMedia; latest: LatestItem[] }) {
  const featured = latest.slice(0, 3);

  return (
    <main className="az-reference-home" data-inline-static>
      <section className="az-reference-hero" aria-labelledby="az-ref-title">
        <figure className="az-reference-hero-photo">
          <img src="/reference-v2/hero-left.webp" alt="تصویر تاریخی آیت‌الله سید علی بهشتی در میان همراهان" />
          <figcaption className="az-reference-photo-caption">
            <strong>آیت‌الله سید علی بهشتی در میان همراهان</strong>
            <span>تصویر تاریخی</span>
          </figcaption>
        </figure>

        <div className="az-reference-hero-center">
          <span className="az-reference-kicker">بنیاد پژوهشی تاریخی آذرخش</span>
          <h1 id="az-ref-title">
            <span>تاریخ، آنگاه روشن می‌شود</span>
            <em>که اسناد سخن بگویند.</em>
          </h1>
          <p>نهاد مستقل پژوهشی برای گردآوری، سنجش و بازخوانی مستند تاریخ افغانستان</p>
          <div className="az-reference-hero-actions">
            <a className="az-ref-btn az-ref-btn-solid" href="/archive">کاوش در آرشیف ←</a>
            <a className="az-ref-btn az-ref-btn-outline" href="/standards">معیارهای پژوهش</a>
          </div>
        </div>

        <div className="az-reference-hero-emblem">
          <img src={media.councilEmblemUrl || "/media/council-emblem.webp"} alt={media.councilEmblemAlt} />
          <strong>حکومت شورای اتفاق<br />اسلامی افغانستان</strong>
          <a href="/council">پروندهٔ پژوهشی ←</a>
        </div>

        <div className="az-reference-hero-motto" aria-label="روش پژوهش بنیاد">
          <strong>سند<br />زمینه<br />روایت</strong>
          <span />
        </div>
      </section>

      <section className="az-reference-paths" aria-label="مسیرهای اصلی پژوهش">
        <a href="/publications?type=book"><span className="az-ref-icon">▣</span><div><strong>نشریات و کتاب‌ها</strong><small>آثار و منابع پژوهشی منتشرشده</small></div></a>
        <a href="/publications?type=document"><span className="az-ref-icon">⌕</span><div><strong>اسناد تاریخی</strong><small>نامه‌ها، اعلامیه‌ها و منابع مکتوب</small></div></a>
        <a href="/publications?type=article"><span className="az-ref-icon">▤</span><div><strong>مقالات و پژوهش‌ها</strong><small>تحلیل‌ها و پژوهش‌های تاریخی</small></div></a>
        <a href="/publications?type=oral-history"><span className="az-ref-icon">●</span><div><strong>تاریخ شفاهی</strong><small>روایت‌ها و خاطرات شاهدان</small></div></a>
      </section>

      <section className="az-reference-lower az-container">
        <aside className="az-reference-quote-card">
          <span className="az-reference-card-label">اصل پژوهش</span>
          <blockquote>هر ادعا باید تا جای ممکن به سند، شاهد یا منبع قابل بررسی بازگردد.</blockquote>
          <a href="/standards">روش و معیارها ←</a>
        </aside>

        <div className="az-reference-latest">
          <div className="az-reference-section-heading">
            <h2>آخرین مطالب</h2>
            <a href="/publications">همهٔ مطالب ←</a>
          </div>
          {featured.length ? (
            <div className="az-reference-latest-grid">
              {featured.map((item) => {
                const href = "/publications/" + item.slug;
                const label = typeLabels[item.contentType] || item.category;
                return (
                  <article key={item.id}>
                    <a href={href} className="az-reference-latest-media">
                      {item.coverImage ? <img src={item.coverImage} alt="" /> : <div className="az-reference-media-placeholder" aria-hidden="true">آذرخش</div>}
                      <span>{label}</span>
                    </a>
                    <h3><a href={href}>{item.title}</a></h3>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="az-reference-empty">
              <strong>هنوز مطلبی در این بخش منتشر نشده است.</strong>
              <p>پس از انتشار نخستین سند، مقاله یا کتاب، تازه‌ترین موارد در همین‌جا نمایش داده می‌شوند.</p>
            </div>
          )}
        </div>

        <aside className="az-reference-note-card">
          <span className="az-reference-card-label">تفکیک شواهد</span>
          <strong>سند، خاطره و تفسیر یک چیز نیستند؛ هرکدام باید با جایگاه خودش خوانده شود.</strong>
          <a href="/standards">منشور اعتبار ←</a>
        </aside>
      </section>
    </main>
  );
}
