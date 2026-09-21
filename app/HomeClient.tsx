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

export default function HomeClient({ settings, latest }: { settings: SiteSettings; latest: LatestItem[] }) {
  return (
    <main className="az-home az-home-final">
      <section className="az-cover" aria-labelledby="az-cover-title">
        <div className="az-cover-media" aria-hidden="true">
          <img src="/media/hero-historical.webp" alt="" width="1600" height="1050" fetchPriority="high" />
        </div>
        <div className="az-cover-shade" aria-hidden="true" />
        <div className="az-container az-cover-inner">
          <div className="az-cover-copy">
            <span className="az-cover-kicker">بنیاد مستقل تاریخ‌پژوهی افغانستان</span>
            <h1 id="az-cover-title">{settings.hero.title}</h1>
            <p>{settings.hero.description}</p>
            <div className="az-cover-actions">
              <a className="az-action az-action-gold" href="/archive">کاوش آرشیف <span aria-hidden="true">←</span></a>
              <a className="az-cover-link" href="/about">شناخت بنیاد <span aria-hidden="true">↗</span></a>
            </div>

            <a className="az-cover-council" href="/council" aria-label="پروندهٔ حکومت شورای اتفاق اسلامی افغانستان">
              <span className="az-cover-council-mark">
                <img
                  src={settings.media.councilEmblemUrl}
                  alt={settings.media.councilEmblemAlt}
                  width="320"
                  height="320"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallback) {
                      e.currentTarget.dataset.fallback = "1";
                      e.currentTarget.src = "/media/council-emblem.webp";
                    }
                  }}
                />
              </span>
              <span className="az-cover-council-copy">
                <small>پروندهٔ محوری</small>
                <strong>حکومت شورای اتفاق اسلامی افغانستان</strong>
                <em>اسناد · ساختار · حکومت‌داری · روایت‌ها</em>
              </span>
              <span className="az-cover-council-arrow" aria-hidden="true">←</span>
            </a>
          </div>

          <div className="az-cover-caption" aria-hidden="true">
            <span>تصویر تاریخی · آرشیف تصویری آذرخش</span>
            <span>هر تصویر در کنار سند، زمان و روایت خوانده می‌شود.</span>
          </div>
        </div>
      </section>

      <section className="az-container az-search-deck" aria-label="جست‌وجو در منابع">
        <form action="/publications" method="get" className="az-search-form">
          <label htmlFor="hero-query">
            <span>جست‌وجو در آرشیف</span>
            <input id="hero-query" name="q" type="search" placeholder="نام، موضوع، سند یا کلیدواژه…" />
          </label>
          <label htmlFor="hero-type">
            <span>نوع منبع</span>
            <select id="hero-type" name="type" defaultValue="all">
              <option value="all">همهٔ منابع</option>
              <option value="document">اسناد</option>
              <option value="article">مقالات</option>
              <option value="book">کتاب‌ها</option>
              <option value="oral-history">تاریخ شفاهی</option>
            </select>
          </label>
          <button type="submit" className="az-search-button">جست‌وجو <span aria-hidden="true">←</span></button>
        </form>
        <p>{settings.hero.principle}</p>
      </section>

      <section className="az-container az-home-dossiers" aria-labelledby="dossiers-title">
        <div className="az-home-dossiers-heading">
          <span className="az-overline">پرونده‌های محوری</span>
          <h2 id="dossiers-title">دو مسیر برای ورود به قلب روایت تاریخی</h2>
          <p>شخصیت و حکومت، هر دو با منبع، زمینه و امکان نقد خوانده می‌شوند.</p>
        </div>

        <div className="az-home-dossiers-grid">
          <a className="az-leader-feature" href="/beheshti">
            <figure>
              <img
                src={settings.media.leaderImageUrl}
                alt={settings.media.leaderImageAlt}
                width="1182"
                height="1200"
                loading="eager"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = "1";
                    e.currentTarget.src = "/media/beheshti-original.webp";
                  }
                }}
              />
            </figure>
            <div>
              <span>پروندهٔ شخصیت / ۰۲</span>
              <h3>آیت‌الله سید علی بهشتی</h3>
              <p>زندگی، اندیشه، رهبری، آثار و حافظهٔ عمومی در یک مسیر پژوهشی مستند.</p>
              <strong>ورود به پرونده <b aria-hidden="true">←</b></strong>
            </div>
          </a>

          <a className="az-council-feature" href="/council">
            <div className="az-council-feature-mark">
              <img
                src={settings.media.councilEmblemUrl}
                alt={settings.media.councilEmblemAlt}
                width="520"
                height="520"
              />
            </div>
            <div>
              <span>پروندهٔ تاریخی / ۰۱</span>
              <h3>حکومت شورای اتفاق اسلامی افغانستان</h3>
              <p>بازسازی زمینه‌ها، ساختار، اداره و شواهد تاریخی بدون فروکاستن تجربه به یک شعار یا روایت واحد.</p>
              <strong>مطالعهٔ پرونده <b aria-hidden="true">←</b></strong>
            </div>
          </a>
        </div>
      </section>

      {latest.length > 0 && (
        <section className="az-container az-section az-latest" aria-labelledby="latest-title">
          <div className="az-section-title">
            <div>
              <span className="az-overline">تازه‌ترین در آذرخش</span>
              <h2 id="latest-title">پژوهش و منبع تازه</h2>
            </div>
            <a className="az-small-link" href="/publications">مشاهدهٔ همهٔ نشریات ←</a>
          </div>
          <div className="az-latest-grid">
            {latest.map((item) => (
              <article key={item.id} className="az-latest-card">
                {item.coverImage ? (
                  <a href={"/publications/" + item.slug} className="az-latest-media" tabIndex={-1} aria-hidden="true">
                    <img src={item.coverImage} alt="" loading="lazy" width="720" height="450" />
                  </a>
                ) : (
                  <div className="az-latest-mark" aria-hidden="true">آ</div>
                )}
                <div className="az-latest-body">
                  <span className="az-meta">{typeLabels[item.contentType] || item.category}</span>
                  <h3><a href={"/publications/" + item.slug}>{item.title}</a></h3>
                  <p>{item.excerpt || "برای مطالعهٔ متن کامل و مشخصات منبع، این مورد را باز کنید."}</p>
                  <a className="az-card-link" href={"/publications/" + item.slug}>مطالعه و مشخصات منبع <span aria-hidden="true">←</span></a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {settings.visibility.archive && (
        <section className="az-container az-section az-collections">
          <div className="az-section-title">
            <div>
              <span className="az-overline">مسیرهای مطالعه</span>
              <h2>از منبع، به شناخت.</h2>
            </div>
            <a className="az-small-link" href="/publications">همهٔ نشریات ←</a>
          </div>
          <div className="az-collection-grid">
            {[
              { name: "اسناد تاریخی", type: "document", text: "نامه‌ها، اعلامیه‌ها و منابع مکتوب" },
              { name: "کتاب‌ها و آثار", type: "book", text: "آثار و منابع پژوهشی منتشرشده" },
              { name: "تاریخ شفاهی", type: "oral-history", text: "روایت‌ها و حافظهٔ شاهدان" },
              { name: "مقالات و پژوهش‌ها", type: "article", text: "خوانش و تحلیل منابع تاریخی" },
            ].map((item, i) => (
              <a key={item.type} href={"/publications?type=" + item.type}>
                <span className="az-collection-number">{(i + 1).toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</span>
                <h3>{item.name}</h3>
                <p>{item.text}</p>
                <span className="az-collection-arrow" aria-hidden="true">←</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {settings.visibility.standards && (
        <section className="az-container az-home-method" id="standards">
          <div className="az-home-method-heading">
            <span className="az-overline">معیارهای بنیاد</span>
            <h2>{settings.standards.title}</h2>
            <p>{settings.standards.text}</p>
            <a className="az-small-link" href="/standards">آشنایی با روش پژوهش ←</a>
          </div>
          <ol>
            {settings.standards.items.map((item, index) => (
              <li key={item.id}>
                <span>{(index + 1).toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</span>
                <div><h3>{item.title}</h3><p>{item.text}</p></div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {settings.visibility.contribute && (
        <section className="az-container az-memory-callout" id="contribute">
          <div>
            <span className="az-overline">حافظهٔ مشترک ما</span>
            <h2>{settings.contribute.title}</h2>
            <p>{settings.contribute.text}</p>
          </div>
          <a className="az-action az-action-gold" href="/contribute">ارسال سند یا خاطره ←</a>
        </section>
      )}
    </main>
  );
}