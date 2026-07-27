"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type LeaderSection = {
  id: string;
  title: string;
  text: string;
};

type AdminPost = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: string;
};

const defaultSections: LeaderSection[] = [
  { id: "life", title: "زندگی و زمانه", text: "آیت‌الله سید علی بهشتی از عالمان برجسته، مدرس، نویسنده و رهبران اجتماعی و سیاسی مناطق مرکزی افغانستان بود. این بخش برای زندگی‌نامه، خانواده، تحصیلات، استادان، بازگشت به افغانستان و بستر تاریخی زندگی او در نظر گرفته شده است." },
  { id: "governance", title: "رهبری و حکومت‌داری", text: "این بخش به نقش آیت‌الله بهشتی در قیام‌های مناطق مرکزی، تشکیل شورای انقلابی اتفاق اسلامی افغانستان، شیوهٔ تصمیم‌گیری، ساختار اداری، وحدت سیاسی و تجربهٔ حکومت‌داری اختصاص دارد." },
  { id: "thought", title: "اندیشه‌ها و باورها", text: "در این بخش دیدگاه‌های او دربارهٔ دین، عدالت، اعتدال، وحدت، جامعه، مسئولیت اخلاقی، رهبری و حکومت بررسی و با آثار مکتوب و سخنان مستند او پیوند داده می‌شود." },
  { id: "works", title: "آثار و تألیفات", text: "معرفی و بررسی کتاب‌ها، رساله‌ها، تقریرات، حاشیه‌ها، نامه‌ها و یادداشت‌های علمی؛ از جمله «انسان و سختی‌ها»، «الاعتدال» و دیگر آثار شناخته‌شده یا نیازمند نسخه‌شناسی." },
  { id: "speeches", title: "سخنرانی‌ها و صدا", text: "آرشیو صوتی و تصویری، متن سخنرانی‌ها، پیاده‌سازی گفتارها، خطابه‌ها، پیام‌ها و درس‌های باقی‌مانده از آیت‌الله بهشتی در این بخش تنظیم می‌شود." },
  { id: "documents", title: "اسناد و مکاتبات", text: "نامه‌ها، اعلامیه‌ها، فرمان‌ها، مکاتبات تشکیلاتی، اسناد شورای اتفاق، تصاویر نسخه‌های اصلی و توضیح منشأ و اعتبار هر سند در این بخش قرار می‌گیرد." },
  { id: "memories", title: "روایت‌ها و خاطرات", text: "خاطرات خانواده، شاگردان، همکاران، شاهدان محلی و نسل‌های مختلف با ذکر راوی، زمان، مکان و درجهٔ اعتبار روایت در این بخش گردآوری می‌شود." },
  { id: "bibliography", title: "کتاب‌شناسی و پژوهش‌ها", text: "فهرست کتاب‌ها، مقاله‌ها، پایان‌نامه‌ها، گزارش‌ها، منابع چاپی و دیجیتال دربارهٔ زندگی، اندیشه و کارنامهٔ آیت‌الله بهشتی همراه با مشخصات کتاب‌شناختی در این بخش ثبت می‌شود." },
];

function decodeSections(content: string): LeaderSection[] {
  try {
    const parsed = JSON.parse(content) as { sections?: LeaderSection[] };
    if (Array.isArray(parsed.sections) && parsed.sections.length) return parsed.sections;
  } catch {
    // محتوای قدیمی یا خالی؛ نسخهٔ پایه نمایش داده می‌شود.
  }
  return defaultSections;
}

export default function LeaderPageManager() {
  const [postId, setPostId] = useState<number | null>(null);
  const [title, setTitle] = useState("پروندهٔ رهبر: حضرت آیت‌الله العظمی سید علی بهشتی(ره)");
  const [lead, setLead] = useState("پایگاه مستند زندگی، اندیشه، رهبری، آثار و حافظهٔ عمومی؛ با تفکیک روشن میان سند، روایت و تحلیل.");
  const [sections, setSections] = useState<LeaderSection[]>(defaultSections);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/posts");
    const data = (await response.json()) as { posts?: AdminPost[]; error?: string };
    if (!response.ok) {
      setMessage(data.error || "پروندهٔ رهبر دریافت نشد.");
      return;
    }
    const post = (data.posts || []).find((item) => item.tags.split(",").map((tag) => tag.trim()).includes("leader-page"));
    if (!post) return;
    setPostId(post.id);
    setTitle(post.title || title);
    setLead(post.excerpt || lead);
    setSections(decodeSections(post.content));
  }, [lead, title]);

  useEffect(() => { void load(); }, [load]);

  function updateSection(index: number, patch: Partial<LeaderSection>) {
    setSections((current) => current.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...patch } : section));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = {
      title,
      excerpt: lead,
      content: JSON.stringify({ sections }),
      category: "آیت‌الله بهشتی",
      contentType: "page",
      language: "fa",
      visibility: "public",
      authorName: "بنیاد آذرخش",
      coverImage: "",
      fileUrl: "",
      fileName: "",
      sourceNote: "پروندهٔ رسمی و قابل ویرایش رهبر",
      tags: "leader-page, آیت‌الله بهشتی, پرونده رهبر",
      featured: true,
      status: "published",
    };
    const response = await fetch(postId ? `/api/admin/posts/${postId}` : "/api/admin/posts", {
      method: postId ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) setMessage(data.error || "ذخیره انجام نشد.");
    else {
      setMessage("پروندهٔ رهبر ذخیره و روی سایت منتشر شد.");
      await load();
    }
    setSaving(false);
  }

  return (
    <section className="site-studio leader-page-manager">
      <div className="studio-heading">
        <div>
          <p className="section-kicker">کنترل مستقیم پروندهٔ رهبر</p>
          <h2>ویرایش تمام بخش‌های صفحهٔ آیت‌الله بهشتی</h2>
          <p>عنوان، معرفی، متن هر فصل، ترتیب فصل‌ها و تعداد بخش‌ها را بدون دست‌کاری کد تغییر دهید.</p>
        </div>
        <a className="quiet-button" href="/beheshti" target="_blank" rel="noreferrer">مشاهدهٔ صفحه</a>
      </div>
      {message && <p className="admin-message">{message}</p>}
      <form className="editor-card studio-wide" onSubmit={save}>
        <label>عنوان اصلی صفحه<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label>متن معرفی صفحه<textarea rows={4} value={lead} onChange={(event) => setLead(event.target.value)} /></label>
        <div className="collection-editor studio-wide">
          <div className="collection-heading">
            <strong>بخش‌های پرونده</strong>
            <button type="button" onClick={() => setSections([...sections, { id: crypto.randomUUID(), title: "بخش تازه", text: "متن این بخش را بنویسید." }])}>+ افزودن بخش</button>
          </div>
          {sections.map((section, index) => (
            <article className="editable-item" key={section.id}>
              <div className="item-toolbar">
                <span>بخش {index + 1}</span>
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
                <button type="button" disabled={index === sections.length - 1} onClick={() => move(index, 1)}>↓</button>
                <button className="danger-button" type="button" onClick={() => setSections(sections.filter((_, sectionIndex) => sectionIndex !== index))}>حذف</button>
              </div>
              <label>عنوان بخش<input value={section.title} onChange={(event) => updateSection(index, { title: event.target.value })} /></label>
              <label>متن کامل بخش<textarea className="content-editor" rows={12} value={section.text} onChange={(event) => updateSection(index, { text: event.target.value })} /></label>
            </article>
          ))}
        </div>
        <button className="button button-dark" disabled={saving} type="submit">{saving ? "در حال ذخیره..." : "ذخیره و انتشار پروندهٔ رهبر"}</button>
      </form>
    </section>
  );
}
