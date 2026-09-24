"use client";

import { useEffect, useMemo, useState } from "react";
import ExpandableSectionText from "../components/ExpandableSectionText";
import ReadingTools from "../components/ReadingTools";

type PublicPost = {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
};

type Section = { title: string; text: string };

const fallbackSections: Section[] = [
  {
    title: "زندگی و شکل‌گیری جایگاه علمی",
    text: "سیدعلی بهشتی در محیطی دینی و روستایی در بامیان پرورش یافت و آموزش‌های نخستین را در همان فضای محلی آغاز کرد. مسیر تحصیل او سپس از حوزه‌های منطقه‌ای به یکاولنگ و در ادامه به نجف رسید. در منابع داخلی بنیاد آذرخش، دورهٔ نجف مرحله‌ای تعیین‌کننده در شکل‌گیری جایگاه علمی او دانسته می‌شود؛ زیرا در آنجا در درس‌های عالی فقه و اصول شرکت کرد و خود نیز به تدریس پرداخت. پژوهش نجات‌الله ابراهیمی نیز گزارش می‌کند که او پس از بازگشت از عراق در دههٔ ۱۹۶۰ در ورس مستقر شد و مدرسه‌ای دینی ایجاد کرد. این سابقهٔ علمی، پیش از ورود او به رهبری سیاسی، برایش نوعی اعتبار اجتماعی و مذهبی پدید آورد. پروندهٔ آذرخش در این بخش میان روایت‌های خانوادگی و محلی، اسناد آرشیفی و گزارش‌های پژوهشی بیرونی تفکیک قائل می‌شود تا زندگی علمی او نه در قالب یک روایت ستایش‌آمیز، بلکه در چارچوب شواهد قابل ارزیابی بازسازی شود. منابع پایه: کتاب «فرمانده؛ زندگی و زمانهٔ آیت‌الله سیدعلی بهشتی»، آرشیف بنیاد آذرخش؛ Niamatullah Ibrahimi, The Failure of a Clerical Proto-State (2006).",
  },
  {
    title: "بازگشت به افغانستان و نقش اجتماعی",
    text: "پس از بازگشت به افغانستان، فعالیت او صرفاً به تدریس محدود نماند. منابع نزدیک به زندگی او از مدرسه، منبر، حل اختلافات محلی، داوری شرعی و اجتماعی، تربیت شاگرد و ارتباط گسترده با مردم سخن می‌گویند. همین پیوند با مسائل روزمرهٔ جامعه برای فهم نقش بعدی او اهمیت دارد؛ زیرا جایگاه سیاسی او ناگهان و از خلأ پدید نیامد. پیش از تشکیل شورای اتفاق، او در منطقه به‌عنوان عالم و مرجع مراجعهٔ مردم شناخته شده بود. در بازسازی این دوره باید میان خاطرهٔ شاگردان، شهادت خانواده، روایت محلی و سند هم‌زمان فرق گذاشت. بنیاد آذرخش روایت‌های این مرحله را تنها زمانی به‌عنوان دادهٔ قطعی عرضه می‌کند که منشأ، زمان و امکان مقایسهٔ آنها روشن باشد؛ در غیر آن، آنها با برچسب «روایت» یا «خاطره» منتشر می‌شوند.",
  },
  {
    title: "از قیام‌های ۱۳۵۸ تا تشکیل شورای اتفاق",
    text: "در سال ۱۳۵۸، هم‌زمان با گسترش قیام‌ها علیه حکومت حزب دموکراتیک خلق در مناطق مرکزی، مسئلهٔ اصلی از مقاومت نظامی فراتر رفت و به ادارهٔ مناطق خارج‌شده از کنترل دولت مرکزی رسید. ابراهیمی می‌نویسد که تا ژوئن ۱۹۷۹ بخش‌های بزرگی از هزاره‌جات از کنترل حکومت بیرون شده بود و در سپتامبر همان سال، رهبران قیام‌ها یا نمایندگان‌شان در ورس گرد آمدند و تشکیل شورای انقلابی اتفاق اسلامی افغانستان را اعلام کردند. در همان پژوهش، انتخاب بهشتی به رهبری شورا نتیجهٔ سازش میان نیروهای مختلف اجتماعی و سیاسی توصیف شده است. هارپویکن نیز تشکیل شورا را در چارچوب تلاش برای هماهنگی مقاومت و حکومت‌داری محلی بررسی می‌کند. از این منظر، نقش بهشتی در این دوره باید هم‌زمان در دو سطح دیده شود: رهبری یک ائتلاف سیاسی ـ مذهبی و مشارکت در تجربه‌ای از حکومت‌داری منطقه‌ای که در منابع دانشگاهی بعدی با تعابیری مانند proto-state یا «دولت‌واره» تحلیل شده است.",
  },
  {
    title: "رهبری، اداره و تجربهٔ حکومت‌داری",
    text: "پروندهٔ حکومت شورای اتفاق نشان می‌دهد که این تشکیلات فقط یک نیروی نظامی نبود. منابع پژوهشی از تقسیمات اداری، والیان و مسئولان محلی، نهادهای قضایی، مالی، فرهنگی و آموزشی، بسیج نیرو و تلاش برای هماهنگی میان مناطق سخن می‌گویند. ابراهیمی این تجربه را تلاشی برای ساختن یک proto-state می‌خواند و در عین حال بر محدودیت‌های آن نیز تأکید می‌کند: ضعف در ارائهٔ خدمات، اتکا به فرماندهان محلی، دشواری در ایجاد ساختار نظامی یکپارچه و کمبود حمایت خارجی. بنابراین در این پرونده، نقش بهشتی نه با یک داوری کلی، بلکه با تفکیک میان طرح اداری، میزان اجرای واقعی، قلمرو نفوذ مستقیم و محدودیت‌های ساختاری سنجیده می‌شود. این روش اجازه می‌دهد هم ظرفیت حکومت‌داری شورا دیده شود و هم شکاف میان برنامهٔ رسمی و واقعیت میدانی.",
  },
  {
    title: "اندیشهٔ دینی، وحدت و مسئولیت سیاسی",
    text: "بخش مهمی از میراث فکری بهشتی از خلال درس‌ها، خطابه‌ها، نامه‌ها و تصمیم‌های سیاسی او قابل مطالعه است، اما بخش قابل توجهی از این مواد هنوز نیازمند تنظیم آرشیفی و انتساب دقیق است. منابع پژوهشی بیرونی او را در میان علمای سنت‌گرای شیعهٔ متأثر از حوزهٔ نجف قرار می‌دهند و ابراهیمی او را از چهره‌های پیرو خط فکری آیت‌الله خویی معرفی می‌کند. با این حال، نسبت‌دادن هر دیدگاه سیاسی یا فقهی به او باید بر پایهٔ متن اصلی یا روایت مشخص باشد. بنیاد آذرخش در این بخش میان «سخن مستقیم»، «نقل شاهد»، «برداشت پژوهشگر» و «تفسیر متأخر» تفکیک می‌کند تا اندیشهٔ او از خلال سند بازسازی شود، نه از طریق نسبت‌دادن دیدگاه‌های بعدی به گذشته.",
  },
  {
    title: "شبکهٔ اسناد، نامه‌ها و منابع اولیه",
    text: "برای مطالعهٔ تاریخی بهشتی، اسناد اداری و مکاتبات اهمیت ویژه دارند؛ زیرا آنها می‌توانند فاصلهٔ میان خاطره و عمل نهادی را نشان دهند. نامه‌ها، فرمان‌ها، صورت‌جلسه‌ها، اعلامیه‌ها، اسناد رفت‌وآمد، تصاویر، نوارهای صوتی و روایت‌های شاهدان هرکدام ارزش متفاوتی دارند. در آرشیف آذرخش، اصل یا تصویر هر سند باید با شناسنامهٔ منبع، مالک یا محل نگهداری، تاریخ تقریبی، وضعیت اصالت و محدودیت‌های حقوقی ثبت شود. هرجا سندی تنها از طریق نسخهٔ ثانوی یا نقل کتاب در دسترس باشد، این محدودیت باید آشکار نوشته شود. هدف این بخش ساختن یک گنجینهٔ قابل استناد است که پژوهشگر بتواند مسیر هر ادعا را تا منبع آن دنبال کند.",
  },
  {
    title: "روایت‌ها، اختلاف‌ها و حافظهٔ تاریخی",
    text: "زندگی و کارنامهٔ بهشتی در دوره‌ای شکل گرفت که رقابت‌های سیاسی، اختلاف‌های ایدئولوژیک و درگیری‌های داخلی در هزاره‌جات رو به گسترش بود. منابع مختلف دربارهٔ علل اختلاف‌ها، میزان نفوذ اشخاص، نقش حمایت خارجی و مسئولیت بازیگران روایت‌های یکسانی ارائه نمی‌کنند. به همین دلیل، این پرونده از تبدیل یک روایت حزبی یا خانوادگی به «حقیقت نهایی» پرهیز می‌کند. خاطرات موافق و مخالف، پژوهش‌های دانشگاهی، اسناد سازمانی و شهادت‌های متأخر باید کنار هم قرار گیرند و زمان تولید هر روایت نیز در نظر گرفته شود. اختلاف منابع در اینجا خود بخشی از تاریخ است و باید به خواننده نشان داده شود.",
  },
  {
    title: "کتاب‌شناسی و مسیرهای پژوهش",
    text: "منابع پایهٔ این پرونده در چند دسته قرار می‌گیرند: اسناد و زندگی‌نامه‌های آرشیفی بنیاد آذرخش؛ کتاب «فرمانده؛ زندگی و زمانهٔ آیت‌الله سیدعلی بهشتی»؛ پژوهش Niamatullah Ibrahimi با عنوان The Failure of a Clerical Proto-State: Hazarajat, 1979–1984؛ پژوهش Kristian Berg Harpviken با عنوان Political Mobilization among the Hazara of Afghanistan: 1978–1992؛ و آثار عمومی‌تر دربارهٔ مقاومت افغانستان از جمله M. Hassan Kakar. فهرست منابع با ورود سند تازه توسعه می‌یابد و هر منبع باید با مشخصات کتاب‌شناختی، صفحهٔ مورد استفاده و نوع شاهد ثبت شود. هدف نهایی این بخش آن است که خواننده بتواند از روایت زندگی‌نامه‌ای به سند اولیه و سپس به پژوهش مقایسه‌ای حرکت کند.",
  },
];

function parseSections(content: string): Section[] {
  try {
    const parsed = JSON.parse(content) as { sections?: Array<{ title?: string; text?: string }> };
    if (Array.isArray(parsed.sections) && parsed.sections.length) {
      return parsed.sections
        .filter((section) => section.title || section.text)
        .map((section) => ({ title: section.title || "بخش بدون عنوان", text: section.text || "" }));
    }
  } catch {
    if (content.trim()) return [{ title: "متن پرونده", text: content }];
  }
  return fallbackSections;
}

export default function LeaderProfile({
  imageUrl,
  imageAlt,
}: {
  imageUrl: string;
  imageAlt: string;
}) {
  const [title, setTitle] = useState("پروندهٔ آیت‌الله سید علی بهشتی");
  const [lead, setLead] = useState("پروندهٔ پژوهشی زندگی و زمانهٔ آیت‌الله سیدعلی بهشتی؛ از تحصیل و جایگاه اجتماعی تا رهبری شورای اتفاق، با تفکیک روشن میان سند اولیه، روایت شاهد و تحلیل پژوهشی.");
  const [sections, setSections] = useState<Section[]>(fallbackSections);

  useEffect(() => {
    fetch("/api/posts")
      .then(async (response) => (await response.json()) as { posts?: PublicPost[] })
      .then((data) => {
        const post = (data.posts || []).find((item) => item.tags?.split(",").map((tag) => tag.trim()).includes("leader-page"));
        if (!post) return;
        if (post.title) setTitle(post.title);
        if (post.excerpt) setLead(post.excerpt);
        setSections(parseSections(post.content));
      })
      .catch(() => undefined);
  }, []);

  const indexItems = useMemo(() => sections.slice(0, 8), [sections]);

  return (
    <main className="az-leader-page">
      <section className="az-leader-hero">
        <div className="az-container az-leader-hero-grid">
          <div className="az-leader-copy">
            <span className="az-overline">پروندهٔ شخصیت / ۰۲</span>
            <h1>{title}</h1>
            <p>{lead}</p>
            <div className="az-actions">
              <a className="az-action az-action-gold" href="/publications?topic=beheshti">منابع مرتبط ←</a>
              <a className="az-text-link az-text-link-light" href="#leader-sections">مطالعهٔ پرونده ↓</a>
            </div>
            <div className="az-research-note">
              <strong>قاعدهٔ پرونده</strong>
              <span>زندگی‌نامه، بزرگداشت، سند تاریخی و تحلیل پژوهشی از یکدیگر تفکیک می‌شوند.</span>
            </div>
          </div>

          <figure className="az-leader-portrait">
            <img src={imageUrl} alt={imageAlt} width="1182" height="1200" fetchPriority="high" />
            <figcaption>تصویر آرشیوی · پروندهٔ زندگی و زمانه</figcaption>
          </figure>
        </div>
      </section>

      <section className="az-container az-leader-index" aria-labelledby="leader-index-title">
        <div>
          <span className="az-overline">نقشهٔ پرونده</span>
          <h2 id="leader-index-title">هشت مسیر برای مطالعه</h2>
        </div>
        <div className="az-leader-index-grid">
          {indexItems.map((section, index) => (
            <a href={`#leader-section-${index + 1}`} key={section.title}>
              <span>{(index + 1).toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</span>
              <strong>{section.title}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="az-container az-leader-reading" id="leader-sections">
        <aside className="az-leader-aside">
          <span className="az-overline">راهنمای خواندن</span>
          <p>برای هر بخش، منبع اولیه، روایت شاهد و تحلیل پژوهشی باید تا حد امکان از هم جدا و قابل ارجاع باشند.</p>
          <a className="az-small-link" href="/standards">اصول پژوهش و اصلاحات ←</a>
        </aside>

        <article className="az-leader-article">
          <ReadingTools />
          {sections.map((section, index) => (
            <section id={`leader-section-${index + 1}`} key={section.title}>
              <span className="az-section-index">{(index + 1).toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</span>
              <h2>{section.title}</h2>
              <ExpandableSectionText text={section.text} />
            </section>
          ))}
        </article>
      </section>

      <section className="az-container az-leader-sources">
        <div>
          <span className="az-overline">گنجینهٔ مرتبط</span>
          <h2>از زندگینامه به سند اصلی بروید.</h2>
          <p>هرجا منبع منتشرشده در آرشیف موجود باشد، مشخصات و مسیر مراجعه باید در کنار متن پژوهشی قرار گیرد.</p>
        </div>
        <div className="az-actions">
          <a className="az-action" href="/publications?topic=beheshti">نشریات و منابع ←</a>
          <a className="az-text-link" href="/contribute">افزودن سند یا روایت ↗</a>
        </div>
      </section>
    </main>
  );
}