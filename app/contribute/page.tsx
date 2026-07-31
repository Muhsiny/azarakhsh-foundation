"use client";

import { FormEvent, useState } from "react";

export default function ContributePage() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setSuccess(false);
    try {
      const form = event.currentTarget;
      const response = await fetch("/api/contributions", { method: "POST", body: new FormData(form) });
      const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error || "ثبت روایت انجام نشد.");
      setSuccess(true);
      setMessage(data.message || "منبع شما ثبت شد.");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ثبت روایت انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  const field = { width: "100%", boxSizing: "border-box" as const, marginTop: 6, padding: 11, border: "1px solid #c7a45b", borderRadius: 8, font: "inherit", direction: "rtl" as const };

  return (
    <main style={{ minHeight: "100vh", background: "#f6f0df", color: "#173f33", padding: "24px 16px", direction: "rtl" }}>
      <section style={{ width: "min(900px,100%)", margin: "0 auto", background: "#fffdf8", borderRadius: 18, padding: 24, boxShadow: "0 18px 60px rgba(15,49,40,.12)" }}>
        <a href="/" style={{ color: "#173f33" }}>بازگشت به صفحهٔ نخست ←</a>
        <p className="section-kicker" style={{ marginTop: 24 }}>حافظهٔ مردمی</p>
        <h1>ثبت خاطره، روایت و سند تاریخی</h1>
        <p>خاطرات، روایت‌های خانوادگی، تصویر، سند، فایل صوتی یا ویدیو را برای بررسی پژوهشی بنیاد آذرخش بفرستید. هیچ مطلبی پیش از بررسی و رضایت روشن صاحب منبع منتشر نمی‌شود.</p>

        <form onSubmit={submit} encType="multipart/form-data" style={{ display: "grid", gap: 15, marginTop: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
            <label>نام کامل<input name="fullName" required style={field} /></label>
            <label>ایمیل<input name="email" type="email" required style={field} /></label>
            <label>شماره تماس ـ اختیاری<input name="phone" style={field} /></label>
            <label>نسبت شما با روایت یا منبع<input name="relationToStory" placeholder="راوی، عضو خانواده، شاهد، مالک سند..." style={field} /></label>
          </div>

          <label>نوع ارسالی
            <select name="contributionType" required style={field} defaultValue="memory">
              <option value="memory">خاطرهٔ شخصی یا خانوادگی</option>
              <option value="oral-history">روایت تاریخ شفاهی</option>
              <option value="document">سند یا نامه</option>
              <option value="image">تصویر تاریخی</option>
              <option value="audio">فایل صوتی</option>
              <option value="video">ویدیو</option>
              <option value="correction">اصلاح یا تکمیل یک روایت</option>
            </select>
          </label>

          <label>عنوان روایت یا منبع<input name="title" required minLength={5} style={field} /></label>
          <label>متن کامل خاطره یا توضیح منبع
            <textarea name="narrative" required minLength={80} rows={10} style={{ ...field, resize: "vertical" }} placeholder="چه اتفاقی افتاد؟ چه کسانی حضور داشتند؟ شما این روایت را از چه کسی شنیده‌اید؟" />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
            <label>زمان واقعه ـ در صورت اطلاع<input name="eventDate" style={field} /></label>
            <label>مکان واقعه ـ در صورت اطلاع<input name="eventPlace" style={field} /></label>
            <label>نام اشخاص حاضر ـ در صورت اطلاع<input name="peoplePresent" style={field} /></label>
          </div>

          <label>منشأ و توضیح اصالت منبع
            <textarea name="sourceNote" rows={4} style={{ ...field, resize: "vertical" }} placeholder="اصل سند نزد چه کسی است؟ فایل اسکن است یا تصویر اصل؟ روایت مستقیم است یا نقل‌شده؟" />
          </label>

          <label>شیوهٔ ذکر نام
            <select name="namingPreference" style={field} defaultValue="full-name">
              <option value="full-name">نام کامل من ذکر شود</option>
              <option value="first-name">فقط نام کوچک ذکر شود</option>
              <option value="anonymous">نام من منتشر نشود</option>
              <option value="decide-later">پیش از نشر با من هماهنگ شود</option>
            </select>
          </label>

          <label>ضمیمهٔ اختیاری ـ تصویر، PDF، صوت یا ویدیوی MP4 تا ۱۰ مگابایت
            <input name="attachment" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,audio/ogg,video/mp4" style={field} />
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", border: "1px solid #d7c28a", borderRadius: 10, padding: 13 }}>
            <input type="checkbox" name="consent" value="yes" required />
            <span>با نگهداری و بررسی پژوهشی این اطلاعات موافقم. می‌دانم که ثبت منبع به معنای انتشار فوری نیست و بنیاد پیش از نشر دربارهٔ هویت، حقوق و شیوهٔ استفاده تصمیم‌گیری می‌کند.</span>
          </label>

          <button type="submit" disabled={saving} className="button button-dark" style={{ justifySelf: "start" }}>
            {saving ? "در حال ثبت…" : "ثبت خاطره یا منبع"}
          </button>
          {message && <p role="status" style={{ fontWeight: 700, color: success ? "#17613f" : "#8b2f20" }}>{message}</p>}
        </form>
      </section>
    </main>
  );
}
