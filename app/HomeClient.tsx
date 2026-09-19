"use client";

import { type CSSProperties } from "react";
import type { SiteSettings } from "./site-settings";

const REAL_BOOKS_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/c/c1/Old_Books_in_the_library.jpg";
const REAL_AFGHAN_ARCHIVES_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/3/30/National_Archives%2C_Afghanistan.jpg";
const REAL_HAZARA_HISTORY_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/d/d1/Hazaras_of_Afghanistan_in_1879-80.jpg";
const PRIOR_SITE_BEHESHTI_PORTRAIT = "/media/beheshti-original.webp";
const FALLBACK_BEHESHTI_PORTRAIT =
  "https://commons.wikishia.net/w/images/c/c2/%D8%B3%DB%8C%D8%AF_%D8%B9%D9%84%DB%8C_%D8%A8%D9%87%D8%B4%D8%AA%DB%8C_%D9%88%D8%B1%D8%B3%DB%8C_%DB%B2.jpg";

const timeline = [
  { date: "پیش از ۱۳۰۰", label: "زمینه‌های تاریخی" },
  { date: "۱۳۰۰–۱۳۵۷", label: "تحولات معاصر" },
  { date: "۱۳۵۷–۱۳۷۱", label: "جهاد و مقاومت" },
  { date: "۱۳۷۱–۱۴۰۰", label: "دورهٔ جدید" },
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

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v4H4zM6 9v10h12V9" />
      <path d="M9 13h6" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5M10 12h5M10 16h5" />
    </svg>
  );
}

function ResearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19V9M12 19V5M19 19v-7" />
      <path d="M3 19h18" />
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

function LeaderPortrait({ className = "" }: { className?: string }) {
  return (
    <img
      className={className}
      src={PRIOR_SITE_BEHESHTI_PORTRAIT}
      alt="پرترهٔ آیت‌الله سید علی بهشتی"
      onError={(event) => {
        const target = event.currentTarget;
        if (target.dataset.fallback !== "1") {
          target.dataset.fallback = "1";
          target.src = FALLBACK_BEHESHTI_PORTRAIT;
        }
      }}
    />
  );
}

export default function HomeClient({ settings }: { settings: SiteSettings }) {
  const siteStyle = {
    "--az-green": settings.colors.primary,
    "--az-green-deep": settings.colors.dark,
    "--az-gold": settings.colors.gold,
  } as CSSProperties;

  return (
    <main className="site-root azarakhsh-approved" style={siteStyle} dir="rtl">
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
          <a href="/contact">تماس</a>
        </nav>

        <div className="az-header-tools">
          <a className="az-search-trigger" href="#archive-search" aria-label="جست‌وجو"><SearchIcon /></a>
          <a className="az-login" href="/login">ورود / عضویت</a>
        </div>

        <details className="az-mobile-menu">
          <summary aria-label="باز کردن فهرست"><MenuIcon /></summary>
          <div>
            <a href="#top">صفحه اصلی</a>
            <a href="/archive">آرشیف</a>
            <a href="/about">درباره بنیاد</a>
            <a href="/publications">نشریات</a>
            <a href="/standards">پژوهش‌ها</a>
            <a href="/contact">تماس</a>
            <a href="/login">ورود / عضویت</a>
          </div>
        </details>
        <a className="az-mobile-search" href="#archive-search" aria-label="جست‌وجو"><SearchIcon /></a>
      </header>

      <section className="az-hero" id="top">
        <div className="az-hero-copy">
          <div className="az-bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
          <p className="az-eyebrow">بنیاد مستقل تاریخ‌پژوهی افغانستان</p>
          <h1>تاریخ، آنگاه روشن می‌شود<br /><em>که اسناد سخن بگویند.</em></h1>
          <p className="az-hero-lead">
            بنیاد آذرخش برای گردآوری، حفاظت، نقد منبع و انتشار مسئولانهٔ اسناد و روایت‌های تاریخ افغانستان فعالیت می‌کند؛ با تمرکز بر آرشیف دیجیتال، تاریخ شفاهی و پژوهش مستند.
          </p>
          <div className="az-hero-actions">
            <a className="az-btn az-btn-primary" href="#archive-search">جستجوی آرشیف <SearchIcon /></a>
            <a className="az-btn az-btn-secondary" href="/about">شناخت بنیاد <ArrowLeft /></a>
          </div>
          <div className="az-hero-meta">
            <span>اسناد تاریخی</span>
            <span>تاریخ شفاهی</span>
            <span>پژوهش مستقل</span>
          </div>
        </div>

        <figure className="az-leader-stage">
          <div className="az-leader-halo" />
          <LeaderPortrait className="az-leader-main" />
          <figcaption>
            <strong>آیت‌الله سید علی بهشتی</strong>
            <span>فقیه، مدرس و رئیس شورای انقلابی اتفاق اسلامی افغانستان</span>
          </figcaption>
        </figure>
      </section>

      <section className="az-pillars" aria-label="محورهای اصلی بنیاد">
        <a href="/archive">
          <span><ArchiveIcon /></span>
          <div><strong>آرشیف</strong><small>اسناد، تصاویر و منابع تاریخی</small></div>
        </a>
        <a href="#council">
          <span><DocumentIcon /></span>
          <div><strong>پرونده‌های تاریخی</strong><small>مطالعهٔ مستند موضوعات محوری</small></div>
        </a>
        <a href="/standards">
          <span><ResearchIcon /></span>
          <div><strong>پژوهش</strong><small>مقاله، تحلیل و روش‌شناسی</small></div>
        </a>
      </section>

      <section className="az-search-spotlight" id="archive-search">
        <div className="az-search-heading">
          <p>آرشیف دیجیتال بنیاد</p>
          <h2>هرچه می‌خواهید، در آرشیف جستجو کنید.</h2>
          <span>نام، سند، شخص، مکان یا رویداد را وارد کنید.</span>
        </div>
        <form className="az-search-form" action="/publications" method="get">
          <label className="az-search-field">
            <SearchIcon />
            <input name="q" type="search" placeholder="جستجو در آرشیف آذرخش..." />
          </label>
          <select name="topic" defaultValue="">
            <option value="">همه موضوعات</option>
            <option value="council">شورای اتفاق</option>
            <option value="beheshti">آیت‌الله بهشتی</option>
            <option value="history">تاریخ معاصر</option>
          </select>
          <select name="type" defaultValue="all">
            <option value="all">همه منابع</option>
            <option value="document">اسناد</option>
            <option value="article">مقالات</option>
            <option value="book">کتاب‌ها</option>
            <option value="oral-history">تاریخ شفاهی</option>
          </select>
        </form>
      </section>

      <section className="az-dossiers" aria-labelledby="dossiers-title">
        <div className="az-section-title">
          <p>پرونده‌های منتخب</p>
          <h2 id="dossiers-title">تاریخ در متنِ سند</h2>
        </div>

        <div className="az-dossier-grid">
          <article className="az-dossier-card" id="council">
            <figure>
              <img src={REAL_AFGHAN_ARCHIVES_IMAGE} alt="نمای آرشیف ملی افغانستان در کابل" />
              <figcaption>آرشیف ملی افغانستان، کابل</figcaption>
            </figure>
            <div className="az-dossier-copy">
              <p>پرونده محوری</p>
              <h3>حکومت شورای اتفاق اسلامی افغانستان</h3>
              <span>شکل‌گیری، ساختار، اسناد و روایت‌های شورای انقلابی اتفاق اسلامی افغانستان در بستر تاریخ معاصر کشور.</span>
              <a href="/archive">ورود به پرونده <ArrowLeft /></a>
            </div>
          </article>

          <article className="az-dossier-card az-dossier-card-reverse">
            <figure>
              <img src={REAL_BOOKS_IMAGE} alt="کتاب‌های قدیمی آرشیفی" />
              <figcaption>منابع مکتوب و آرشیفی</figcaption>
            </figure>
            <div className="az-dossier-copy">
              <p>پرونده ویژه</p>
              <h3>آیت‌الله سید علی بهشتی</h3>
              <span>زندگی، تحصیلات حوزوی، فعالیت‌های علمی، رهبری شورای اتفاق و میراث فکری بر پایهٔ منابع و اسناد قابل ارزیابی.</span>
              <a href="/beheshti">مطالعه پرونده <ArrowLeft /></a>
            </div>
          </article>
        </div>
      </section>

      <section className="az-timeline">
        <div className="az-section-title az-section-title-inline">
          <div>
            <p>مسیر تاریخ</p>
            <h2>گزیده‌ای از دوره‌های تاریخی افغانستان</h2>
          </div>
          <a href="/archive">مشاهدهٔ آرشیف <ArrowLeft /></a>
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

      <section className="az-contribute">
        <figure>
          <img src={REAL_HAZARA_HISTORY_IMAGE} alt="عکس تاریخی واقعی از بزرگان هزاره در سده نوزدهم" />
        </figure>
        <div className="az-contribute-copy">
          <p>حافظهٔ مشترک</p>
          <h2>هر سند می‌تواند بخشی از حافظهٔ تاریخی را حفظ کند.</h2>
          <span>اگر سند، عکس، دست‌نوشته یا روایت تاریخی در اختیار دارید، می‌توانید آن را برای ارزیابی، ثبت و نگهداری پژوهشی با بنیاد آذرخش شریک کنید.</span>
          <a className="az-btn az-btn-primary" href="/contribute">ارسال سند یا خاطره <UploadIcon /></a>
        </div>
      </section>

      <footer className="az-footer">
        <div className="az-footer-top">
          <div className="az-footer-brand">
            <img src={settings.identity.logoUrl} alt={`لوگوی ${settings.identity.siteName}`} />
            <div>
              <strong>{settings.identity.siteName}</strong>
              <p>{settings.footer.mission}</p>
            </div>
          </div>
          <div>
            <strong>دسترسی</strong>
            <a href="/archive">آرشیف</a>
            <a href="/publications">نشریات</a>
            <a href="/about">درباره بنیاد</a>
          </div>
          <div>
            <strong>پژوهش</strong>
            <a href="/standards">معیارهای پژوهش</a>
            <a href="/publications?type=document">اسناد تاریخی</a>
            <a href="/publications?type=article">مقالات</a>
          </div>
          <div>
            <strong>ارتباط</strong>
            {settings.contact.email && <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>}
            <a href="/contact">ارسال پیام</a>
          </div>
        </div>
        <div className="az-footer-bottom">
          <small>{settings.footer.copyright}</small>
          <span>گذشته برای فهم آینده.</span>
        </div>
      </footer>
    </main>
  );
}
