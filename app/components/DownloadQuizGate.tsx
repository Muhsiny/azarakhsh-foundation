"use client";

import { useState } from "react";

type Question = { prompt: string; placeholder: string; hint: string; multiline?: boolean };

const questions: Question[] = [
  { prompt: "شورای انقلابی اتفاق اسلامی افغانستان در چه تاریخی تأسیس شد؟", placeholder: "روز، ماه و سال", hint: "تاریخ خورشیدی را دقیق بنویسید." },
  { prompt: "چرا نمایندگان مردم برای تأسیس شورا، منطقهٔ ورس را انتخاب کردند؟", placeholder: "دیدگاه خود را بنویسید", hint: "پاسخ مرتبط و توضیحی باشد.", multiline: true },
  { prompt: "رهبر شورای اتفاق با چه نوع رأیی برگزیده شد؟", placeholder: "نوع رأی", hint: "پاسخ کوتاه و دقیق باشد." },
  { prompt: "حضور گستردهٔ نمایندگان مردم در اجلاس تأسیس، چه چیزی را دربارهٔ منشأ مشروعیت شورا نشان می‌دهد؟", placeholder: "دیدگاه خود را بنویسید", hint: "پاسخ مرتبط و توضیحی باشد.", multiline: true },
  { prompt: "شورای اتفاق در ساختار رهبری خود چند معاون داشت؟", placeholder: "فقط عدد", hint: "تعداد معاونان را بنویسید." },
  { prompt: "شورای اتفاق برای تنظیم امور اداری چند منشی داشت؟", placeholder: "فقط عدد", hint: "تعداد منشیان را بنویسید." },
  { prompt: "ساختار حکومت شورای اتفاق چند کمیسیون اصلی داشت؟", placeholder: "فقط عدد", hint: "تعداد کمیسیون‌های اصلی را بنویسید." },
  { prompt: "نام یکی از کمیسیون‌های اصلی حکومت شورای اتفاق را بنویسید.", placeholder: "نام یک کمیسیون", hint: "فقط نام یک کمیسیون کافی است." },
  { prompt: "قانون یا نظام‌نامهٔ حکومت شورای اتفاق چند ماده داشت؟", placeholder: "فقط عدد", hint: "تعداد مواد را بنویسید." },
  { prompt: "قلمرو حکومت شورای اتفاق چند ولایت را دربر می‌گرفت؟", placeholder: "فقط عدد", hint: "تعداد ولایت‌ها را بنویسید." },
  { prompt: "قلمرو حکومت شورای اتفاق چند ولسوالی را دربر می‌گرفت؟", placeholder: "فقط عدد", hint: "تعداد ولسوالی‌ها را بنویسید." },
  { prompt: "قلمرو اداری حکومت شورای اتفاق به چند حوزه تقسیم شده بود؟", placeholder: "فقط عدد", hint: "تعداد حوزه‌ها را بنویسید." },
  { prompt: "سند صادرشده برای شناسایی و رفت‌وآمد افراد در قلمرو حکومت شورای اتفاق چه نام داشت؟", placeholder: "نام سند", hint: "پاسخ کوتاه و دقیق باشد." },
  { prompt: "صدور اسناد رفت‌وآمد، تنظیم حوزه‌ها و ایجاد کمیسیون‌ها چه چیزی را دربارهٔ میزان سازمان‌یافتگی حکومت شورای اتفاق نشان می‌دهد؟", placeholder: "تحلیل کوتاه خود را بنویسید", hint: "پاسخ مرتبط، توضیحی و محترمانه باشد.", multiline: true },
  { prompt: "اگر حکومت شورای اتفاق سقوط نمی‌کرد و فرصت ادامه، اصلاح و تکامل می‌یافت، به نظر شما امروز وضعیت سیاسی، اجتماعی، فرهنگی و اقتصادی شیعیان افغانستان چگونه می‌بود؟", placeholder: "تحلیل خود را با استدلال بنویسید", hint: "پاسخ تحلیلی و دست‌کم ۱۲۰ نویسه باشد.", multiline: true },
];

export default function DownloadQuizGate({ postId, fileName, downloads }: { postId: number; fileName: string; downloads: number }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<string[]>(Array(15).fill(""));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    if (!fullName.trim() || !email.trim() || !occupation.trim()) {
      setMessage("نام کامل، ایمیل و شغل خود را وارد کنید.");
      return;
    }
    if (!consent) {
      setMessage("برای ثبت پاسخ پژوهشی، موافقت شما لازم است.");
      return;
    }
    if (answers.some((answer) => !answer.trim())) {
      setMessage("لطفاً به هر ۱۵ پرسش پاسخ دهید.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/posts/${postId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, fullName, email, occupation, consent }),
      });
      const data = (await response.json().catch(() => ({}))) as { token?: string; error?: string };
      if (!response.ok || !data.token) throw new Error(data.error || "مجوز دانلود صادر نشد.");
      window.location.href = `/api/posts/${postId}/download?token=${encodeURIComponent(data.token)}`;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "مجوز دانلود صادر نشد.");
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle = { padding: 10, border: "1px solid #c7a45b", borderRadius: 7, font: "inherit", direction: "rtl" as const };

  return (
    <>
      <button type="button" className="button button-dark" onClick={() => setOpen(true)}>
        دریافت {fileName} ({downloads})
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="آزمون تاریخی پیش از دانلود" style={{ position: "fixed", inset: 0, zIndex: 13000, background: "rgba(4,27,22,.78)", overflow: "auto", padding: 18 }}>
          <section style={{ width: "min(820px,100%)", margin: "24px auto", background: "#fffdf8", color: "#173f33", borderRadius: 14, padding: 20, direction: "rtl" }}>
            <h2 style={{ marginTop: 0 }}>پانزده پرسش برای پانزدهم سنبله</h2>
            <p>این پانزده پرسش، به یاد پانزدهم سنبله؛ روز تأسیس شورای انقلابی اتفاق اسلامی افغانستان تنظیم شده است. پرسش‌های تاریخی بر اساس پاسخ درست ارزیابی می‌شوند و پرسش‌های تشریحی بر پایهٔ ارتباط با موضوع و رعایت ادب بررسی می‌شوند.</p>

            <section style={{ display: "grid", gap: 12, padding: 14, margin: "16px 0", border: "1px solid #d7c28a", borderRadius: 10 }}>
              <h3 style={{ margin: 0 }}>ثبت مشخصات پژوهشی</h3>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="نام و نام خانوادگی دقیق" autoComplete="name" style={fieldStyle} />
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ایمیل" type="email" autoComplete="email" style={{ ...fieldStyle, direction: "ltr" }} />
              <input value={occupation} onChange={(event) => setOccupation(event.target.value)} placeholder="شغل یا حوزهٔ فعالیت" autoComplete="organization-title" style={fieldStyle} />
              <p style={{ margin: 0, fontSize: 14 }}>اطلاعات و پاسخ شما برای مدیریت دسترسی، شناخت مخاطبان و پژوهش دربارهٔ میراث شورای اتفاق ثبت می‌شود. اطلاعات تماس بدون رضایت شما عمومی یا در اختیار اشخاص ثالث قرار نمی‌گیرد.</p>
              <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                <span>با ثبت مشخصات و استفادهٔ پژوهشی از پاسخ خود موافقم.</span>
              </label>
            </section>

            <div style={{ display: "grid", gap: 16 }}>
              {questions.map((question, index) => (
                <label key={question.prompt} style={{ display: "grid", gap: 7, border: "1px solid #d7c28a", borderRadius: 9, padding: 12 }}>
                  <strong>{index + 1}. {question.prompt}</strong>
                  {question.multiline ? (
                    <textarea
                      value={answers[index]}
                      placeholder={question.placeholder}
                      rows={index === 14 ? 7 : 4}
                      onChange={(event) => {
                        const next = [...answers];
                        next[index] = event.target.value;
                        setAnswers(next);
                      }}
                      style={{ ...fieldStyle, resize: "vertical" }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={answers[index]}
                      placeholder={question.placeholder}
                      autoComplete="off"
                      onChange={(event) => {
                        const next = [...answers];
                        next[index] = event.target.value;
                        setAnswers(next);
                      }}
                      style={fieldStyle}
                    />
                  )}
                  <small style={{ opacity: .76 }}>{question.hint}</small>
                </label>
              ))}
            </div>

            {message && <p style={{ marginTop: 14, fontWeight: 700 }}>{message}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <button type="button" disabled={busy} onClick={() => void submit()} style={{ padding: "10px 18px", border: 0, borderRadius: 7, background: "#173f33", color: "white" }}>
                {busy ? "در حال بررسی…" : "ثبت پاسخ و دانلود"}
              </button>
              <a href="/beheshti" target="_blank" rel="noreferrer" style={{ padding: "10px 18px", border: "1px solid #c7a45b", borderRadius: 7, textDecoration: "none" }}>تحقیق در پروندهٔ رهبر</a>
              <a href="/archive" target="_blank" rel="noreferrer" style={{ padding: "10px 18px", border: "1px solid #c7a45b", borderRadius: 7, textDecoration: "none" }}>تحقیق در پروندهٔ شورا</a>
              <button type="button" disabled={busy} onClick={() => setOpen(false)} style={{ padding: "10px 18px", border: "1px solid #aaa", borderRadius: 7, background: "transparent" }}>لغو</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
