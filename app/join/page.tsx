"use client";

import { FormEvent, useState } from "react";
import "./join.css";

export default function JoinPage() {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/membership", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const data = (await response.json()) as { error?: string };
    setMessage(
      response.ok
        ? "درخواست شما ثبت شد و پس از بررسی مدیر پاسخ داده می‌شود."
        : data.error ?? "ثبت درخواست انجام نشد.",
    );
    if (response.ok) event.currentTarget.reset();
    setSaving(false);
  }

  return (
    <main className="membership-page">
      <a className="membership-back" href="/">بازگشت به بنیاد ←</a>
      <section className="membership-layout">
        <div className="membership-intro">
          <img src="/azarakhsh-logo-transparent-web.png" alt="نشان بنیاد آذرخش" />
          <p className="section-kicker section-kicker-light">عضویت پژوهشی</p>
          <h1>به شبکهٔ علمی بنیاد آذرخش بپیوندید.</h1>
          <p>
            پژوهشگران، نویسندگان، مجموعه‌داران اسناد و همکاران علمی می‌توانند
            درخواست عضویت بفرستند. دسترسی پس از بررسی مدیر فعال می‌شود.
          </p>
        </div>
        <form className="membership-form" onSubmit={submit}>
          <label>نام کامل<input autoComplete="name" name="fullName" required /></label>
          <label>ایمیل<input autoComplete="email" inputMode="email" name="email" required type="email" /></label>
          <label>سازمان یا حوزهٔ فعالیت<input autoComplete="organization" name="organization" /></label>
          <label>هدف از عضویت<textarea name="reason" rows={6} required /></label>
          <button className="button button-dark" disabled={saving} type="submit">
            {saving ? "در حال ثبت..." : "ارسال درخواست عضویت"}
          </button>
          {message && <p className="admin-message" role="status">{message}</p>}
        </form>
      </section>
    </main>
  );
}
