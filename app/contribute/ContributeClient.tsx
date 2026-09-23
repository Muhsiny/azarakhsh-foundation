"use client";

import { FormEvent, useState } from "react";

export default function ContributeClient() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");

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
      setAttachmentName("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ثبت روایت انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="az-contribution-page" data-inline-static>
      <section className="az-contribution-hero">
        <a className="az-back-link" href="/">بازگشت به صفحهٔ نخست ←</a>
        <p className="section-kicker">حافظهٔ مردمی</p>
        <h1>ثبت خاطره، روایت و سند تاریخی</h1>
        <p>
          خاطرات، روایت‌های خانوادگی، تصویر، سند، فایل صوتی یا ویدیو را برای بررسی پژوهشی بنیاد آذرخش بفرستید.
          هیچ مطلبی پیش از بررسی و رضایت روشن صاحب منبع منتشر نمی‌شود.
        </p>
      </section>

      <form className="az-contribution-form" onSubmit={submit} encType="multipart/form-data">
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="az-honeypot"
        />

        <fieldset className="az-form-section">
          <legend>مشخصات فرستنده</legend>
          <div className="az-field-grid">
            <label>نام کامل<input className="az-form-control" name="fullName" autoComplete="name" required /></label>
            <label>ایمیل<input className="az-form-control" name="email" autoComplete="email" type="email" required /></label>
            <label>شماره تماس ـ اختیاری<input className="az-form-control" name="phone" autoComplete="tel" type="tel" /></label>
            <label>نسبت شما با روایت یا منبع<input className="az-form-control" name="relationToStory" placeholder="راوی، عضو خانواده، شاهد، مالک سند..." /></label>
          </div>
        </fieldset>

        <fieldset className="az-form-section">
          <legend>معرفی منبع</legend>

          <label>نوع ارسالی
            <select className="az-form-control" name="contributionType" required defaultValue="memory">
              <option value="memory">خاطرهٔ شخصی یا خانوادگی</option>
              <option value="oral-history">روایت تاریخ شفاهی</option>
              <option value="document">سند یا نامه</option>
              <option value="image">تصویر تاریخی</option>
              <option value="audio">فایل صوتی</option>
              <option value="video">ویدیو</option>
              <option value="correction">اصلاح یا تکمیل یک روایت</option>
            </select>
          </label>

          <label>عنوان روایت یا منبع<input className="az-form-control" name="title" required minLength={5} /></label>
          <label>متن کامل خاطره یا توضیح منبع
            <textarea
              className="az-form-control"
              name="narrative"
              required
              minLength={80}
              rows={10}
              placeholder="چه اتفاقی افتاد؟ چه کسانی حضور داشتند؟ شما این روایت را از چه کسی شنیده‌اید؟"
            />
          </label>

          <div className="az-field-grid">
            <label>زمان واقعه ـ در صورت اطلاع<input className="az-form-control" name="eventDate" /></label>
            <label>مکان واقعه ـ در صورت اطلاع<input className="az-form-control" name="eventPlace" /></label>
            <label>نام اشخاص حاضر ـ در صورت اطلاع<input className="az-form-control" name="peoplePresent" /></label>
          </div>

          <div className="az-field-help">شرح روایت باید دست‌کم ۸۰ نویسه داشته باشد. زمان و مکان تقریبی را نیز می‌توانید بنویسید.</div>

          <label>منشأ و توضیح اصالت منبع
            <textarea
              className="az-form-control"
              name="sourceNote"
              rows={4}
              placeholder="اصل سند نزد چه کسی است؟ فایل اسکن است یا تصویر اصل؟ روایت مستقیم است یا نقل‌شده؟"
            />
          </label>

          <label>شیوهٔ ذکر نام
            <select className="az-form-control" name="namingPreference" defaultValue="full-name">
              <option value="full-name">نام کامل من ذکر شود</option>
              <option value="first-name">فقط نام کوچک ذکر شود</option>
              <option value="anonymous">نام من منتشر نشود</option>
              <option value="decide-later">پیش از نشر با من هماهنگ شود</option>
            </select>
          </label>

          <label className="az-file-field">ضمیمهٔ اختیاری ـ تصویر، PDF، صوت یا ویدیوی MP4 تا ۱۰ مگابایت
            <span className="az-file-picker-world">
              <span className="az-file-name">{attachmentName || "فایلی انتخاب نشده است"}</span>
              <b>انتخاب فایل</b>
              <input
                name="attachment"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,audio/ogg,video/mp4"
                onChange={(event) => setAttachmentName(event.target.files?.[0]?.name || "")}
              />
            </span>
          </label>
        </fieldset>

        <label className="az-consent-box">
          <input type="checkbox" name="consent" value="yes" required />
          <span>
            با نگهداری و بررسی پژوهشی این اطلاعات موافقم. می‌دانم که ثبت منبع به معنای انتشار فوری نیست
            و بنیاد پیش از نشر دربارهٔ هویت، حقوق و شیوهٔ استفاده تصمیم‌گیری می‌کند.
          </span>
        </label>

        <div className="az-form-submit">
          <button type="submit" disabled={saving} className="az-action az-action-primary">
            {saving ? "در حال ثبت…" : "ثبت خاطره یا منبع"}
          </button>
          <span>اطلاعات شما صرفاً برای بررسی و ارتباط پژوهشی استفاده می‌شود.</span>
        </div>

        {message && (
          <p role="status" className={success ? "az-form-status is-success" : "az-form-status is-error"}>
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
