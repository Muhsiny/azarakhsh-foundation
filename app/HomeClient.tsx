"use client";

import type { SiteSettings } from "./site-settings";

export default function HomeClient({ settings }: { settings: SiteSettings }) {
  return (
    <main className="az-home azarakhsh-approved">
      <section className="az-home-hero" id="top">
        <div className="az-container az-hero-grid">
          <div className="az-hero-text">
            <span className="az-overline">{settings.hero.eyebrow}</span>
            <div className="az-basmala">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
            <h1>{settings.hero.title}</h1>
            <p>{settings.hero.description}</p>
            <div className="az-actions"><a className="az-action az-action-gold" href="/council">مطالعهٔ پروندهٔ شورای اتفاق <span aria-hidden="true">←</span></a><a className="az-subtle" href="/about">شناخت بنیاد ↗</a></div>
            <div className="az-hero-caption">{settings.hero.principle}</div>
          </div>
          <a className="az-portrait" href="/beheshti" aria-label="مطالعهٔ پروندهٔ آیت‌الله سید علی بهشتی">
            <img src={settings.media.leaderImageUrl} alt={settings.media.leaderImageAlt} width="1182" height="1200" fetchPriority="high" onError={(e) => { if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = "1"; e.currentTarget.src = "/media/beheshti-original.webp"; } }} />
            <div className="az-portrait-label"><span>زندگی، اندیشه و رهبری</span><strong>آیت‌الله سید علی بهشتی</strong><span className="az-portrait-arrow" aria-hidden="true">↗</span></div>
          </a>
        </div>
      </section>
      <div className="az-container">
        <div className="az-trust-line"><span>پایه‌های پژوهش</span><a href="/standards">منبع‌سنجی</a><a href="/standards">ارجاع روشن</a><a href="/standards">حفظ اصل سند</a><a href="/standards">تفکیک سند و روایت</a></div>
        <section className="az-home-search" id="archive-search">
          <div><span className="az-overline">در جست‌وجوی گذشته</span><h2>پرسش شما، آغاز یک پژوهش.</h2></div>
          <form action="/publications" method="get" className="az-search-controls">
            <div><label htmlFor="home-query">نام، موضوع یا کلیدواژه</label><input id="home-query" name="q" type="search" placeholder="بهشتی، شورای اتفاق، یک سند…" /></div>
            <div><label htmlFor="home-type">نوع منبع</label><select id="home-type" name="type" defaultValue="all"><option value="all">همهٔ منابع</option><option value="document">اسناد</option><option value="article">مقالات</option><option value="book">کتاب‌ها</option><option value="oral-history">تاریخ شفاهی</option></select></div>
            <button type="submit" className="az-action">جست‌وجو ←</button>
          </form>
          <a className="az-small-link" href="/archive">مرور آرشیف و منابع منتشرشده ←</a>
        </section>
        <section className="az-section" id="dossiers">
          <div className="az-section-title"><div><span className="az-overline">پرونده‌های محوری</span><h2>تاریخ را در زمینهٔ آن بخوانیم.</h2></div><span className="az-section-note">سند · روایت · پژوهش</span></div>
          <div className="az-dossiers">
            {settings.visibility.council && <article className="az-dossier" id="council"><div className="az-dossier-art"><img src={settings.media.councilEmblemUrl} alt={settings.media.councilEmblemAlt} width="1075" height="1100" loading="lazy" onError={(e) => { if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = "1"; e.currentTarget.src = "/media/council-emblem.webp"; } }} /><span>حکومت شورای اتفاق</span></div><div className="az-dossier-body"><span className="az-overline">پروندهٔ تاریخی / ۰۱</span><h3>{settings.council.title}</h3><p>{settings.council.text}</p><a href="/council" className="az-dossier-link">ورود به پرونده <span aria-hidden="true">←</span></a></div></article>}
            {settings.visibility.leader && <article className="az-dossier" id="beheshti"><div className="az-dossier-type" aria-hidden="true"><span>علم</span><span>اندیشه</span><span>رهبری</span></div><div className="az-dossier-body"><span className="az-overline">پروندهٔ شخصیت / ۰۲</span><h3>{settings.leader.title}</h3><p>{settings.leader.lead}</p><a href="/beheshti" className="az-dossier-link">زندگی و میراث علمی <span aria-hidden="true">←</span></a></div></article>}
          </div>
        </section>
        {settings.visibility.archive && <section className="az-section az-collections"><div className="az-section-title"><div><span className="az-overline">مسیرهای مطالعه</span><h2>از منبع، به شناخت.</h2></div><a className="az-small-link" href="/publications">همهٔ نشریات ←</a></div><div className="az-collection-grid">{[{name:"اسناد تاریخی",type:"document",text:"نامه‌ها، اعلامیه‌ها و منابع مکتوب"},{name:"کتاب‌ها و آثار",type:"book",text:"آثار و منابع پژوهشی منتشرشده"},{name:"تاریخ شفاهی",type:"oral-history",text:"روایت‌ها و حافظهٔ شاهدان"},{name:"مقالات و پژوهش‌ها",type:"article",text:"خوانش و تحلیل منابع تاریخی"}].map((item,i)=><a key={item.type} href={`/publications?type=${item.type}`}><span className="az-collection-number">۰{i+1}</span><h3>{item.name}</h3><p>{item.text}</p><span aria-hidden="true">←</span></a>)}</div></section>}
        {settings.visibility.standards && <section className="az-method" id="standards"><div><span className="az-overline">معیارهای بنیاد</span><h2>{settings.standards.title}</h2><p>{settings.standards.text}</p><a className="az-small-link" href="/standards">آشنایی با روش پژوهش ←</a></div><ol>{settings.standards.items.map(item=><li key={item.id}><h3>{item.title}</h3><p>{item.text}</p></li>)}</ol></section>}
        {settings.visibility.contribute && <section className="az-contribute-band" id="contribute"><div><span className="az-overline">حافظهٔ مشترک ما</span><h2>{settings.contribute.title}</h2><p>{settings.contribute.text}</p></div><a className="az-action az-action-gold" href="/contribute">ارسال سند یا خاطره ←</a></section>}
      </div>
    </main>
  );
}
