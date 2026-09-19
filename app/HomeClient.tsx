"use client";

import { type CSSProperties, useMemo } from "react";
import type { SiteSettings } from "./site-settings";

const timeline = [
  { label: "ریشه‌ها و زمینه‌ها", note: "پیش از تحولات معاصر" },
  { label: "تحولات معاصر", note: "دگرگونی‌های سیاسی و اجتماعی" },
  { label: "جهاد و مقاومت", note: "سال‌های بحران و مقاومت" },
  { label: "دورهٔ جدید", note: "میراث، روایت و بازخوانی" },
];

export default function HomeClient({ settings }: { settings: SiteSettings }) {
  const highlightedTitle = useMemo(() => {
    const word = settings.hero.highlightedWord.trim();
    if (!word || !settings.hero.title.includes(word)) return settings.hero.title;
    const [before, ...after] = settings.hero.title.split(word);
    return (
      <>
        {before}
        <em>{word}</em>
        {after.join(word)}
      </>
    );
  }, [settings.hero.highlightedWord, settings.hero.title]);

  const siteStyle = {
    "--forest-800": settings.colors.primary,
    "--forest-700": settings.colors.primary,
    "--forest-900": settings.colors.dark,
    "--forest-950": settings.colors.dark,
    "--gold-500": settings.colors.gold,
    "--gold-400": settings.colors.gold,
    "--paper": settings.colors.paper,
    "--font-persian": settings.design.fontFamily,
    "--heading-scale": settings.design.headingScale,
    "--content-width": `${settings.design.contentWidth}px`,
  } as CSSProperties;

  return (
    <main className="site-root azarakhsh-v3" style={siteStyle} dir="rtl">
      {settings.design.customCss && <style>{settings.design.customCss}</style>}

      <header className="v3-header">
        <a className="v3-brand" href="#top" aria-label={settings.identity.siteName}>
          <img src={settings.identity.logoUrl} alt={`لوگوی ${settings.identity.siteName}`} />
          <span>
            <strong>{settings.identity.siteName}</strong>
            <small>بنیاد مستقل تاریخ‌پژوهی افغانستان</small>
          </span>
        </a>

        <nav className="v3-nav" aria-label="فهرست اصلی">
          <a className="is-active" href="#top">صفحهٔ اصلی</a>
          <a href="/archive">آرشیف</a>
          <a href="/about">دربارهٔ بنیاد</a>
          <a href="/publications">نشریات</a>
          <a href="/standards">پژوهش‌ها</a>
          <a href="/contact">تماس با ما</a>
        </nav>

        <div className="v3-header-tools">
          <a className="v3-icon-link" href="/publications" aria-label="جست‌وجو">⌕</a>
          <a className="v3-login" href="/login">ثبت نام / ورود</a>
        </div>

        <details className="v3-mobile-menu">
          <summary>فهرست</summary>
          <div>
            <a href="/archive">آرشیف</a>
            <a href="/about">دربارهٔ بنیاد</a>
            <a href="/publications">نشریات</a>
            <a href="/standards">پژوهش‌ها</a>
            <a href="/contact">تماس با ما</a>
            <a href="/login">ورود اعضا</a>
          </div>
        </details>
      </header>

      <section className="v3-hero" id="top">
        <div className="v3-hero-scenery" aria-hidden="true">
          <span className="v3-mountain v3-mountain-one" />
          <span className="v3-mountain v3-mountain-two" />
          <span className="v3-fortress">
            <i /><i /><i /><i /><i />
          </span>
          <p>«میراث گذشته، سرمایهٔ آیندهٔ ماست.»</p>
        </div>

        <div className="v3-hero-copy">
          <p className="v3-eyebrow">{settings.hero.eyebrow}</p>
          <h1>{highlightedTitle}</h1>
          <p className="v3-hero-lead">
            ما در بنیاد آذرخش، متعهد به حفظ مسئولانه، نقد علمی و انتشار منابع تاریخی هستیم.
          </p>
          <div className="v3-hero-actions">
            <a className="v3-button v3-button-primary" href="#archive-search">
              جستجوی آرشیف <span aria-hidden="true">⌕</span>
            </a>
            <a className="v3-button v3-button-secondary" href="/about">
              دربارهٔ بنیاد <span aria-hidden="true">←</span>
            </a>
          </div>
        </div>

        <div className="v3-archive-still" aria-hidden="true">
          <div className="v3-arch" />
          <div className="v3-book-stack">
            <span /><span /><span />
          </div>
          <div className="v3-book-title">
            <b>تاریخ</b><b>هویت</b><b>آگاهی</b><b>آینده</b>
          </div>
          <div className="v3-manuscript" />
        </div>
      </section>

      <section className="v3-feature-stage">
        <article className="v3-council-feature" id="council">
          <div className="v3-feature-copy">
            <p className="v3-kicker">{settings.council.kicker}</p>
            <h2>{settings.council.title}</h2>
            <p>{settings.council.text}</p>
            <a className="v3-button v3-button-primary" href="/archive">
              ورود به پرونده <span aria-hidden="true">←</span>
            </a>
          </div>
          <figure className="v3-council-art">
            <div className="v3-paper-layer v3-paper-a" />
            <div className="v3-paper-layer v3-paper-b" />
            <div className="v3-council-emblem-wrap">
              <img src={settings.media.councilEmblemUrl} alt={settings.media.councilEmblemAlt} />
            </div>
            <figcaption>{settings.media.councilEmblemCaption}</figcaption>
          </figure>
        </article>

        <article className="v3-leader-feature" id="beheshti">
          <div className="v3-leader-copy">
            <p className="v3-kicker">پروندهٔ ویژه</p>
            <h2>{settings.leader.title}</h2>
            <p className="v3-leader-subtitle">رهبر، عالم، متفکر و مجاهد</p>
            <p>{settings.leader.lead}</p>
            <a className="v3-button v3-button-outline" href="/beheshti">
              مطالعهٔ پرونده <span aria-hidden="true">←</span>
            </a>
          </div>
          <figure className="v3-leader-portrait">
            <img src={settings.media.leaderImageUrl} alt={settings.media.leaderImageAlt} />
            <figcaption>{settings.media.leaderImageAlt}</figcaption>
          </figure>
        </article>
      </section>

      <section className="v3-search-strip" id="archive-search">
        <div className="v3-search-intro">
          <span className="v3-search-book" aria-hidden="true">▤</span>
          <div>
            <h2>جستجوی مرکزی آرشیف</h2>
            <p>در اسناد، اشخاص، رویدادها و پژوهش‌های منتشرشده جست‌وجو کنید.</p>
          </div>
        </div>

        <form className="v3-search-form" action="/publications" method="get">
          <label className="v3-search-box">
            <span aria-hidden="true">⌕</span>
            <input name="q" type="search" placeholder="جستجو در اسناد، اشخاص، رویدادها…" />
          </label>
          <select name="topic" defaultValue="">
            <option value="">همه موضوعات</option>
            <option value="council">شورای اتفاق</option>
            <option value="beheshti">آیت‌الله بهشتی</option>
            <option value="history">تاریخ معاصر</option>
          </select>
          <select name="type" defaultValue="all">
            <option value="all">همه انواع</option>
            <option value="article">مقاله و پژوهش</option>
            <option value="document">سند</option>
            <option value="book">کتاب</option>
            <option value="oral-history">تاریخ شفاهی</option>
          </select>
          <button type="submit">جستجو</button>
        </form>
      </section>

      <section className="v3-timeline" aria-labelledby="v3-timeline-title">
        <div className="v3-timeline-heading">
          <h2 id="v3-timeline-title">گزیده‌ای از مسیر تاریخ و پژوهش</h2>
          <a href="/archive">بیشتر بدانید ←</a>
        </div>
        <div className="v3-timeline-track">
          {timeline.map((item) => (
            <div className="v3-timeline-item" key={item.label}>
              <span />
              <strong>{item.label}</strong>
              <small>{item.note}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="v3-contribute" id="contribute">
        <div className="v3-contribute-art" aria-hidden="true">
          <span className="v3-old-book" />
          <span className="v3-old-photo" />
          <span className="v3-old-paper" />
        </div>
        <div className="v3-contribute-copy">
          <h2>اسناد و خاطرات خود را با ما به اشتراک بگذارید</h2>
          <p>
            اگر سند، تصویر، خاطره یا روایت تاریخی در اختیار دارید، در حفظ حافظهٔ تاریخی با ما همکاری کنید.
          </p>
          <a className="v3-button v3-button-primary" href="/contribute">
            ارسال سند یا خاطره <span aria-hidden="true">↥</span>
          </a>
        </div>
        <blockquote>
          هر سند، روایتی است از ما و زمان ما.
        </blockquote>
      </section>

      <footer className="v3-footer">
        <div className="v3-footer-brand">
          <img src={settings.identity.logoUrl} alt={`لوگوی ${settings.identity.siteName}`} />
          <div>
            <strong>{settings.identity.siteName}</strong>
            <p>بنیاد مستقل تاریخ‌پژوهی افغانستان</p>
            <small>تاریخ برای آگاهی، جامعه برای فردا</small>
          </div>
        </div>

        <div className="v3-footer-column">
          <strong>دسترسی سریع</strong>
          <a href="#top">صفحهٔ اصلی</a>
          <a href="/about">دربارهٔ بنیاد</a>
          <a href="/archive">آرشیف</a>
          <a href="/publications">نشریات</a>
        </div>

        <div className="v3-footer-column">
          <strong>منابع پژوهشی</strong>
          <a href="/publications?type=article">مقالات</a>
          <a href="/publications?type=book">کتاب‌ها</a>
          <a href="/publications?type=document">اسناد</a>
          <a href="/standards">روش پژوهش</a>
        </div>

        <div className="v3-footer-column">
          <strong>با ما در ارتباط باشید</strong>
          {settings.contact.email && <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>}
          <span>{settings.contact.address}</span>
          <a href="/contact">ارسال پیام</a>
        </div>

        <div className="v3-footer-quote">
          <p>گذشته چراغ راه آینده است.</p>
          <span />
        </div>

        <small className="v3-copyright">© بنیاد آذرخش — {settings.footer.copyright}</small>
      </footer>
    </main>
  );
}
