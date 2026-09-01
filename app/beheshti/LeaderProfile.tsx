"use client";

import { useEffect, useState } from "react";
import InstitutionalPage, { type InstitutionalSection } from "../components/InstitutionalPage";

type PublicPost = {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
};

const fallbackSections: InstitutionalSection[] = [
  {
    title: "زندگی و زمانه",
    text: "آیت‌الله سید علی بهشتی از عالمان برجسته، مدرس، نویسنده و رهبران اجتماعی و سیاسی مناطق مرکزی افغانستان بود. این بخش زندگی‌نامه، خانواده، تحصیلات، استادان، بازگشت به وطن و بستر تاریخی زندگی او را در بر می‌گیرد.",
  },
  {
    title: "رهبری و حکومت‌داری",
    text: "این بخش به نقش آیت‌الله بهشتی در قیام‌های مناطق مرکزی، تشکیل شورای انقلابی اتفاق اسلامی افغانستان، شیوهٔ تصمیم‌گیری، ساختار اداری، وحدت سیاسی و تجربهٔ حکومت‌داری اختصاص دارد.",
  },
  {
    title: "اندیشه‌ها و باورها",
    text: "دیدگاه‌های او دربارهٔ دین، عدالت، اعتدال، وحدت، جامعه، مسئولیت اخلاقی، رهبری و حکومت در این بخش بررسی می‌شود.",
  },
  {
    title: "آثار و تألیفات",
    text: "کتاب‌ها، رساله‌ها، تقریرات، حاشیه‌ها، نامه‌ها و یادداشت‌های علمی، از جمله «انسان و سختی‌ها» و «الاعتدال»، در این بخش معرفی و بررسی می‌شوند.",
  },
  {
    title: "سخنرانی‌ها و صدا",
    text: "آرشیو صوتی و تصویری، متن سخنرانی‌ها، پیاده‌سازی گفتارها، خطابه‌ها، پیام‌ها و درس‌های باقی‌مانده در این بخش تنظیم می‌شود.",
  },
  {
    title: "اسناد و مکاتبات",
    text: "نامه‌ها، اعلامیه‌ها، فرمان‌ها، مکاتبات تشکیلاتی، اسناد شورای اتفاق و تصاویر نسخه‌های اصلی همراه با توضیح منشأ و اعتبار هر سند در این بخش قرار می‌گیرد.",
  },
  {
    title: "روایت‌ها و خاطرات",
    text: "خاطرات خانواده، شاگردان، همکاران، شاهدان محلی و نسل‌های مختلف با ذکر راوی، زمان، مکان و درجهٔ اعتبار روایت در این بخش گردآوری می‌شود.",
  },
  {
    title: "کتاب‌شناسی و پژوهش‌ها",
    text: "فهرست کتاب‌ها، مقاله‌ها، پایان‌نامه‌ها، گزارش‌ها و منابع چاپی و دیجیتال دربارهٔ زندگی، اندیشه و کارنامهٔ آیت‌الله بهشتی در این بخش ثبت می‌شود.",
  },
];

function parseSections(content: string): InstitutionalSection[] {
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

export default function LeaderProfile() {
  const [title, setTitle] = useState("پروندهٔ رهبر: حضرت آیت‌الله العظمی سید علی بهشتی(ره)");
  const [lead, setLead] = useState("پایگاه مستند زندگی، اندیشه، رهبری، آثار و حافظهٔ عمومی؛ با تفکیک روشن میان سند، روایت و تحلیل.");
  const [sections, setSections] = useState<InstitutionalSection[]>(fallbackSections);

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

  return (
    <InstitutionalPage
      kicker="پروندهٔ رهبر ۰۱"
      title={title}
      lead={lead}
      sections={sections}
      collapseSectionText
    />
  );
}
