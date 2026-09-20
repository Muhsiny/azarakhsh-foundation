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
    <main className="az-home">
      <section className="az-home-hero" id="top">
        <div className="az-container az-home-intro">
          <div className="az-home-intro-grid">
            <div className="az-hero-copy-main">
              <span className="az-overline">{settings.hero.eyebrow}</span>
              <h1>{settings.hero.title}</h1>
              <p>{settings.hero.description}</p>
              <div className="az-hero-links">
                <a className="az-action az-action-gold" href="/archive">کاوش آرشیف <span aria-hidden="true">←</span></a>
                <a className="az-text-link" href="/about">شناخت بنیاد <span aria-hidden="true">↗</span></a>
              </div>
            </div>

            <div className="az-sacred-opening" aria-label="بسم الله الرحمن الرحیم">
              <img
                className="az-basmala-art"
                src="/media/bismillah"
                alt="بسم الله الرحمن الرحیم"
                width="1000"
                height="1000"
                fetchPriority="high"
              />
            </div>
          </div>

          <form action="/publications" method="get" className="az-hero-search" aria-label="جست‌وجو در منابع آذرخش">
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
            <button type="submit" className="az-action az-action-gold">جست‌وجو <span aria-hidden="true">←</span></button>
          </form>

          <p className="az-hero-caption">{settings.hero.principle}</p>
        </div>
      </section>

      <section className="az-container az-featured-research" aria-labelledby="featured-research-title">
        <div className="az-featured-portrait-wrap">
          <a className="az-featured-portrait" href="/beheshti" aria-label="مطالعهٔ پروندهٔ آیت‌الله سید علی بهشتی">
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
          </a>
          <a className="az-featured-caption" href="/beheshti">
            <span>پروندهٔ شخصیت</span>
            <strong>آیت‌الله سید علی بهشتی</strong>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="az-featured-copy">
          <span className="az-overline">پژوهش برجسته</span>
          <h2 id="featured-research-title">{settings.leader.title}</h2>
          <p>{settings.leader.lead}</p>
          <div className="az-actions">
            <a className="az-action az-action-gold" href="/beheshti">مطالعهٔ پروندهٔ شخصیت ←</a>
            <a className="az-text-link" href="/council">پروندهٔ حکومت شورای اتفاق ↗</a>
          </div>
        </div>
      </section>

      <div className="az-container">
        <div className="az-trust-line" aria-label="پایه‌های پژوهش">
          <span>پایه‌های پژوهش</span>
          <a href="/standards">منبع‌سنجی</a>
          <a href="/standards">ارجاع روشن</a>
          <a href="/standards">حفظ اصل سند</a>
          <a href="/standards">تفکیک سند، روایت و تحلیل</a>
        </div>



        {latest.length > 0 && (
          <section className="az-section az-latest" aria-labelledby="latest-title">
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
                    <a href={`/publications/${item.slug}`} className="az-latest-media" tabIndex={-1} aria-hidden="true">
                      <img src={item.coverImage} alt="" loading="lazy" width="720" height="450" />
                    </a>
                  ) : (
                    <div className="az-latest-mark" aria-hidden="true">آ</div>
                  )}
                  <div className="az-latest-body">
                    <span className="az-meta">{typeLabels[item.contentType] || item.category}</span>
                    <h3><a href={`/publications/${item.slug}`}>{item.title}</a></h3>
                    <p>{item.excerpt || "برای مطالعهٔ متن کامل و مشخصات منبع، این مورد را باز کنید."}</p>
                    <a className="az-card-link" href={`/publications/${item.slug}`}>مطالعه و مشخصات منبع <span aria-hidden="true">←</span></a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {latest.length === 0 && (
          <section className="az-section az-latest" aria-labelledby="current-title">
            <div className="az-section-title">
              <div>
                <span className="az-overline">اکنون در آذرخش</span>
                <h2 id="current-title">پرونده‌های فعال پژوهشی</h2>
              </div>
              <a className="az-small-link" href="/publications">گنجینهٔ پژوهش ←</a>
            </div>
            <div className="az-latest-grid">
              <article className="az-latest-card">
                <div className="az-latest-mark" aria-hidden="true">۰۱</div>
                <div className="az-latest-body"><span className="az-meta">پروندهٔ محوری</span><h3><a href="/council">حکومت شورای اتفاق اسلامی افغانستان</a></h3><p>زمینه‌ها، ساختار، حکومت‌داری و شواهد تاریخی در یک مسیر پژوهشی منظم.</p><a className="az-card-link" href="/council">مطالعهٔ پرونده <span aria-hidden="true">←</span></a></div>
              </article>
              <article className="az-latest-card">
                <div className="az-latest-mark" aria-hidden="true">۰۲</div>
                <div className="az-latest-body"><span className="az-meta">پروندهٔ شخصیت</span><h3><a href="/beheshti">آیت‌الله سید علی بهشتی</a></h3><p>زندگی، اندیشه، رهبری، آثار و حافظهٔ عمومی با تفکیک سند، روایت و تحلیل.</p><a className="az-card-link" href="/beheshti">مطالعهٔ پرونده <span aria-hidden="true">←</span></a></div>
              </article>
              <article className="az-latest-card">
                <div className="az-latest-mark" aria-hidden="true">۰۳</div>
                <div className="az-latest-body"><span className="az-meta">روش پژوهش</span><h3><a href="/standards">اصول پژوهش، نشر و اصلاحات</a></h3><p>منبع‌سنجی، ارجاع، چندصدایی، اصلاحات و معیارهای انتشار در بنیاد.</p><a className="az-card-link" href="/standards">مطالعهٔ معیارها <span aria-hidden="true">←</span></a></div>
              </article>
            </div>
          </section>
        )}

        <section className="az-section" id="dossiers">
          <div className="az-section-title">
            <div>
              <span className="az-overline">پرونده‌های محوری</span>
              <h2>تاریخ را در زمینهٔ آن بخوانیم.</h2>
            </div>
            <span className="az-section-note">سند · روایت · پژوهش</span>
          </div>

          <div className="az-dossiers">
            {settings.visibility.council && (
              <article className="az-dossier" id="council">
                <div className="az-dossier-art">
                  <img
                    src={settings.media.councilEmblemUrl}
                    alt={settings.media.councilEmblemAlt}
                    width="1075"
                    height="1100"
                    loading="lazy"
                    onError={(e) => {
                      if (!e.currentTarget.dataset.fallback) {
                        e.currentTarget.dataset.fallback = "1";
                        e.currentTarget.src = "/media/council-emblem.webp";
                      }
                    }}
                  />
                  <span>حکومت شورای اتفاق</span>
                </div>
                <div className="az-dossier-body">
                  <span className="az-overline">پروندهٔ تاریخی / ۰۱</span>
                  <h3>{settings.council.title}</h3>
                  <p>{settings.council.text}</p>
                  <a href="/council" className="az-card-link">ورود به پرونده <span aria-hidden="true">←</span></a>
                </div>
              </article>
            )}

            {settings.visibility.leader && (
              <article className="az-dossier" id="beheshti">
                <div className="az-dossier-type" aria-hidden="true">
                  <span>علم</span><span>اندیشه</span><span>رهبری</span>
                </div>
                <div className="az-dossier-body">
                  <span className="az-overline">پروندهٔ شخصیت / ۰۲</span>
                  <h3>{settings.leader.title}</h3>
                  <p>{settings.leader.lead}</p>
                  <a href="/beheshti" className="az-card-link">زندگی و میراث علمی <span aria-hidden="true">←</span></a>
                </div>
              </article>
            )}
          </div>
        </section>

        {settings.visibility.archive && (
          <section className="az-section az-collections">
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
                <a key={item.type} href={`/publications?type=${item.type}`}>
                  <span className="az-collection-number">۰{i + 1}</span>
                  <h3>{item.name}</h3>
                  <p>{item.text}</p>
                  <span className="az-collection-arrow" aria-hidden="true">←</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {settings.visibility.standards && (
          <section className="az-method" id="standards">
            <div>
              <span className="az-overline">معیارهای بنیاد</span>
              <h2>{settings.standards.title}</h2>
              <p>{settings.standards.text}</p>
              <a className="az-small-link" href="/standards">آشنایی با روش پژوهش ←</a>
            </div>
            <ol>
              {settings.standards.items.map((item) => (
                <li key={item.id}><h3>{item.title}</h3><p>{item.text}</p></li>
              ))}
            </ol>
          </section>
        )}

        {settings.visibility.contribute && (
          <section className="az-contribute-band" id="contribute">
            <div>
              <span className="az-overline">حافظهٔ مشترک ما</span>
              <h2>{settings.contribute.title}</h2>
              <p>{settings.contribute.text}</p>
            </div>
            <a className="az-action az-action-gold" href="/contribute">ارسال سند یا خاطره ←</a>
          </section>
        )}
      </div>
    </main>
  );
}