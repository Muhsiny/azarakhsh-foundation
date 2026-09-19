"use client";

import { type CSSProperties, useMemo } from "react";
import type { SiteSettings } from "./site-settings";

const timeline = [
  { date: "قبل از ۱۳۰۰", label: "دوران کلاسیک", note: "ریشه‌ها و زمینه‌ها" },
  { date: "۱۳۰۰ – ۱۳۵۷", label: "تحولات معاصر", note: "دگرگونی‌های سیاسی و اجتماعی" },
  { date: "۱۳۵۷ – ۱۳۷۱", label: "جهاد و مقاومت", note: "سال‌های بحران و مقاومت" },
  { date: "۱۳۷۱ – ۱۴۰۰", label: "دورهٔ جدید", note: "میراث، روایت و بازخوانی" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 14v5h14v-5" />
    </svg>
  );
}

export default function HomeClient({ settings }: { settings: SiteSettings }) {
  const highlightedTitle = useMemo(() => {
    const displayTitle = settings.hero.title.replace(/سخن بگوید\.؟?$/u, "سخن بگویند.");
    const word = settings.hero.highlightedWord.trim();
    if (!word || !displayTitle.includes(word)) return displayTitle;
    const [before, ...after] = displayTitle.split(word);
    return (
      <>
        {before}
        <em>{word}</em>
        {after.join(word)}
      </>
    );
  }, [settings.hero.highlightedWord, settings.hero.title]);

  const siteStyle = {
    "--az-green": settings.colors.primary,
    "--az-green-deep": settings.colors.dark,
    "--az-gold": settings.colors.gold,
    "--az-paper": settings.colors.paper,
    "--az-font": settings.design.fontFamily,
  } as CSSProperties;

  return (
    <main className="site-root azarakhsh-approved" style={siteStyle} dir="rtl">
      {settings.design.customCss && <style>{settings.design.customCss}</style>}

      <header className="az-header">
        <a className="az-brand" href="#top" aria-label={settings.identity.siteName}>
          <img src={settings.identity.logoUrl} alt={`لوگوی ${settings.identity.siteName}`} />
          <span>
            <strong>{settings.identity.siteName}</strong>
            <small>بنیاد مستقل تاریخ‌پژوهی افغانستان</small>
          </span>
        </a>

        <nav className="az-nav" aria-label="فهرست اصلی">
          <a className="is-active" href="#top">صفحه اصلی</a>
          <a href="/archive">آرشیف</a>
          <a href="/about">درباره بنیاد</a>
          <a href="/publications">نشریات</a>
          <a href="/standards">پژوهش‌ها</a>
          <a href="/contact">تماس با ما</a>
        </nav>

        <div className="az-header-tools">
          <a className="az-search-trigger" href="#archive-search" aria-label="جست‌وجو در آرشیف">
            <SearchIcon />
          </a>
          <a className="az-login" href="/login">
            <span aria-hidden="true">♙</span>
            ثبت نام / ورود
          </a>
        </div>

        <details className="az-mobile-menu">
          <summary aria-label="باز کردن فهرست">
            <MenuIcon />
          </summary>
          <div>
            <a href="#top">صفحه اصلی</a>
            <a href="/archive">آرشیف</a>
            <a href="/about">درباره بنیاد</a>
            <a href="/publications">نشریات</a>
            <a href="/standards">پژوهش‌ها</a>
            <a href="/contact">تماس با ما</a>
            <a href="/login">ثبت نام / ورود</a>
          </div>
        </details>

        <a className="az-mobile-search" href="#archive-search" aria-label="جست‌وجو">
          <SearchIcon />
        </a>
      </header>

      <section className="az-hero" id="top">
        <div className="az-hero-landscape" aria-hidden="true">
          <div className="az-snow-range az-snow-range-a" />
          <div className="az-snow-range az-snow-range-b" />
          <div className="az-hill" />
          <div className="az-fortress">
            <i /><i /><i /><i /><i />
          </div>
          <blockquote>
            «میراث گذشته،<br />سرمایه آینده ماست»
            <span />
          </blockquote>
        </div>

        <div className="az-hero-copy">
          <p className="az-eyebrow">{settings.hero.eyebrow}</p>
          <h1>{highlightedTitle}</h1>
          <p className="az-hero-lead">{settings.hero.description}</p>
          <div className="az-hero-actions">
            <a className="az-btn az-btn-primary" href="#archive-search">
              جستجوی آرشیف <SearchIcon />
            </a>
            <a className="az-btn az-btn-secondary" href="/about">
              درباره بنیاد <ArrowLeft />
            </a>
          </div>
        </div>

        <div className="az-hero-archive" aria-hidden="true">
          <div className="az-stone-arch" />
          <div className="az-book-stack">
            <i /><i /><i /><i />
          </div>
          <div className="az-identity-book">
            <span>تاریخ</span>
            <span>هویت</span>
            <span>آگاهی</span>
            <span>آینده</span>
            <b />
          </div>
          <div className="az-manuscript" />
          <div className="az-side-motto">
            از<br />گذشته<br />برای<br />آینده<br />روشن‌تر
            <span />
          </div>
        </div>
      </section>

      <section className="az-feature-grid">
        <article className="az-feature-card az-council-card" id="council">
          <div className="az-feature-copy">
            <p className="az-kicker">پرونده محوری</p>
            <h2>{settings.council.kicker}</h2>
            <span className="sr-only">{settings.council.title}</span>
            <p>{settings.council.text}</p>
            <a className="az-btn az-btn-primary az-btn-small" href="/archive">
              ورود به پرونده <ArrowLeft />
            </a>
          </div>

          <figure className="az-council-visual" aria-label={settings.media.councilEmblemAlt}>
            <div className="az-archive-photo">
              <div className="az-photo-building">
                <span className="az-photo-flag" />
                <i /><i /><i /><i /><i /><i /><i />
              </div>
              <div className="az-photo-crowd">
                {Array.from({ length: 18 }).map((_, index) => <i key={index} />)}
              </div>
            </div>
            <img className="az-council-seal" src={settings.media.councilEmblemUrl} alt={settings.media.councilEmblemAlt} />
            <figcaption>{settings.media.councilEmblemCaption}</figcaption>
          </figure>
        </article>

        <article className="az-feature-card az-leader-card" id="beheshti">
          <div className="az-leader-copy">
            <p className="az-kicker">پرونده ویژه</p>
            <h2>{settings.leader.title}</h2>
            <strong>{settings.leader.kicker}</strong>
            <p>{settings.leader.lead}</p>
            <a className="az-btn az-btn-outline az-btn-small" href="/beheshti">
              مطالعه پرونده <ArrowLeft />
            </a>
          </div>

          <figure className="az-leader-visual">
            <img src={settings.media.leaderImageUrl} alt={settings.media.leaderImageAlt} />
            <div className="az-leader-paper" aria-hidden="true" />
            <blockquote>
              «اندیشه‌ها<br />ماندگارند.»
              <span />
            </blockquote>
          </figure>
        </article>
      </section>

      <section className="az-search-panel" id="archive-search">
        <div className="az-search-intro">
          <span className="az-book-icon" aria-hidden="true">▤</span>
          <div>
            <h2>جستجوی مرکزی آرشیف</h2>
            <p>هزاران سند تاریخی در دسترس شما</p>
          </div>
        </div>

        <form className="az-search-form" action="/publications" method="get">
          <label className="az-search-field">
            <SearchIcon />
            <input name="q" type="search" placeholder={settings.archive.searchPlaceholder || "جستجو در اسناد، اشخاص، رویدادها…"} />
          </label>

          <select name="topic" defaultValue="">
            <option value="">همه موضوعات</option>
            <option value="council">شورای اتفاق</option>
            <option value="beheshti">آیت‌الله بهشتی</option>
            <option value="history">تاریخ معاصر</option>
          </select>

          <select name="type" defaultValue="all">
            <option value="all">همه دوره‌ها</option>
            <option value="document">اسناد</option>
            <option value="article">مقالات</option>
            <option value="book">کتاب‌ها</option>
            <option value="oral-history">تاریخ شفاهی</option>
          </select>

          <button type="submit">جستجو</button>
        </form>
      </section>

      <section className="az-timeline" aria-labelledby="az-timeline-title">
        <div className="az-timeline-heading">
          <h2 id="az-timeline-title">گزیده‌ای از مسیر تاریخ افغانستان</h2>
          <a href="/archive">بیشتر بدانید <ArrowLeft /></a>
        </div>
        <div className="az-timeline-track">
          {timeline.map((item) => (
            <div className="az-timeline-item" key={item.date}>
              <span />
              <strong>{item.date}</strong>
              <b>{item.label}</b>
              <small>{item.note}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="az-contribute" id="contribute">
        <div className="az-contribute-art" aria-hidden="true">
          <div className="az-old-books"><i /><i /><i /></div>
          <div className="az-old-paper" />
          <div className="az-old-photo" />
        </div>

        <div className="az-contribute-copy">
          <h2>اسناد و خاطرات خود را با ما به اشتراک بگذارید</h2>
          <p>{settings.contribute.text}</p>
          <a className="az-btn az-btn-primary az-btn-small" href="/contribute">
            ارسال سند یا خاطره <UploadIcon />
          </a>
        </div>

        <blockquote>
          «هر سند<br />روایتی است<br />از ما و زمان ما.»
          <span />
        </blockquote>
      </section>

      <footer className="az-footer">
        <div className="az-footer-brand">
          <img src={settings.identity.logoUrl} alt={`لوگوی ${settings.identity.siteName}`} />
          <div>
            <strong>{settings.identity.siteName}</strong>
            <p>{settings.footer.mission}</p>
            <small>تاریخ برای آگاهی، جامعه برای فردا</small>
          </div>
        </div>

        <div className="az-footer-column">
          <strong>دسترسی سریع</strong>
          <a href="#top">صفحه اصلی</a>
          <a href="/about">درباره بنیاد</a>
          <a href="/archive">آرشیف</a>
          <a href="/publications">نشریات</a>
        </div>

        <div className="az-footer-column">
          <strong>منابع پژوهشی</strong>
          <a href="/publications?type=article">مقالات</a>
          <a href="/publications?type=book">کتاب‌ها</a>
          <a href="/publications?type=document">اسناد تاریخی</a>
          <a href="/standards">راهنمای پژوهش</a>
        </div>

        <div className="az-footer-column">
          <strong>با ما در ارتباط باشید</strong>
          {settings.contact.email && <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>}
          <span>{settings.contact.address}</span>
          <a href="/contact">ارسال پیام</a>
        </div>

        <div className="az-footer-quote">
          <p>گذشته چراغ راه آینده است.</p>
          <span />
        </div>

        <small className="az-copyright">© بنیاد آذرخش — {settings.footer.copyright}</small>
      </footer>
    </main>
  );
}
