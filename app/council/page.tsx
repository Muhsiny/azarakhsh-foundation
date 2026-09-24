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
  {
    no: "۰۱",
    title: "پیدایش در خلأ قدرت",
    text: "پژوهش نجات‌الله ابراهیمی گزارش می‌کند که تا میانهٔ ۱۹۷۹ بخش بزرگی از هزاره‌جات از کنترل حکومت مرکزی خارج شده بود و در سپتامبر همان سال، رهبران قیام‌ها یا نمایندگان‌شان در ورس گرد آمدند و تشکیل شورای انقلابی اتفاق اسلامی افغانستان را اعلام کردند.",
  },
  {
    no: "۰۲",
    title: "رهبری و ائتلاف",
    text: "ابراهیمی انتخاب سیدعلی بهشتی به رهبری شورا را نتیجهٔ سازش میان چند نیروی اجتماعی و سیاسی می‌داند. هارپویکن نیز شورای اتفاق را سازمانی چتری برای هماهنگی مقاومت و حکومت‌داری محلی توصیف می‌کند.",
  },
  {
    no: "۰۳",
    title: "ساختار اداری و قلمرو",
    text: "منابع پژوهشی از تقسیمات اداری، والیان و مسئولان محلی، نهادهای قضایی، آموزشی، مالی و فرهنگی و نیز ساختار نظامی سخن می‌گویند. در عین حال، میزان اجرای واقعی این طرح‌ها در همهٔ مناطق یکسان نبود و نفوذ مرکز به فرماندهان محلی وابسته می‌ماند.",
  },
  {
    no: "۰۴",
    title: "ظرفیت و محدودیت",
    text: "ادبیات دانشگاهی شورا را نمونه‌ای از تلاش برای ساخت یک نظم منطقه‌ای یا proto-state بررسی کرده است؛ اما همان منابع بر محدودیت خدمات، ضعف انسجام نظامی، اتکای زیاد به مالیات و دشواری دستیابی به پشتیبانی بیرونی نیز تأکید می‌کنند.",
  },
];

const evidence = [
  ["سند اولیه", "نامه، فرمان، اعلامیه، صورت‌جلسه، سند اداری، عکس یا مدرکی که به دورهٔ مورد مطالعه تعلق دارد."],
  ["روایت شاهد", "خاطره یا مصاحبهٔ فردی که تجربهٔ مستقیم خود را با زمان، مکان و نسبت روشن با واقعه بیان می‌کند."],
  ["منبع پژوهشی", "کتاب، مقاله یا گزارش دانشگاهی که باید هم از نظر روش و هم از نظر تبار استناد بررسی شود."],
  ["تحلیل پژوهشگر", "برداشت و تفسیر داده‌ها که باید صریحاً از خود سند و روایت جدا، مستدل و قابل اصلاح بماند."],
];

const sourceBase = [
  {
    title: "Niamatullah Ibrahimi — The Failure of a Clerical Proto-State: Hazarajat, 1979–1984",
    text: "Working Paper No. 6، Crisis States Research Centre، ۲۰۰۶. این پژوهش تشکیل شورا در ورس، ائتلاف نیروها، ساختار اداری، محدودیت‌های حکومت‌داری و روند افول آن را بررسی می‌کند.",
  },
  {
    title: "Kristian Berg Harpviken — Political Mobilization among the Hazara of Afghanistan: 1978–1992",
    text: "پژوهش دانشگاه اسلو، ۱۹۹۶. برای مطالعهٔ بسیج سیاسی هزاره‌ها، شکل‌گیری سازمان‌های سیاسی و جایگاه شورای اتفاق در تحولات آن دوره.",
  },
  {
    title: "M. Hassan Kakar — Afghanistan: The Soviet Invasion and the Afghan Response, 1979–1982",
    text: "University of California Press، ۱۹۹۵. منبع زمینه‌ای برای رخدادهای افغانستان در سال‌های آغازین جنگ و جایگاه مقاومت‌های منطقه‌ای.",
  },
  {
    title: "آرشیف بنیاد آذرخش",
    text: "زندگی‌نامه‌ها، اسناد داخلی، تصاویر، روایت‌ها و کتاب «فرمانده؛ زندگی و زمانهٔ آیت‌الله سیدعلی بهشتی» به‌عنوان منابع داخلی پرونده، با تفکیک روشن میان سند آرشیفی و تحلیل پژوهشی.",
  },
];

export default async function CouncilPage() {

  return (
    <main className="az-flagship-page">
      <section className="az-council-cover" aria-label="کاور پروندهٔ حکومت شورای اتفاق اسلامی افغانستان">
        <img src="/media/council-flag-hq.svg" alt="پرچم حکومت شورای اتفاق اسلامی افغانستان" width="1280" height="720" fetchPriority="high" />
        <div className="az-council-cover-caption">
          <span>آرشیف تصویری</span>
          <strong>پرچم تاریخی شورای اتفاق اسلامی افغانستان</strong>
        </div>
      </section>
      <section className="az-flagship-hero">
        <div className="az-container az-flagship-hero-grid">
          <div className="az-flagship-copy">
            <span className="az-overline">پروندهٔ محوری / ۰۱</span>
            <h1>حکومت شورای اتفاق اسلامی افغانستان</h1>
            <p>
              شورای انقلابی اتفاق اسلامی افغانستان در بستر فروپاشی ادارهٔ دولتی در بخش‌هایی از هزاره‌جات در سال ۱۳۵۸ شکل گرفت.
              پژوهش نجات‌الله ابراهیمی گزارش می‌کند که در سپتامبر ۱۹۷۹، رهبران قیام‌ها یا نمایندگان‌شان از مناطق مختلف در ورس گرد آمدند و تشکیل شورا را اعلام کردند.
              این پرونده شکل‌گیری، رهبری، ساختار اداری، قلمرو نفوذ، شیوهٔ حکومت‌داری و محدودیت‌های این تجربه را از مسیر منابع داخلی و پژوهش‌های دانشگاهی مقایسه می‌کند.
            </p>
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
          هدف این پرونده بازسازی یک تجربهٔ تاریخی از مسیر شواهد قابل ارزیابی است، نه تکرار یک روایت حزبی یا خانوادگی.
          هر ادعا باید با نوع منبع، زمان تولید، زمینهٔ سیاسی و امکان مقایسه با منابع دیگر سنجیده شود.
          هرجا دربارهٔ گسترهٔ قلمرو، ساختار اداری، میزان نفوذ مرکز یا مسئولیت بازیگران اختلاف منبع وجود دارد، همان اختلاف نیز باید برای خواننده آشکار بماند.
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

      <section className="az-container az-evidence-section" aria-labelledby="council-articles-title">
        <div className="az-evidence-heading">
          <span className="az-overline">مقالات تفصیلی پرونده</span>
          <h2 id="council-articles-title">بازسازی حکومت شورای اتفاق، مقاله‌به‌مقاله</h2>
          <p>این مجموعه، مواد کتابی و آرشیفی را با منابع مستقل می‌سنجد و هر بخش را به یک پژوهش مستقل دربارهٔ رهبری، مردم، نهادها، جنگ، اقتصاد و مناسبات قدرت تبدیل می‌کند.</p>
        </div>
        <div className="az-evidence-list">
          <article>
            <span>۰۲</span>
            <div>
              <h3><a href="/publications/hazarajat-1358-uprising-to-regional-government">از قیام پراکنده تا حکومت منطقه‌ای؛ هزاره‌جات ۱۳۵۸ و پیدایش شورای اتفاق</a></h3>
              <p>گذار قیام‌های محلی به ادارهٔ منطقه‌ای، جایگاه آیت‌الله سید علی بهشتی، سازوکارهای مشروعیت و حکومت‌داری و محدودیت‌های درونی و بیرونی این تجربه.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="az-container az-evidence-section" aria-labelledby="council-source-title">
        <div className="az-evidence-heading">
          <span className="az-overline">منابع پایهٔ پرونده</span>
          <h2 id="council-source-title">مسیر استناد این پرونده از کجا آغاز می‌شود؟</h2>
          <p>
            این فهرست نقطهٔ شروع است، نه فهرست نهایی. با ورود سند تازه، مشخصات صفحه، نسخه، منشأ و درجهٔ اعتبار هر منبع تکمیل می‌شود.
          </p>
        </div>
        <div className="az-evidence-list">
          {sourceBase.map((item, index) => (
            <article key={item.title}>
              <span>{(index + 1).toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</span>
              <div><h3>{item.title}</h3><p>{item.text}</p></div>
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