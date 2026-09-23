import type { Metadata } from "next";
import { siteSettings as settings } from "../site-settings";

export const metadata: Metadata = {
  title: "حکومت شورای اتفاق اسلامی افغانستان",
  description: "پروندهٔ پژوهشی حکومت شورای اتفاق؛ زمینه‌ها، ساختار، حکومت‌داری، منابع تاریخی و روایت‌ها.",
  alternates: { canonical: "/council" },
  openGraph: {
    url: "/council",
    title: "پروندهٔ حکومت شورای اتفاق اسلامی افغانستان",
    description: "زمینه‌ها، ساختار، حکومت‌داری، منابع تاریخی و روایت‌های مرتبط با شورای اتفاق.",
  },
};

const researchPath = [
  { no: "۰۱", title: "زمینه‌ها", text: "بررسی شرایط اجتماعی و سیاسی شکل‌گیری شورا و جایگاه آن در تحولات مناطق مرکزی افغانستان." },
  { no: "۰۲", title: "ساختار", text: "بازسازی نهادها، مسئولیت‌ها، شیوهٔ تصمیم‌گیری و رابطهٔ میان مرکز و اداره‌های محلی." },
  { no: "۰۳", title: "حکومت‌داری", text: "مطالعهٔ اداره، امنیت، حل اختلاف، منابع مالی و مناسبات اجتماعی بر پایهٔ شواهد قابل ارزیابی." },
  { no: "۰۴", title: "منابع و روایت‌ها", text: "تفکیک سند اولیه، روایت شاهد، خاطرهٔ متأخر و تحلیل پژوهشگر برای سنجش ادعاهای تاریخی." },
];

const evidence = [
  ["سند اولیه", "نامه، فرمان، اعلامیه، صورت‌جلسه یا مدرکی که به دورهٔ مورد مطالعه تعلق دارد."],
  ["روایت شاهد", "خاطره یا مصاحبهٔ شخصی که تجربهٔ مستقیم خود را با زمان و مکان مشخص بیان می‌کند."],
  ["منبع ثانوی", "کتاب، مقاله یا پژوهشی که بر پایهٔ منابع پیشین نوشته شده و باید روش و ارجاعاتش بررسی شود."],
  ["تحلیل پژوهشگر", "تفسیر داده‌ها که باید از خود سند و روایت جدا، مستدل و اصلاح‌پذیر بماند."],
];

export default async function CouncilPage() {

  return (
    <main className="az-flagship-page">
      <figure className="az-council-cover" aria-label="پرچم تاریخی حکومت شورای اتفاق اسلامی افغانستان">
        <img src="/media/council-flag-cover.jpg" alt="پرچم حکومت شورای اتفاق اسلامی افغانستان" width="1536" height="864" fetchPriority="high" />
      </figure>
      <section className="az-flagship-hero">
        <div className="az-container az-flagship-hero-grid">
          <div className="az-flagship-copy">
            <span className="az-overline">پروندهٔ محوری / ۰۱</span>
            <h1>حکومت شورای اتفاق اسلامی افغانستان</h1>
            <p>{settings.council.text}</p>
            <div className="az-actions">
              <a className="az-action" href="/publications?topic=council">منابع و پژوهش‌های مرتبط ←</a>
              <a className="az-text-link" href="/standards">روش سنجش منابع ↗</a>
            </div>
          </div>

          <div className="az-flagship-emblem">
            <div className="az-emblem-frame">
              <img src={settings.media.councilEmblemUrl} alt={settings.media.councilEmblemAlt} width="1075" height="1100" />
            </div>
            <p>{settings.media.councilEmblemCaption}</p>
          </div>
        </div>
      </section>

      <section className="az-container az-flagship-intro">
        <div>
          <span className="az-overline">سؤال پژوهشی</span>
          <h2>این تجربهٔ حکومت‌داری چگونه شکل گرفت، چگونه عمل کرد و چگونه باید از روی شواهد بازسازی شود؟</h2>
        </div>
        <p>
          هدف این پرونده ارائهٔ یک روایت از پیش تعیین‌شده نیست. هر ادعا باید با منبع، زمان، زمینه و امکان مقایسه با روایت‌های دیگر بررسی شود.
          جاهایی که سند کافی نیست، درجهٔ عدم قطعیت نیز باید آشکار بماند.
        </p>
      </section>

      <section className="az-container az-research-path" aria-labelledby="research-path-title">
        <div className="az-section-title">
          <div>
            <span className="az-overline">نقشهٔ مطالعه</span>
            <h2 id="research-path-title">چهار محور برای خواندن پرونده</h2>
          </div>
          <span className="az-section-note">از زمینه تا شواهد</span>
        </div>
        <div className="az-research-path-grid">
          {researchPath.map((item) => (
            <article key={item.no}>
              <span>{item.no}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="az-container az-evidence-section">
        <div className="az-evidence-heading">
          <span className="az-overline">سلسله‌مراتب شواهد</span>
          <h2>هر منبع، وزن و محدودیت خودش را دارد.</h2>
          <p>در آذرخش نوع منبع در کنار هر ادعا مشخص می‌شود تا خواننده بداند با چه سطحی از شاهد روبه‌رو است.</p>
        </div>
        <div className="az-evidence-list">
          {evidence.map(([title, text], index) => (
            <article key={title}>
              <span>{(index + 1).toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="az-container az-flagship-cta">
        <div>
          <span className="az-overline">آرشیف باز</span>
          <h2>اگر سند، تصویر یا روایت مرتبط در اختیار دارید، منشأ آن را ثبت کنید.</h2>
          <p>مواد دریافتی پیش از نشر از نظر منشأ، حقوق، کیفیت و ارتباط موضوعی بررسی می‌شوند.</p>
        </div>
        <div className="az-actions">
          <a className="az-action az-action-gold" href="/contribute">ارسال منبع ←</a>
          <a className="az-text-link az-text-link-light" href="/archive">مرور آرشیف ↗</a>
        </div>
      </section>
    </main>
  );
}