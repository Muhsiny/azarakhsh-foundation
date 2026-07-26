"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  defaultSiteSettings,
  type SiteSettings,
} from "./site-settings";

const archiveCards = [
  {
    index: "۰۱",
    title: "شورای اتفاق",
    text: "بازخوانی ساختار، تصمیم‌ها، نهادها و تجربهٔ حکومت‌داری بر پایهٔ اسناد و روایت‌های قابل ارزیابی.",
    href: "#council",
  },
  {
    index: "۰۲",
    title: "پروندهٔ بهشتی",
    text: "زندگی، اندیشه، رهبری و میراث حضرت آیت‌الله العظمی بهشتی(ره) در آیینهٔ منابع تاریخی.",
    href: "#beheshti",
  },
  {
    index: "۰۳",
    title: "حافظهٔ مردمی",
    text: "گردآوری خاطرات، تصاویر، نامه‌ها و روایت‌های شاهدان برای تکمیل حافظهٔ جمعی هزاره‌جات.",
    href: "#contribute",
  },
];

const researchItems = [
  {
    category: "حکومت‌داری",
    title: "نقشهٔ نهادی شورای اتفاق",
    text: "پرونده‌ای برای بازسازی ساختار تصمیم‌گیری، ادارهٔ محلی و نسبت نهادها با جامعه.",
    code: "AZ/GOV/01",
    status: "در حال گردآوری",
  },
  {
    category: "رهبری",
    title: "آیت‌الله بهشتی و منطق وحدت سیاسی",
    text: "تحلیل زمینه‌ها، گزینه‌های راهبردی و محدودیت‌های رهبری در یکی از پیچیده‌ترین ادوار تاریخی.",
    code: "AZ/LEAD/02",
    status: "طرح پژوهش",
  },
  {
    category: "اسناد",
    title: "نامه‌ها و اعلامیه‌های تشکیلاتی",
    text: "فهرست‌نویسی، اصالت‌سنجی و خوانش انتقادی مکاتبات، فرمان‌ها و متون باقی‌مانده.",
    code: "AZ/DOC/03",
    status: "پذیرش منبع",
  },
  {
    category: "جامعه",
    title: "اقتصاد، معیشت و ادارهٔ محلی",
    text: "پرسش از چگونگی تأمین منابع، نظم بازار، حل اختلاف‌ها و زندگی روزمره در قلمرو شورا.",
    code: "AZ/SOC/04",
    status: "طرح پژوهش",
  },
  {
    category: "جامعه",
    title: "حافظهٔ خانواده‌ها و روایت‌های محلی",
    text: "ثبت روایت‌های چندصدایی از زنان، مردان، عالمان، کارگزاران و شهروندان مناطق مختلف.",
    code: "AZ/ORAL/05",
    status: "فراخوان روایت",
  },
  {
    category: "اسناد",
    title: "اطلس تصویری یک تجربهٔ سیاسی",
    text: "گردآوری تصاویر اشخاص، مکان‌ها، نشست‌ها و آثار مادی همراه با شرح و منشأ روشن.",
    code: "AZ/VIS/06",
    status: "فراخوان تصویر",
  },
];



export default function Home() {
  const [settings, setSettings] =
    useState<SiteSettings>(defaultSiteSettings);
  const [activeFilter, setActiveFilter] = useState("همه");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] =
    useState<(typeof researchItems)[number] | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((response) => response.json())
      .then((data: { settings?: SiteSettings }) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => undefined);
  }, []);

  const visibleItems = useMemo(() => {
    const normalized = query.trim();
    return researchItems.filter((item) => {
      const inFilter =
        activeFilter === "همه" || item.category === activeFilter;
      const inSearch =
        !normalized ||
        `${item.title} ${item.text} ${item.category}`.includes(normalized);
      return inFilter && inSearch;
    });
  }, [activeFilter, query, settings.archive.items]);

  const filters = useMemo(() => [\n    "همه",\n    ...Array.from(new Set(settings.archive.items.map((item) => item.category))),\n  ], [settings.archive.items]);\n\n  const sectionOrder = Object.fromEntries(\n    settings.sectionOrder.map((key, index) => [key, index + 3]),\n  );\n\n  const highlightedTitle = useMemo(() => {
    const word = settings.hero.highlightedWord.trim();
    if (!word || !settings.hero.title.includes(word)) {
      return settings.hero.title;
    }
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
    "--font-persian": settings.design.fontFamily,\n    "--heading-scale": settings.design.headingScale,\n    "--section-space": settings.design.sectionSpacing,\n    "--content-width": `${settings.design.contentWidth}px`,\n    "--card-radius": `${settings.design.cardRadius}px`,\n    "--order-mission": sectionOrder.mission,\n    "--order-council": sectionOrder.council,\n    "--order-timeline": sectionOrder.timeline,\n    "--order-leader": sectionOrder.leader,\n    "--order-archive": sectionOrder.archive,\n    "--order-standards": sectionOrder.standards,\n    "--order-method": sectionOrder.method,\n    "--order-contribute": sectionOrder.contribute,
  } as CSSProperties;
  const hiddenSections = Object.entries(settings.visibility)
    .filter(([, visible]) => !visible)
    .map(([section]) => `hide-${section}`)
    .join(" ");

  return (
    <main
      className={`site-root hero-align-${settings.design.heroAlignment} density-${settings.design.density} header-${settings.design.headerStyle} image-${settings.design.imageStyle} ${hiddenSections}`}
      style={siteStyle}
    >
      {settings.design.customCss && <style>{settings.design.customCss}</style>}
      <header className="site-header">
        <a className="brand" href="#top" aria-label={`صفحهٔ نخست ${settings.identity.siteName}`}>
          <span className="brand-mark">
            <img
              src={settings.identity.logoUrl}
              alt={`لوگوی ${settings.identity.siteName}`}
              width={92}
              height={62}
            />
          </span>
          <span>
            <strong>{settings.identity.siteName}</strong>
            <small>{settings.identity.tagline}</small>
          </span>
        </a>

        <nav aria-label="فهرست اصلی">
          <a href="#mission">{settings.navigation.about}</a>
          <a href="#council">{settings.navigation.council}</a>
          <a href="#beheshti">{settings.navigation.leader}</a>
          <a href="#archive">{settings.navigation.archive}</a>
          <a href="/publications">{settings.navigation.publications}</a>
          <a href="#contribute">{settings.navigation.contribute}</a>
        </nav>

        <a className="header-cta" href="/publications">
          {settings.navigation.cta}
          <span aria-hidden="true">←</span>
        </a>
      </header>

      <section className="hero" id="top">
        <img
          className="hero-logo-watermark"
          src={settings.identity.logoUrl}
          alt=""
          aria-hidden="true"
        />
        <div className="hero-noise" />
        <div className="hero-copy">
          <p className="eyebrow">
            <span />
            {settings.hero.eyebrow}
          </p>
          <h1>{highlightedTitle}</h1>
          <p className="hero-lead">{settings.hero.description}</p>
          <div className="hero-actions">
            <a className="button button-gold" href="#council">
              {settings.hero.primaryButton}
              <span aria-hidden="true">←</span>
            </a>
            <a className="button button-ghost" href="#contribute">
              {settings.hero.secondaryButton}
            </a>
          </div>
          <div className="editorial-note">
            <span className="note-number">اصل ۱</span>
            <p>
              هر ادعا باید از مسیر <strong>منبع، نقد و راستی‌آزمایی</strong>{" "}
              عبور کند.
            </p>
          </div>
        </div>

        <div className="hero-foot">
          <span>پژوهش تاریخی</span>
          <span>آرشیو اسناد</span>
          <span>تاریخ شفاهی</span>
          <span>نقد و تحلیل</span>
        </div>
      </section>

      <section className="mission-strip" id="mission">
        <p className="section-kicker">{settings.mission.kicker}</p>
        <div className="mission-heading">
          <h2>{settings.mission.title}</h2>
          <p>{settings.mission.text}</p>
        </div>

        <div className="archive-grid">
          {settings.mission.cards.map((card, index) => (
            <a className="archive-card" href={card.href} key={card.title}>
              <span className="card-index">{String(index + 1).padStart(2, "۰")}</span>
              <span className="card-line" />
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <span className="card-link">
                {card.label || "گشودن پرونده"} <b aria-hidden="true">←</b>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="council-section" id="council">
        <div className="section-rail" aria-hidden="true">
          <span>پروندهٔ محوری</span>
          <b>۰۱</b>
        </div>
        <div className="council-intro">
          <p className="section-kicker section-kicker-light">
            {settings.council.kicker}
          </p>
          <h2>{settings.council.title}</h2>
          <p>{settings.council.text}</p>
          <a className="text-link" href="#archive">
            مشاهدهٔ نقشهٔ پژوهش <span aria-hidden="true">←</span>
          </a>
        </div>

        <div className="council-visuals">
          <figure className="council-emblem-card">
            <div className="historical-image-frame">
              <img
                src="/api/media/site%2Fshura-e-ettefaq-emblem.webp"
                alt="نشان تاریخی حکومت شورای اتفاق اسلامی افغانستان"
              />
            </div>
            <figcaption>
              <span>سند تصویری</span>
              <strong>نشان تاریخی حکومت شورای اتفاق اسلامی افغانستان</strong>
              <small>نسخهٔ آرشیوی؛ تاریخ و منشأ دقیق در حال تکمیل است.</small>
            </figcaption>
          </figure>

          <div className="council-map" aria-label="محورهای پژوهش شورای اتفاق">
          <div className="map-center">
            <span>شورای اتفاق</span>
            <small>پروندهٔ باز</small>
          </div>
          {settings.council.axes.slice(0, 4).map((axis, index) => (
            <div className={`map-item map-item-${["one", "two", "three", "four"][index]}`} key={axis.id}>
              <b>{axis.title}</b>
              <span>{axis.text}</span>
            </div>
          ))}
          </div>
        </div>
      </section>

      <section className="timeline-section" aria-labelledby="timeline-title">
        <div className="timeline-heading">
          <p className="section-kicker">{settings.timeline.kicker}</p>
          <h2 id="timeline-title">{settings.timeline.title}</h2>
          <p>{settings.timeline.text}</p>
        </div>
        <ol className="timeline">
          {settings.timeline.items.map((item, index) => (
            <li key={item.id}>
              <span className="timeline-dot">
                {["۰۱", "۰۲", "۰۳", "۰۴", "۰۵"][index]}
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="beheshti-section" id="beheshti">
        <figure className="beheshti-portrait">
          <div className="portrait-frame">
            <img
              src="/api/media/site%2Fayatollah-beheshti.webp"
              alt="حضرت آیت‌الله العظمی بهشتی(ره)"
            />
            <span className="portrait-glow" aria-hidden="true" />
          </div>
          <figcaption>
            <span>پروندهٔ رهبر</span>
            <strong>{settings.media.leaderImageAlt}</strong>
          </figcaption>
        </figure>
        <div className="beheshti-copy">
          <p className="section-kicker">{settings.leader.kicker}</p>
          <h2>{settings.leader.title}</h2>
          <p className="beheshti-lead">{settings.leader.lead}</p>
          <div className="inquiry-list">
            {settings.leader.inquiries.map((item, index) => (
              <div key={item.id}>
                <span>{["الف", "ب", "ج", "د", "هـ"][index] || index + 1}</span>
                <p><strong>{item.title}:</strong> {item.text}</p>
              </div>
            ))}
          </div>
          <blockquote>
            {settings.leader.quote}
            <cite>{settings.leader.quoteSource}</cite>
          </blockquote>

          <div className="beheshti-library" aria-label="گنجینهٔ آیت‌الله بهشتی">
            {settings.leader.collections.map((item, index) => (
              <a className="legacy-card" href={item.href} key={item.id}>
                <span>{["۰۱", "۰۲", "۰۳", "۰۴", "۰۵", "۰۶", "۰۷", "۰۸"][index] || index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                </div>
                <b aria-hidden="true">←</b>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="archive-section" id="archive">
        <div className="archive-header">
          <div>
            <p className="section-kicker">گنجینهٔ پژوهش</p>
            <h2>پرونده‌ها و مسیرهای تحقیق</h2>
          </div>
          <label className="archive-search">
            <span className="sr-only">جست‌وجو در پرونده‌ها</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder={settings.archive.searchPlaceholder}
              type="search"
              value={query}
            />
            <span aria-hidden="true">⌕</span>
          </label>
        </div>

        <div className="archive-filters" aria-label="فیلتر موضوعی">
          {filters.map((filter) => (
            <button
              aria-pressed={activeFilter === filter}
              className={activeFilter === filter ? "active" : ""}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="research-grid" aria-live="polite">
          {visibleItems.map((item) => (
            <button
              className="research-card"
              key={item.code}
              onClick={() => setSelectedItem(item)}
              type="button"
            >
              <span className="research-meta">
                <b>{item.category}</b>
                <small>{item.code}</small>
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="research-status">
                <i />
                {item.status}
              </span>
              <span className="research-open" aria-hidden="true">
                ↖
              </span>
            </button>
          ))}
          {visibleItems.length === 0 && (
            <p className="empty-state">
              پرونده‌ای با این عبارت یافت نشد. واژهٔ دیگری را امتحان کنید.
            </p>
          )}
        </div>
      </section>


      <section className="standards-section" id="standards">
        <div className="standards-heading">
          <p className="section-kicker">{settings.standards.kicker}</p>
          <h2>{settings.standards.title}</h2>
          <p>{settings.standards.text}</p>
        </div>
        <div className="standards-grid">
          {settings.standards.items.map((item, index) => (
            <article key={item.id}>
              <span>{["۰۱", "۰۲", "۰۳", "۰۴", "۰۵", "۰۶"][index] || index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
\n      <section className="method-section">
        <div className="method-heading">
          <p className="section-kicker section-kicker-light">{settings.method.kicker}</p>
          <h2>{settings.method.title}</h2>
        </div>
        <div className="method-grid">
          {settings.method.items.map((item, index) => (
            <article key={item.id}>
              <span>{["۰۱", "۰۲", "۰۳", "۰۴"][index]}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contribute-section" id="contribute">
        <div className="contribute-copy">
          <p className="section-kicker">{settings.contribute.kicker}</p>
          <h2>{settings.contribute.title}</h2>
          <p>{settings.contribute.text}</p>
          <button
            className="button button-dark"
            onClick={() => setGuideOpen((open) => !open)}
            type="button"
          >
            {guideOpen ? "بستن راهنما" : settings.contribute.button}
            <span aria-hidden="true">{guideOpen ? "×" : "←"}</span>
          </button>
        </div>
        <div className="contribute-types">
          {settings.contribute.types.map((item) => (
            <div key={item.id}>
              <span>✦</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
        {guideOpen && (
          <div className="submission-guide" id="submission-note">
            <div>
              <span>۱</span>
              <p>نام یا عنوان منبع و نسبت خود با آن را روشن بنویسید.</p>
            </div>
            <div>
              <span>۲</span>
              <p>زمان، مکان و اشخاص حاضر را تا حد ممکن مشخص کنید.</p>
            </div>
            <div>
              <span>۳</span>
              <p>اصل فایل را نگه دارید و تغییرات احتمالی را توضیح دهید.</p>
            </div>
            <div>
              <span>۴</span>
              <p>
                راه ارتباطی رسمی دریافت منابع پس از تأیید دبیرخانه در همین
                قسمت فعال می‌شود.
              </p>
            </div>
          </div>
        )}
      </section>

      <footer>
        <div className="footer-brand">
          <img
            src={settings.identity.logoUrl}
            alt={`لوگوی ${settings.identity.siteName}`}
            width="120"
            height="80"
          />
          <div>
            <strong>{settings.identity.siteName}</strong>
            <p>{settings.identity.tagline}</p>
          </div>
        </div>
        <p className="footer-mission">{settings.footer.mission}</p>
        <div className="footer-links">
          <a href="#mission">دربارهٔ ما</a>
          <a href="#archive">پرونده‌ها</a>
          <a href="/publications">نشرها</a>
          <a href="#contribute">همکاری</a>
          <a href="/admin">مدیریت سایت</a>
          <a href="#top">بازگشت به بالا ↑</a>
        </div>
        <small>{settings.footer.copyright}</small>
      </footer>

      {selectedItem && (
        <div
          aria-labelledby="dialog-title"
          aria-modal="true"
          className="dialog-backdrop"
          role="dialog"
        >
          <div className="archive-dialog">
            <button
              aria-label="بستن"
              className="dialog-close"
              onClick={() => setSelectedItem(null)}
              type="button"
            >
              ×
            </button>
            <p className="section-kicker">{selectedItem.category}</p>
            <h2 id="dialog-title">{selectedItem.title}</h2>
            <p>{selectedItem.text}</p>
            <div className="dialog-rule" />
            <dl>
              <div>
                <dt>شناسه</dt>
                <dd>{selectedItem.code}</dd>
              </div>
              <div>
                <dt>وضعیت</dt>
                <dd>{selectedItem.status}</dd>
              </div>
            </dl>
            <p className="dialog-note">
              این صفحه نقشهٔ نخست پژوهش است. منابع، مقاله‌ها و داده‌های
              راستی‌آزمایی‌شده به‌تدریج به همین پرونده افزوده خواهند شد.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
