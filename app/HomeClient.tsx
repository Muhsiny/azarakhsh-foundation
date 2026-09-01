"use client";

import { type CSSProperties, useMemo, useState } from "react";
import type { SiteSettings } from "./site-settings";

export default function HomeClient({ settings }: { settings: SiteSettings }) {
  const [guideOpen, setGuideOpen] = useState(false);

  const sectionOrder = Object.fromEntries(settings.sectionOrder.map((key, index) => [key, index + 3]));

  const highlightedTitle = useMemo(() => {
    const word = settings.hero.highlightedWord.trim();
    if (!word || !settings.hero.title.includes(word)) return settings.hero.title;
    const [before, ...after] = settings.hero.title.split(word);
    return <>{before}<em>{word}</em>{after.join(word)}</>;
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
    "--section-space": settings.design.sectionSpacing,
    "--content-width": `${settings.design.contentWidth}px`,
    "--card-radius": `${settings.design.cardRadius}px`,
    "--order-mission": sectionOrder.mission,
    "--order-council": sectionOrder.council,
    "--order-leader": sectionOrder.leader,
    "--order-archive": sectionOrder.archive,
    "--order-standards": sectionOrder.standards,
    "--order-contribute": sectionOrder.contribute,
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
            <img src={settings.identity.logoUrl} alt={`لوگوی ${settings.identity.siteName}`} width={92} height={62} />
          </span>
          <span><strong>{settings.identity.siteName}</strong><small>{settings.identity.tagline}</small></span>
        </a>

        <nav aria-label="فهرست اصلی">
          <a href="/about">{settings.navigation.about}</a>
          <a href="#council">{settings.navigation.council}</a>
          <a href="/beheshti">{settings.navigation.leader}</a>
          <a href="/archive">{settings.navigation.archive}</a>
          <a href="/publications">{settings.navigation.publications}</a>
          <a href="/join">عضویت</a>
        </nav>

        <a className="header-cta" href="#contribute">
          {settings.navigation.contribute}<span aria-hidden="true">←</span>
        </a>

        <details className="mobile-menu">
          <summary aria-label="بازکردن فهرست">فهرست</summary>
          <div>
            <a href="/about">{settings.navigation.about}</a>
            <a href="#council">{settings.navigation.council}</a>
            <a href="/beheshti">{settings.navigation.leader}</a>
            <a href="/archive">{settings.navigation.archive}</a>
            <a href="/publications">{settings.navigation.publications}</a>
            <a href="#contribute">{settings.navigation.contribute}</a>
            <a href="/join">عضویت</a>
          </div>
        </details>
      </header>

      <section className="hero" id="top">
        <img className="hero-logo-watermark" src={settings.identity.logoUrl} alt="" aria-hidden="true" />
        <div className="hero-noise" />
        <div className="hero-copy">
          <p className="eyebrow"><span />{settings.hero.eyebrow}</p>
          <h1>{highlightedTitle}</h1>
          <p className="hero-lead">{settings.hero.description}</p>
          <div className="hero-actions">
            <a className="button button-gold" href="#council">{settings.hero.primaryButton}<span aria-hidden="true">←</span></a>
            <a className="button button-ghost" href="#contribute">{settings.hero.secondaryButton}</a>
          </div>
          <div className="editorial-note">
            <span className="note-number">اصل بنیاد</span>
            <p>{settings.hero.principle}</p>
          </div>
        </div>
        <div className="hero-foot">
          <span>پژوهش تاریخی</span><span>آرشیو اسناد</span><span>تاریخ شفاهی</span><span>نقد و تحلیل</span>
        </div>
      </section>

      <section className="mission-strip" id="mission">
        <p className="section-kicker">{settings.mission.kicker}</p>
        <div className="mission-heading">
          <h2>{settings.mission.title}</h2>
          <p>{settings.mission.text}</p>
        </div>
        <div className="archive-grid">
          {settings.mission.cards.slice(0, 3).map((card, index) => (
            <a className="archive-card" href={card.href} key={card.id}>
              <span className="card-index">{["۰۱", "۰۲", "۰۳"][index]}</span>
              <span className="card-line" />
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <span className="card-link">{card.label || "ورود به بخش"} <b aria-hidden="true">←</b></span>
            </a>
          ))}
        </div>
      </section>

      <section className="council-section" id="council">
        <div className="section-rail" aria-hidden="true"><span>پروندهٔ محوری</span><b>۰۱</b></div>
        <div className="council-intro">
          <p className="section-kicker section-kicker-light">{settings.council.kicker}</p>
          <h2>{settings.council.title}</h2>
          <p>{settings.council.text}</p>
          <a className="text-link" href="/archive">ورود به پرونده‌های شورای اتفاق <span aria-hidden="true">←</span></a>
        </div>
        <div className="council-visuals">
          <figure className="council-emblem-card">
            <div className="historical-image-frame">
              <img src={settings.media.councilEmblemUrl} alt={settings.media.councilEmblemAlt} />
            </div>
            <figcaption>
              <span>سند تصویری</span>
              <strong>{settings.media.councilEmblemAlt}</strong>
              <small>{settings.media.councilEmblemCaption}</small>
            </figcaption>
          </figure>
          <div className="council-map" aria-label="محورهای پژوهش شورای اتفاق">
            <div className="map-center"><span>{settings.council.mapTitle}</span><small>{settings.council.mapStatus}</small></div>
            {settings.council.axes.slice(0, 4).map((axis, index) => (
              <div className={`map-item map-item-${["one", "two", "three", "four"][index]}`} key={axis.id}>
                <b>{axis.title}</b><span>{axis.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="beheshti-section" id="beheshti">
        <figure className="beheshti-portrait">
          <div className="portrait-frame">
            <img src={settings.media.leaderImageUrl} alt={settings.media.leaderImageAlt} />
            <span className="portrait-glow" aria-hidden="true" />
          </div>
          <figcaption><span>پروندهٔ رهبر</span><strong>{settings.media.leaderImageAlt}</strong></figcaption>
        </figure>
        <div className="beheshti-copy">
          <p className="section-kicker">{settings.leader.kicker}</p>
          <h2>{settings.leader.title}</h2>
          <p className="beheshti-lead">{settings.leader.lead}</p>
          <div className="inquiry-list">
            {settings.leader.inquiries.slice(0, 3).map((item, index) => (
              <div key={item.id}><span>{["الف", "ب", "ج"][index]}</span><p><strong>{item.title}:</strong> {item.text}</p></div>
            ))}
          </div>
          <blockquote>{settings.leader.quote}<cite>{settings.leader.quoteSource}</cite></blockquote>
          <div className="beheshti-library" aria-label="گنجینهٔ آیت‌الله بهشتی">
            {settings.leader.collections.slice(0, 4).map((item, index) => (
              <a className="legacy-card" href={item.href} key={item.id}>
                <span>{["۰۱", "۰۲", "۰۳", "۰۴"][index]}</span>
                <div><strong>{item.title}</strong><small>{item.text}</small></div><b aria-hidden="true">←</b>
              </a>
            ))}
          </div>
          <a className="text-link" href="/beheshti">مشاهدهٔ پروندهٔ کامل <span aria-hidden="true">←</span></a>
        </div>
      </section>

      <section className="archive-section" id="archive">
        <div className="archive-header">
          <div><p className="section-kicker">{settings.archive.kicker}</p><h2>{settings.archive.title}</h2></div>
          <a className="button button-dark" href="/archive">مشاهدهٔ آرشیو کامل</a>
        </div>
        <div className="research-grid">
          {settings.archive.items.slice(0, 4).map((item) => (
            <a className="research-card" href="/archive" key={item.code}>
              <span className="research-meta"><b>{item.category}</b><small>{item.code}</small></span>
              <h3>{item.title}</h3><p>{item.text}</p>
              <span className="research-status"><i />{item.status}</span><span className="research-open" aria-hidden="true">↖</span>
            </a>
          ))}
        </div>
      </section>

      <section className="standards-section" id="standards">
        <div className="standards-heading">
          <p className="section-kicker">{settings.standards.kicker}</p>
          <h2>{settings.standards.title}</h2>
          <p>{settings.standards.text}</p>
        </div>
        <div className="standards-grid">
          {settings.standards.items.slice(0, 4).map((item, index) => (
            <article key={item.id}><span>{["۰۱", "۰۲", "۰۳", "۰۴"][index]}</span><h3>{item.title}</h3><p>{item.text}</p></article>
          ))}
        </div>
        <p><a className="text-link" href="/standards">مطالعهٔ منشور کامل پژوهش <span aria-hidden="true">←</span></a></p>
      </section>

      <section className="contribute-section" id="contribute">
        <div className="contribute-copy">
          <p className="section-kicker">{settings.contribute.kicker}</p>
          <h2>{settings.contribute.title}</h2>
          <p>{settings.contribute.text}</p>
          <button className="button button-dark" onClick={() => setGuideOpen((open) => !open)} type="button">
            {guideOpen ? "بستن راهنما" : settings.contribute.button}<span aria-hidden="true">{guideOpen ? "×" : "←"}</span>
          </button>
        </div>
        <div className="contribute-types">
          {settings.contribute.types.slice(0, 4).map((item) => <div key={item.id}><span>✦</span><h3>{item.title}</h3><p>{item.text}</p></div>)}
        </div>
        {guideOpen && (
          <div className="submission-guide" id="submission-note">
            <div><span>۱</span><p>نام یا عنوان منبع و نسبت خود با آن را روشن بنویسید.</p></div>
            <div><span>۲</span><p>زمان، مکان و اشخاص حاضر را تا حد ممکن مشخص کنید.</p></div>
            <div><span>۳</span><p>اصل فایل را نگه دارید و تغییرات احتمالی را توضیح دهید.</p></div>
            <div><span>۴</span><p>پیش از انتشار، رضایت صاحب منبع و شیوهٔ ذکر نام او مشخص می‌شود.</p></div>
          </div>
        )}
        <div className="contact-details" aria-label="راه‌های ارتباط رسمی">
          {settings.contact.email && <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>}
          {settings.contact.phone && <a href={`tel:${settings.contact.phone}`}>{settings.contact.phone}</a>}
          <span>{settings.contact.address}</span>
          {settings.contact.website && <a href={settings.contact.website}>شبکهٔ رسمی بنیاد</a>}
          <a href="/join">درخواست عضویت پژوهشی ←</a>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <img src={settings.identity.logoUrl} alt={`لوگوی ${settings.identity.siteName}`} width="120" height="80" />
          <div><strong>{settings.identity.siteName}</strong><p>{settings.identity.tagline}</p></div>
        </div>
        <p className="footer-mission">{settings.footer.mission}</p>
        <div className="footer-links">
          <a href="/about">دربارهٔ بنیاد</a><a href="/archive">پرونده‌ها</a><a href="/publications">نشرها</a>
          <a href="#contribute">همکاری و تماس</a><a href="/join">عضویت</a><a href="/admin">مدیریت سایت</a><a href="#top">بازگشت به بالا ↑</a>
        </div>
        <small>{settings.footer.copyright}</small>
      </footer>
    </main>
  );
}
