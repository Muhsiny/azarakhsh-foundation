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
    title: "زندگی و زمانه",
    text: "این بخش زندگی‌نامه، خانواده، تحصیلات، استادان، بازگشت به وطن و بستر تاریخی زندگی آیت‌الله سید علی بهشتی را در بر می‌گیرد.",
  },
  {
    title: "رهبری و حکومت‌داری",
    text: "این بخش نقش آیت‌الله بهشتی در تحولات مناطق مرکزی، شورای اتفاق، شیوهٔ تصمیم‌گیری، ساختار اداری و تجربهٔ حکومت‌داری را بر پایهٔ منابع قابل ارزیابی بررسی می‌کند.",
  },
  {
    title: "اندیشه‌ها و باورها",
    text: "دیدگاه‌های او دربارهٔ دین، عدالت، وحدت، جامعه، مسئولیت اخلاقی، رهبری و حکومت در این بخش با تفکیک میان متن اصلی، روایت و تفسیر پژوهشگر بررسی می‌شود.",
  },
  {
    title: "آثار و تألیفات",
    text: "کتاب‌ها، رساله‌ها، تقریرات، حاشیه‌ها، نامه‌ها و یادداشت‌های علمی در این بخش معرفی می‌شوند و اطلاعات کتاب‌شناختی هر مورد تا حد امکان ثبت خواهد شد.",
  },
  {
    title: "سخنرانی‌ها و صدا",
    text: "آرشیو صوتی و تصویری، متن سخنرانی‌ها، پیاده‌سازی گفتارها، خطابه‌ها، پیام‌ها و درس‌های باقی‌مانده در این بخش تنظیم می‌شود.",
  },
  {
    title: "اسناد و مکاتبات",
    text: "نامه‌ها، اعلامیه‌ها، فرمان‌ها، مکاتبات تشکیلاتی و تصاویر نسخه‌های اصلی همراه با توضیح منشأ، تاریخ و وضعیت اعتبار هر سند در این بخش قرار می‌گیرند.",
  },
  {
    title: "روایت‌ها و خاطرات",
    text: "خاطرات خانواده، شاگردان، همکاران و شاهدان محلی با ذکر راوی، زمان، مکان و نسبت راوی با واقعه گردآوری و از اسناد اولیه تفکیک می‌شوند.",
  },
  {
    title: "کتاب‌شناسی و پژوهش‌ها",
    text: "فهرست کتاب‌ها، مقاله‌ها، پایان‌نامه‌ها، گزارش‌ها و منابع چاپی و دیجیتال مرتبط با زندگی، اندیشه و کارنامهٔ آیت‌الله بهشتی در این بخش ثبت می‌شود.",
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
  const [lead, setLead] = useState("پایگاه مستند زندگی، اندیشه، رهبری، آثار و حافظهٔ عمومی؛ با تفکیک روشن میان سند، روایت و تحلیل.");
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