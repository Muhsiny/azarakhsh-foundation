"use client";

import { type CSSProperties } from "react";
import type { SiteSettings } from "./site-settings";

const timeline = [
  { date: "قبل از ۱۳۰۰", label: "دوران کلاسیک" },
  { date: "۱۳۰۰ – ۱۳۵۷", label: "تحولات معاصر" },
  { date: "۱۳۵۷ – ۱۳۷۱", label: "جهاد و مقاومت" },
  { date: "۱۳۷۱ – ۱۴۰۰", label: "دوره جدید" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m15.6 15.6 4.4 4.4" />
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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3" />
      <path d="M6.5 19c.5-3.5 2.3-5.5 5.5-5.5s5 2 5.5 5.5" />
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
          <a className="az-search-trigger" href="#archive-search" aria-label="جست‌وجو">
            <SearchIcon />
          </a>
          <a className="az-login" href="/login">
            <UserIcon />
            <span>ثبت نام / ورود</span>
          </a>
        </div>

        <details className="az-mobile-menu">
          <summary aria-label="باز کردن فهرست"><MenuIcon /></summary>
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
        <img className="az-hero-image az-hero-image-left" src="/reference-v2/hero-left.webp" alt="" />
        <div className="az-hero-copy">
          <p className="az-eyebrow">بنیاد مستقل تاریخ‌پژوهی افغانستان</p>
          <h1>
            <span>تاریخ، آنگاه روشن می‌شود</span>
            <em>که اسناد سخن بگویند.</em>
          </h1>
          <p className="az-hero-lead">
            ما در بنیاد آذرخش، متعهد به حفظ مسئولانه، نقد علمی و انتشار منابع تاریخی افغانستان هستیم.
          </p>
          <div className="az-hero-actions">
            <a className="az-btn az-btn-primary" href="#archive-search">
              جستجوی آرشیف <SearchIcon />
            </a>
            <a className="az-btn az-btn-secondary" href="/about">
              درباره بنیاد <ArrowLeft />
            </a>
          </div>
        </div>
        <img className="az-hero-image az-hero-image-right" src="/reference-v2/hero-right.webp" alt="" />
      </section>

      <section className="az-feature-grid">
        <article className="az-feature-card az-council-card" id="council">
          <div className="az-feature-copy">
            <p className="az-kicker">پرونده محوری</p>
            <h2>حکومت شورای اتفاق اسلامی افغانستان</h2>
            <p>
              مروری بر اسناد، شخصیت‌ها، زمینه‌های تاریخی و تلاش‌های حکومت شورای اتفاق اسلامی افغانستان در یک مجموعه پژوهشی.
            </p>
            <a className="az-btn az-btn-primary az-btn-small" href="/archive">
              ورود به پرونده <ArrowLeft />
            </a>
          </div>
          <figure className="az-council-visual" aria-label="تصویر آرشیوی شورای اتفاق اسلامی افغانستان">
            <img className="az-card-photo az-council-photo" src="/reference-v2/council-photo.webp" alt="تصویر تاریخی مرتبط با شورای اتفاق اسلامی افغانستان" />
            <img className="az-council-seal" src={settings.media.councilEmblemUrl} alt={settings.media.councilEmblemAlt} />
            <figcaption>کابل ـ ۱۳۵۷ | آرشیف بنیاد آذرخش</figcaption>
          </figure>
        </article>

        <article className="az-feature-card az-leader-card" id="beheshti">
          <div className="az-leader-copy">
            <p className="az-kicker">پرونده ویژه</p>
            <h2>آیت‌الله سید علی بهشتی</h2>
            <strong>رهبر، متفکر و مجاهد امت</strong>
            <p>
              مروری بر زندگی، اندیشه‌ها، مبارزات و میراث علمی آیت‌الله سید علی بهشتی، از چهره‌های برجسته نهضت اسلامی افغانستان.
            </p>
            <a className="az-btn az-btn-outline az-btn-small" href="/beheshti">
              مطالعه پرونده <ArrowLeft />
            </a>
          </div>
          <figure className="az-leader-visual">
            <img src="/reference-v2/leader-clean.webp" alt={settings.media.leaderImageAlt} />
            <blockquote>«اندیشه‌ها<br />ماندگارند.»<span /></blockquote>
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
            <input name="q" type="search" placeholder="جستجو در اسناد، اشخاص، رویدادها ..." />
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
              <small>{item.label}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="az-contribute" id="contribute">
        <div className="az-contribute-art" aria-hidden="true">
          <img className="az-contribute-image az-contribute-left" src="/reference-v2/contribute-left.webp" alt="" />
        </div>
        <div className="az-contribute-copy">
          <h2>اسناد و خاطرات خود را با ما به اشتراک بگذارید</h2>
          <p>اگر سند، تصویر، خاطره یا روایت تاریخی در اختیار دارید، در حفظ تاریخ افغانستان با ما همکاری کنید.</p>
          <a className="az-btn az-btn-primary az-btn-small" href="/contribute">
            ارسال سند یا خاطره <UploadIcon />
          </a>
        </div>
        <div className="az-contribute-side" aria-hidden="true">
          <img className="az-contribute-image az-contribute-right" src="/reference-v2/contribute-right.webp" alt="" />
        </div>
      </section>

      <footer className="az-footer">
        <div className="az-footer-brand">
          <img src={settings.identity.logoUrl} alt={`لوگوی ${settings.identity.siteName}`} />
          <div>
            <strong>{settings.identity.siteName}</strong>
            <p>{settings.footer.mission}</p>
            <small>تاریخ برای آگاهی، جامعه برای فردا</small>
            <div className="az-socials" aria-label="شبکه‌های اجتماعی">
              <span aria-hidden="true">✈</span>
              <span aria-hidden="true">𝕏</span>
              <span aria-hidden="true">▶</span>
              <span aria-hidden="true">◎</span>
              <span aria-hidden="true">f</span>
            </div>
          </div>
        </div>

        <div className="az-footer-column">
          <strong>دسترسی سریع</strong>
          <a href="#top">صفحه اصلی</a>
          <a href="/about">درباره بنیاد</a>
          <a href="/publications">نشریات</a>
          <a href="/archive">آرشیف</a>
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

        <div className="az-footer-quote"><p>گذشته چراغ راه آینده است.</p><span /></div>
        <small className="az-copyright">© بنیاد آذرخش — {settings.footer.copyright}</small>
      </footer>
    </main>
  );
}
