"use client";

import { type CSSProperties } from "react";
import type { SiteSettings } from "./site-settings";

const REAL_BOOKS_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/c/c1/Old_Books_in_the_library.jpg";
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

const standards = [
  "منبع‌سنجی",
  "ارجاع روشن",
  "حفظ اصل سند",
  "تفکیک سند و روایت",
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
          <a href="/publications">نشریات</a>
          <a href="/standards">پژوهش‌ها</a>
          <a href="/about">درباره بنیاد</a>
          <a href="/contact">تماس</a>
        </nav>

        <div className="az-header-tools">
          <a className="az-header-search" href="#archive-search" aria-label="جست‌وجو"><SearchIcon /></a>
          <a className="az-login" href="/login">ورود / عضویت</a>
        </div>

        <details className="az-mobile-menu">
          <summary aria-label="باز کردن فهرست"><MenuIcon /></summary>
          <div>
            <a href="#top">صفحه اصلی</a>
            <a href="/archive">آرشیف</a>
            <a href="/publications">نشریات</a>
            <a href="/standards">پژوهش‌ها</a>
            <a href="/about">درباره بنیاد</a>
            <a href="/contact">تماس</a>
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
            <a className="az-link-arrow" href="/about">شناخت بنیاد <ArrowLeft /></a>
          </div>
        </div>

        <figure className="az-leader-stage">
          <LeaderPortrait className="az-leader-main" />
          <figcaption>
            <span>پروندهٔ رهبری</span>
            <strong>آیت‌الله سید علی بهشتی</strong>
            <small>فقیه، مدرس و رئیس شورای انقلابی اتفاق اسلامی افغانستان</small>
          </figcaption>
        </figure>
      </section>

      <section className="az-research-strip" aria-label="معیارهای پژوهش">
        <div className="az-research-strip-title">
          <span>روش پژوهش</span>
          <a href="/standards">معیارهای پژوهش <ArrowLeft /></a>
        </div>
        <div className="az-research-principles">
          {standards.map((item, index) => (
            <div key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span></div>
          ))}
        </div>
      </section>

      <section className="az-search-spotlight" id="archive-search">
        <div className="az-search-heading">
          <p>آرشیف دیجیتال بنیاد</p>
          <h2>جستجو، نقطهٔ آغاز پژوهش است.</h2>
          <span>نام، سند، شخص، مکان یا رویداد را جستجو کنید.</span>
        </div>
        <form className="az-search-form" action="/publications" method="get">
          <label className="az-search-field">
            <SearchIcon />
            <input name="q" type="search" placeholder="در آرشیف آذرخش جستجو کنید..." />
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
        <div className="az-search-links">
          <a href="/archive">مرور کامل آرشیف <ArrowLeft /></a>
          <a href="/publications">تازه‌ترین منابع <ArrowLeft /></a>
        </div>
      </section>

      <section className="az-featured" aria-labelledby="featured-title">
        <div className="az-section-heading">
          <p>پرونده‌های منتخب</p>
          <h2 id="featured-title">دو مسیر برای خواندن تاریخ</h2>
          <span>نه از روی روایت‌های پراکنده؛ از دل سند، زمینه و منبع.</span>
        </div>

        <article className="az-feature-row az-council-feature">
          <div className="az-feature-visual az-council-plate">
            <img src={settings.media.councilEmblemUrl} alt={settings.media.councilEmblemAlt} />
            <div className="az-council-rule" />
            <span>پروندهٔ محوری</span>
            <strong>شورای اتفاق اسلامی افغانستان</strong>
            <small>اسناد، ساختار، شخصیت‌ها و روایت‌ها</small>
          </div>
          <div className="az-feature-copy">
            <p>پرونده محوری</p>
            <h3>حکومت شورای اتفاق اسلامی افغانستان</h3>
            <span>
              بازخوانی شکل‌گیری، ساختار، اسناد و روایت‌های شورای انقلابی اتفاق اسلامی افغانستان در بستر تاریخ معاصر کشور؛ با تفکیک میان سند، روایت و تحلیل.
            </span>
            <a className="az-link-arrow" href="/archive">ورود به پرونده <ArrowLeft /></a>
          </div>
        </article>

        <article className="az-feature-row az-beheshti-feature">
          <figure className="az-feature-visual az-books-visual">
            <img src={REAL_BOOKS_IMAGE} alt="کتاب‌ها و منابع آرشیفی" />
            <figcaption>منابع مکتوب و آرشیفی</figcaption>
          </figure>
          <div className="az-feature-copy">
            <p>پرونده ویژه</p>
            <h3>آیت‌الله سید علی بهشتی</h3>
            <span>
              زندگی، تحصیلات حوزوی، فعالیت‌های علمی، رهبری شورای اتفاق و میراث فکری؛ بر پایهٔ منابع، اسناد و روایت‌های قابل ارزیابی.
            </span>
            <a className="az-link-arrow" href="/beheshti">مطالعه پرونده <ArrowLeft /></a>
          </div>
        </article>
      </section>

      <section className="az-timeline">
        <div className="az-section-heading az-section-heading-row">
          <div>
            <p>مسیر تاریخ</p>
            <h2>دوره‌ها را مرور کنید</h2>
          </div>
          <a className="az-link-arrow" href="/archive">مشاهدهٔ آرشیف <ArrowLeft /></a>
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
          <span>
            اگر سند، عکس، دست‌نوشته یا روایت تاریخی در اختیار دارید، می‌توانید آن را برای ارزیابی، ثبت و نگهداری پژوهشی با بنیاد آذرخش شریک کنید.
          </span>
          <a className="az-btn az-btn-light" href="/contribute">ارسال سند یا خاطره <UploadIcon /></a>
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
