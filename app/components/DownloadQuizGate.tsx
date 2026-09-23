"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy]);

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
      const response = await fetch("/api/posts/" + postId + "/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, fullName, email, occupation, consent }),
      });
      const data = (await response.json().catch(() => ({}))) as { token?: string; error?: string };
      if (!response.ok || !data.token) throw new Error(data.error || "مجوز دانلود صادر نشد.");
      window.location.href = "/api/posts/" + postId + "/download?token=" + encodeURIComponent(data.token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "مجوز دانلود صادر نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="az-action az-action-primary az-download-trigger" onClick={() => setOpen(true)}>
        دریافت {fileName} <span aria-label={downloads + " بار دریافت"}>({downloads})</span>
      </button>

      {open && (
        <div className="az-quiz-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !busy) setOpen(false);
        }}>
          <section
            className="az-quiz-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="az-quiz-title"
            aria-describedby="az-quiz-intro"
          >
            <div className="az-quiz-header">
              <div>
                <span className="section-kicker">دسترسی پژوهشی به فایل</span>
                <h2 id="az-quiz-title">پانزده پرسش برای پانزدهم سنبله</h2>
              </div>
              <button className="az-quiz-close" type="button" onClick={() => setOpen(false)} disabled={busy} aria-label="بستن پنجره">
                ×
              </button>
            </div>
            <p id="az-quiz-intro">
              این پرسش‌ها به یاد پانزدهم سنبله، روز تأسیس شورای انقلابی اتفاق اسلامی افغانستان، تنظیم شده‌اند.
              پرسش‌های تاریخی بر پایهٔ پاسخ درست و پرسش‌های تشریحی بر پایهٔ ارتباط با موضوع و رعایت ادب بررسی می‌شوند.
            </p>

            <section className="az-quiz-profile">
              <h3>مشخصات پژوهشی</h3>
              <div className="az-field-grid">
                <label>نام و نام خانوادگی<input className="az-form-control" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" /></label>
                <label>ایمیل<input className="az-form-control" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" dir="ltr" /></label>
                <label>شغل یا حوزهٔ فعالیت<input className="az-form-control" value={occupation} onChange={(event) => setOccupation(event.target.value)} autoComplete="organization-title" /></label>
              </div>
              <p>
                این اطلاعات برای مدیریت دسترسی و شناخت مخاطبان پژوهشی ثبت می‌شود و اطلاعات تماس بدون رضایت شما عمومی یا در اختیار اشخاص ثالث قرار نمی‌گیرد.
              </p>
              <label className="az-consent-box az-consent-compact">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                <span>با ثبت مشخصات و استفادهٔ پژوهشی از پاسخ خود موافقم.</span>
              </label>
            </section>

            <div className="az-quiz-questions">
              {questions.map((question, index) => (
                <label className="az-quiz-question" key={question.prompt}>
                  <span className="az-quiz-number">{(index + 1).toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</span>
                  <strong>{question.prompt}</strong>
                  {question.multiline ? (
                    <textarea
                      className="az-form-control"
                      value={answers[index]}
                      placeholder={question.placeholder}
                      rows={index === 14 ? 7 : 4}
                      onChange={(event) => {
                        const next = [...answers];
                        next[index] = event.target.value;
                        setAnswers(next);
                      }}
                    />
                  ) : (
                    <input
                      className="az-form-control"
                      type="text"
                      value={answers[index]}
                      placeholder={question.placeholder}
                      autoComplete="off"
                      onChange={(event) => {
                        const next = [...answers];
                        next[index] = event.target.value;
                        setAnswers(next);
                      }}
                    />
                  )}
                  <small>{question.hint}</small>
                </label>
              ))}
            </div>

            {message && <p className="az-form-status is-error" role="status">{message}</p>}

            <div className="az-quiz-actions">
              <button className="az-action az-action-primary" type="button" disabled={busy} onClick={() => void submit()}>
                {busy ? "در حال بررسی…" : "ثبت پاسخ و دانلود"}
              </button>
              <a className="az-action az-action-secondary" href="/beheshti" target="_blank" rel="noreferrer">پروندهٔ رهبر</a>
              <a className="az-action az-action-secondary" href="/archive" target="_blank" rel="noreferrer">آرشیف شورا</a>
              <button className="az-text-link" type="button" disabled={busy} onClick={() => setOpen(false)}>انصراف</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
