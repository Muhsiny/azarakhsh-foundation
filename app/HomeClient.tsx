"use client";

import { type CSSProperties } from "react";
import type { SiteSettings } from "./site-settings";

const REAL_BAMYAN_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/a/a6/Sunrise_of_Bamyan_Valley.jpg";
const REAL_BOOKS_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/c/c1/Old_Books_in_the_library.jpg";
const REAL_AFGHAN_ARCHIVES_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/3/30/National_Archives%2C_Afghanistan.jpg";
const REAL_HAZARA_HISTORY_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/d/d1/Hazaras_of_Afghanistan_in_1879-80.jpg";
const PRIOR_SITE_BEHESHTI_PORTRAIT = "/api/media/site%2Fayatollah-beheshti.webp";
const FALLBACK_BEHESHTI_PORTRAIT =
  "https://commons.wikishia.net/w/images/c/c2/%D8%B3%DB%8C%D8%AF_%D8%B9%D9%84%DB%8C_%D8%A8%D9%87%D8%B4%D8%AA%DB%8C_%D9%88%D8%B1%D8%B3%DB%8C_%DB%B2.jpg";

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

function BookIcon() {
  return (
    <svg viewBox="0 0 48 40" aria-hidden="true">
      <path d="M24 34c-5.8-4.2-12.1-5.4-19-3.8V5.5c7-1.5 13.3.1 19 4.7v23.8Z" />
      <path d="M24 34c5.8-4.2 12.1-5.4 19-3.8V5.5c-7-1.5-13.3.1-19 4.7v23.8Z" />
      <path d="M8.5 10.5c4.7-.5 8.8.5 12.3 3M27.2 13.5c3.5-2.5 7.6-3.5 12.3-3" />
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
          <a className="az-search-trigger" href="#archive-search" aria-label="جست‌وجو"><SearchIcon /></a>
          <a className="az-login" href="/login"><UserIcon /><span>ثبت نام / ورود</span></a>
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
        <a className="az-mobile-search" href="#archive-search" aria-label="جست‌وجو"><SearchIcon /></a>
      </header>

      <section className="az-hero" id="top">
        <div className="az-hero-visual">
          <img className="az-hero-landscape" src={REAL_BAMYAN_IMAGE} alt="نمای واقعی بامیان، افغانستان" />
          <div className="az-hero-portrait-card">
            <LeaderPortrait className="az-hero-portrait" />
            <div>
              <strong>آیت‌الله سید علی بهشتی</strong>
              <span>فقیه، مدرس و رئیس شورای انقلابی اتفاق اسلامی افغانستان</span>
            </div>
          </div>
          <div className="az-hero-visual-note">«میراث گذشته، سرمایهٔ فهم آینده است.»</div>
        </div>

        <div className="az-hero-copy">
          <div className="az-bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
          <div className="az-hero-kicker"><span /><p>بنیاد مستقل تاریخ‌پژوهی افغانستان</p><span /></div>
          <h1>تاریخ، آنگاه روشن می‌شود<br /><em>که اسناد سخن بگویند.</em></h1>
          <p className="az-hero-lead">
            بنیاد آذرخش، بستر مستقل گردآوری، حفاظت، ارزیابی و انتشار اسناد و روایت‌های تاریخ افغانستان است؛
            با تمرکز بر پژوهش مسئولانه، آرشیف دیجیتال و دسترسی عمومی به منابع.
          </p>
          <div className="az-hero-actions">
            <a className="az-btn az-btn-primary" href="#archive-search">جستجوی آرشیف <SearchIcon /></a>
            <a className="az-btn az-btn-secondary" href="/about">درباره بنیاد <ArrowLeft /></a>
          </div>
          <div className="az-hero-trust">
            <span>اسناد تاریخی</span><i /> <span>روایت‌های شفاهی</span><i /> <span>پژوهش مستقل</span><i /> <span>آرشیف دیجیتال</span>
          </div>
        </div>
      </section>

      <section className="az-entry-grid" aria-label="دسترسی‌های اصلی">
        <a className="az-entry-card" href="/archive">
          <span className="az-entry-icon"><ArchiveIcon /></span>
          <div><strong>آرشیف</strong><small>جستجو در اسناد، تصاویر و منابع تاریخی</small></div>
        </a>
        <a className="az-entry-card" href="#council">
          <span className="az-entry-icon"><DocumentIcon /></span>
          <div><strong>شورای اتفاق</strong><small>پروندهٔ محوری تاریخ سیاسی و اجتماعی</small></div>
        </a>
        <a className="az-entry-card" href="/beheshti">
          <span className="az-entry-icon az-entry-portrait"><LeaderPortrait /></span>
          <div><strong>آیت‌الله بهشتی</strong><small>زندگی، اندیشه، اسناد و میراث فکری</small></div>
        </a>
        <a className="az-entry-card" href="/standards">
          <span className="az-entry-icon"><ResearchIcon /></span>
          <div><strong>پژوهش‌ها</strong><small>مقالات، تحلیل‌ها و روش‌شناسی پژوهش</small></div>
        </a>
      </section>

      <section className="az-dossiers" aria-labelledby="az-dossiers-title">
        <div className="az-section-heading">
          <p>پرونده‌های منتخب</p>
          <h2 id="az-dossiers-title">تاریخ در متنِ سند</h2>
          <span>دو محور اصلی برای مطالعهٔ عمیق‌تر تاریخ معاصر افغانستان</span>
        </div>

        <div className="az-dossier-grid">
          <article className="az-dossier-card az-council-card" id="council">
            <figure className="az-dossier-media">
              <img src={REAL_AFGHAN_ARCHIVES_IMAGE} alt="نمای واقعی آرشیف ملی افغانستان در کابل" />
              <figcaption>آرشیف ملی افغانستان — تصویر زمینهٔ پرونده پژوهشی</figcaption>
            </figure>
            <div className="az-dossier-copy">
              <p className="az-kicker">پرونده محوری</p>
              <h3>حکومت شورای اتفاق اسلامی افغانستان</h3>
              <p>پرونده‌ای دربارهٔ شکل‌گیری، ساختار، اسناد و روایت‌های شورای انقلابی اتفاق اسلامی افغانستان در بستر تاریخ معاصر کشور.</p>
              <a className="az-text-link" href="/archive">ورود به پرونده <ArrowLeft /></a>
            </div>
          </article>

          <article className="az-dossier-card az-beheshti-card" id="beheshti">
            <div className="az-dossier-copy">
              <p className="az-kicker">پرونده ویژه</p>
              <h3>آیت‌الله سید علی بهشتی</h3>
              <strong>فقیه، مدرس و رئیس شورای انقلابی اتفاق اسلامی افغانستان</strong>
              <p>مروری بر زندگی، تحصیلات حوزوی، فعالیت‌های علمی، رهبری شورای اتفاق و میراث فکری آیت‌الله سید علی بهشتی بر پایهٔ منابع و اسناد قابل ارزیابی.</p>
              <a className="az-text-link" href="/beheshti">مطالعه پرونده <ArrowLeft /></a>
            </div>
            <figure className="az-dossier-book">
              <img src={REAL_BOOKS_IMAGE} alt="کتاب‌های قدیمی آرشیفی" />
              <blockquote>«اندیشه‌ها ماندگارند؛ اگر اسناد، امانت‌دارِ زمان باشند.»</blockquote>
            </figure>
          </article>
        </div>
      </section>

      <section className="az-search-panel" id="archive-search">
        <div className="az-search-intro">
          <span className="az-book-icon" aria-hidden="true"><BookIcon /></span>
          <div>
            <p>آرشیف دیجیتال</p>
            <h2>جستجوی مرکزی آرشیف</h2>
            <span>اسناد، تصاویر، کتاب‌ها و روایت‌های ثبت‌شده</span>
          </div>
        </div>
        <form className="az-search-form" action="/publications" method="get">
          <label className="az-search-field">
            <SearchIcon />
            <input name="q" type="search" placeholder="جستجو در اسناد، اشخاص و رویدادها..." />
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
          <p>مسیر تاریخ</p>
          <h2 id="az-timeline-title">گزیده‌ای از دوره‌های تاریخی افغانستان</h2>
          <a href="/archive">مشاهده آرشیف <ArrowLeft /></a>
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
        <figure className="az-contribute-image-wrap">
          <img src={REAL_HAZARA_HISTORY_IMAGE} alt="عکس تاریخی واقعی از بزرگان هزاره در سده نوزدهم" />
        </figure>
        <div className="az-contribute-copy">
          <p>حافظهٔ مشترک</p>
          <h2>یک سند می‌تواند جای خالی یک نسل را پُر کند.</h2>
          <span>اگر سند، عکس، دست‌نوشته یا روایت تاریخی در اختیار دارید، آن را برای بررسی و نگهداری پژوهشی با بنیاد آذرخش شریک کنید.</span>
          <a className="az-btn az-btn-primary" href="/contribute">ارسال سند یا خاطره <UploadIcon /></a>
        </div>
        <figure className="az-contribute-image-wrap">
          <img src={REAL_BOOKS_IMAGE} alt="کتاب‌های قدیمی آرشیفی" />
        </figure>
      </section>

      <footer className="az-footer">
        <div className="az-footer-main">
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
            <strong>ارتباط با ما</strong>
            {settings.contact.email && <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>}
            <span>{settings.contact.address}</span>
            <a href="/contact">ارسال پیام</a>
          </div>
          <div className="az-footer-quote">
            <p>«گذشته چراغ راه آینده است.»</p>
            <span />
          </div>
        </div>
        <div className="az-footer-bottom">
          <small>© بنیاد آذرخش — {settings.footer.copyright}</small>
          <small>تصاویر عمومی با ذکر منبع و مجوز در صفحهٔ مربوطه استفاده شده‌اند.</small>
        </div>
      </footer>
    </main>
  );
}
