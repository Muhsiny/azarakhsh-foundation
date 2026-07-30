"use client";

import { useState } from "react";

type Question = { prompt: string; options: string[] };

const questions: Question[] = [
  {
    prompt: "آیت‌الله سید علی بهشتی پس از بازگشت از نجف، در کدام منطقه حوزهٔ علمی برپا کرد؟",
    options: ["ورس", "کابل", "هرات", "مزارشریف"],
  },
  {
    prompt: "اجتماع بزرگ نمایندگان مناطق مرکزی که زمینهٔ تأسیس شورای انقلابی اتفاق اسلامی افغانستان را فراهم کرد، در کجا برگزار شد؟",
    options: ["ورس", "غزنی", "بامیان مرکزی", "کویته"],
  },
  {
    prompt: "شورای انقلابی اتفاق اسلامی افغانستان در چه تاریخی تأسیس شد؟",
    options: ["۱۵ سنبلهٔ ۱۳۵۸", "۷ ثور ۱۳۵۷", "۲۴ حوت ۱۳۵۷", "۱ حمل ۱۳۵۹"],
  },
  {
    prompt: "آیت‌الله بهشتی برای چه مدتی به ریاست شورای انقلابی اتفاق اسلامی افغانستان برگزیده شد؟",
    options: ["سه سال", "یک سال", "پنج سال", "مادام‌العمر"],
  },
  {
    prompt: "قلمرو حکومت شورای اتفاق چند ولسوالی را در بر می‌گرفت؟",
    options: ["۴۲ ولسوالی", "۱۵ ولسوالی", "۸ ولسوالی", "۶۰ ولسوالی"],
  },
  {
    prompt: "قلمرو حکومت شورای اتفاق در چند ولایت گسترده بود؟",
    options: ["۸ ولایت", "۴ ولایت", "۱۲ ولایت", "۲ ولایت"],
  },
  {
    prompt: "ساختار اداری شورای اتفاق به چند حوزه تقسیم شده بود؟",
    options: ["۱۵ حوزه", "۱۰ حوزه", "۲۰ حوزه", "۴۲ حوزه"],
  },
  {
    prompt: "کدام مورد از نهادها و مسئولیت‌های رسمی حکومت شورای اتفاق بود؟",
    options: ["قضا، مالیه، دارالانشا و فرماندهی جهاد", "فقط تبلیغات", "فقط امور مذهبی", "فقط فرماندهی نظامی"],
  },
  {
    prompt: "سند عبور صادرشده از سوی حکومت شورای اتفاق چه نام داشت؟",
    options: ["خط راهداری", "تذکرهٔ جهادی", "فرمان عبور", "برگهٔ مهاجرت"],
  },
  {
    prompt: "قطعنامهٔ نخستین اجلاس شورای انقلابی اتفاق اسلامی افغانستان چند ماده داشت؟",
    options: ["۱۷ ماده", "۹۰ ماده", "۱۵ ماده", "۴۲ ماده"],
  },
];

export default function DownloadQuizGate({ postId, fileName, downloads }: { postId: number; fileName: string; downloads: number }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(""));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    if (answers.some((answer) => !answer)) {
      setMessage("لطفاً به هر ۱۰ پرسش پاسخ دهید.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/posts/${postId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
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

  return (
    <>
      <button type="button" className="button button-dark" onClick={() => setOpen(true)}>
        دریافت {fileName} ({downloads})
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="آزمون تاریخی پیش از دانلود"
          style={{ position: "fixed", inset: 0, zIndex: 13000, background: "rgba(4,27,22,.78)", overflow: "auto", padding: 18 }}
        >
          <section style={{ width: "min(800px,100%)", margin: "24px auto", background: "#fffdf8", color: "#173f33", borderRadius: 14, padding: 20, direction: "rtl" }}>
            <h2 style={{ marginTop: 0 }}>آزمون تاریخ آیت‌الله بهشتی و حکومت شورای اتفاق</h2>
            <p>برای دریافت فایل، به هر ۱۰ پرسش پاسخ درست بدهید. پاسخ‌های نادرست دوباره قابل اصلاح‌اند.</p>

            <div style={{ display: "grid", gap: 16 }}>
              {questions.map((question, index) => (
                <fieldset key={question.prompt} style={{ border: "1px solid #d7c28a", borderRadius: 9, padding: 12 }}>
                  <legend style={{ fontWeight: 700, padding: "0 6px" }}>{index + 1}. {question.prompt}</legend>
                  <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                    {question.options.map((option) => (
                      <label key={option} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={(event) => {
                            const next = [...answers];
                            next[index] = event.target.value;
                            setAnswers(next);
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

            {message && <p style={{ marginTop: 14, fontWeight: 700 }}>{message}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button type="button" disabled={busy} onClick={() => void submit()} style={{ padding: "10px 18px", border: 0, borderRadius: 7, background: "#173f33", color: "white" }}>
                {busy ? "در حال بررسی پاسخ‌ها…" : "بررسی پاسخ‌ها و دانلود"}
              </button>
              <button type="button" disabled={busy} onClick={() => setOpen(false)} style={{ padding: "10px 18px", border: "1px solid #aaa", borderRadius: 7, background: "transparent" }}>
                لغو
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
