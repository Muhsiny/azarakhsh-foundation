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

const researchPaths = [
  ["۰۱", "اسناد تاریخی", "نامه‌ها، اعلامیه‌ها، فرمان‌ها و منابع مکتوب", "/publications?type=document"],
  ["۰۲", "مقالات و پژوهش‌ها", "تحلیل‌ها و پژوهش‌های مستند بنیاد", "/publications?type=article"],
  ["۰۳", "کتاب‌ها و نشریات", "آثار منتشرشده و منابع پژوهشی", "/publications?type=book"],
  ["۰۴", "تاریخ شفاهی", "خاطرات و روایت‌های شاهدان", "/publications?type=oral-history"],
] as const;

export default function HomeClient({ media, latest }: { media: HomeMedia; latest: LatestItem[] }) {
  const featured = latest.slice(0, 3);

  return (
    <main className="az-home">
      <section className="az-home-hero" aria-labelledby="az-home-title">
        <div className="az-container az-home-hero-grid">
          <div className="az-home-copy">
            <span className="az-home-kicker">بنیاد پژوهشی تاریخی آذرخش</span>
            <h1 id="az-home-title">
              تاریخ، آنگاه روشن می‌شود
              <em>که اسناد سخن بگویند.</em>
            </h1>
            <p className="az-home-lead">
              نهاد مستقل پژوهشی برای گردآوری، سنجش و بازخوانی مستند تاریخ افغانستان؛
              با تفکیک روشن میان سند، روایت، خاطره و تفسیر.
            </p>
            <div className="az-home-actions">
              <a className="az-action az-action-primary" href="/archive">کاوش در آرشیف</a>
              <a className="az-action az-action-secondary" href="/standards">معیارهای پژوهش</a>
            </div>
          </div>

          <figure className="az-home-portrait">
            <div className="az-home-portrait-frame">
              <img
                src="/media/beheshti-original.webp"
                alt="آیت‌الله سید علی بهشتی"
                width="1182"
                height="1200"
                fetchPriority="high"
              />
            </div>
            <figcaption>
              <span>پروندهٔ زندگی و زمانه</span>
              <strong>آیت‌الله سید علی بهشتی</strong>
              <a href="/beheshti">مطالعهٔ پرونده ←</a>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="az-container az-research-index" aria-labelledby="research-index-title">
        <div className="az-section-heading">
          <div>
            <span className="az-overline">مسیرهای پژوهش</span>
            <h2 id="research-index-title">از منبع تا روایت قابل بررسی</h2>
          </div>
          <a href="/publications">همهٔ منابع ←</a>
        </div>
        <div className="az-research-index-grid">
          {researchPaths.map(([no, title, text, href]) => (
            <a href={href} key={title}>
              <span>{no}</span>
              <div><strong>{title}</strong><small>{text}</small></div>
              <b aria-hidden="true">←</b>
            </a>
          ))}
        </div>
      </section>

      <section className="az-council-feature">
        <div className="az-container az-council-feature-grid">
          <div className="az-council-feature-copy">
            <span className="az-overline az-overline-light">پروندهٔ محوری / ۰۱</span>
            <h2>حکومت شورای اتفاق اسلامی افغانستان</h2>
            <p>
              بازخوانی یک تجربهٔ تاریخی حکومت‌داری از مسیر اسناد، روایت‌ها،
              ساختار اداری و زمینهٔ سیاسی؛ بدون آمیختن بزرگداشت با داوری پژوهشی.
            </p>
            <div className="az-actions">
              <a className="az-action az-action-gold" href="/council">گشودن پرونده</a>
              <a className="az-text-link az-text-link-light" href="/publications?topic=council">منابع مرتبط ←</a>
            </div>
          </div>
          <figure className="az-council-feature-emblem">
            <div><img src={media.councilEmblemUrl || "/media/council-emblem.webp"} alt={media.councilEmblemAlt} width="1075" height="1100" loading="lazy" /></div>
            <figcaption>نشان تاریخی حکومت شورای اتفاق اسلامی افغانستان</figcaption>
          </figure>
        </div>
      </section>

      <section className="az-container az-home-latest" aria-labelledby="latest-title">
        <div className="az-section-heading">
          <div>
            <span className="az-overline">تازه‌ترین نشرها</span>
            <h2 id="latest-title">مطالب و منابع تازه</h2>
          </div>
          <a href="/publications">همهٔ نشرها ←</a>
        </div>

        {featured.length ? (
          <div className="az-home-latest-grid">
            {featured.map((item) => {
              const href = "/publications/" + item.slug;
              const label = typeLabels[item.contentType] || item.category;
              return (
                <article key={item.id}>
                  <a className="az-home-latest-media" href={href}>
                    {item.coverImage
                      ? <img src={item.coverImage} alt="" loading="lazy" width="720" height="480" />
                      : <div className="az-home-placeholder" aria-hidden="true">آذرخش</div>}
                    <span>{label}</span>
                  </a>
                  <div className="az-home-latest-body">
                    <h3><a href={href}>{item.title}</a></h3>
                    {item.excerpt && <p>{item.excerpt}</p>}
                    <a href={href}>مطالعه و مشخصات منبع ←</a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="az-home-empty">
            <strong>هنوز مطلبی در این بخش منتشر نشده است.</strong>
            <p>پس از انتشار نخستین سند، مقاله یا کتاب، تازه‌ترین موارد در همین‌جا نمایش داده می‌شوند.</p>
          </div>
        )}
      </section>

      <section className="az-home-method">
        <div className="az-container az-home-method-grid">
          <div>
            <span className="az-overline">قاعدهٔ پژوهش</span>
            <h2>سند، خاطره و تفسیر یک چیز نیستند.</h2>
          </div>
          <p>
            هر ادعا باید تا جای ممکن به منبع قابل بررسی بازگردد. نوع شاهد، فاصلهٔ زمانی،
            زمینهٔ تاریخی و درجهٔ اطمینان باید برای خواننده روشن بماند.
          </p>
          <a className="az-action az-action-secondary" href="/standards">روش و معیارها</a>
        </div>
      </section>

      <section className="az-container az-home-contribute">
        <div>
          <span className="az-overline">حافظهٔ جمعی</span>
          <h2>سند، تصویر یا خاطره‌ای در اختیار دارید؟</h2>
          <p>منشأ، زمینه و حقوق استفاده از هر منبع پیش از نشر بررسی می‌شود.</p>
        </div>
        <a className="az-action az-action-primary" href="/contribute">ارسال سند و خاطره</a>
      </section>
    </main>
  );
}
