"use client";

import { useState } from "react";

type Question = { prompt: string; placeholder: string; hint: string };

const questions: Question[] = [
  {
    prompt: "آیت‌الله سید علی بهشتی در چه سالی زاده شد؟",
    placeholder: "مثال: ۱۳۰۸",
    hint: "فقط سال را بنویسید.",
  },
  {
    prompt: "زادگاه آیت‌الله بهشتی چه نام داشت؟",
    placeholder: "یک یا دو کلمه",
    hint: "نام روستا یا منطقه کافی است.",
  },
  {
    prompt: "آیت‌الله بهشتی چند سال در نجف تحصیل و تدریس کرد؟",
    placeholder: "فقط عدد",
    hint: "فقط تعداد سال را بنویسید.",
  },
  {
    prompt: "شورای انقلابی اتفاق اسلامی افغانستان در چه تاریخی تأسیس شد؟",
    placeholder: "روز، ماه، سال",
    hint: "تاریخ خورشیدی را بنویسید.",
  },
  {
    prompt: "آیت‌الله بهشتی در اجلاس تأسیس شورا برای چند سال به ریاست برگزیده شد؟",
    placeholder: "فقط عدد",
    hint: "مدت انتخاب اولیه را بنویسید.",
  },
  {
    prompt: "حکومت محلی شورای اتفاق تا چه سالی دوام یافت؟",
    placeholder: "فقط سال",
    hint: "سال پایان حکومت محلی را بنویسید.",
  },
  {
    prompt: "شورای اتفاق در چه سالی به روند تشکیل حزب وحدت پیوست؟",
    placeholder: "فقط سال",
    hint: "سال پیوستن به وحدت را بنویسید.",
  },
  {
    prompt: "آیت‌الله بهشتی در چه سالی درگذشت؟",
    placeholder: "فقط سال",
    hint: "سال خورشیدی وفات را بنویسید.",
  },
  {
    prompt: "قلمرو حکومت شورای اتفاق چند ولسوالی را در بر می‌گرفت؟",
    placeholder: "فقط عدد",
    hint: "تعداد ولسوالی‌ها را بنویسید.",
  },
  {
    prompt: "حکومت شورای اتفاق چند کمیسیون اصلی داشت؟",
    placeholder: "فقط عدد",
    hint: "تعداد کمیسیون‌های اصلی را بنویسید.",
  },
];

export default function DownloadQuizGate({ postId, fileName, downloads }: { postId: number; fileName: string; downloads: number }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(""));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    if (answers.some((answer) => !answer.trim())) {
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
        <div role="dialog" aria-modal="true" aria-label="آزمون تاریخی پیش از دانلود" style={{ position: "fixed", inset: 0, zIndex: 13000, background: "rgba(4,27,22,.78)", overflow: "auto", padding: 18 }}>
          <section style={{ width: "min(760px,100%)", margin: "24px auto", background: "#fffdf8", color: "#173f33", borderRadius: 14, padding: 20, direction: "rtl" }}>
            <h2 style={{ marginTop: 0 }}>آزمون کوتاه تاریخ آذرخش</h2>
            <p>پاسخ هر پرسش باید فقط یک تاریخ، یک عدد یا حداکثر دو کلمه باشد. برای دانلود، هر ۱۰ پاسخ باید درست باشد.</p>

            <div style={{ display: "grid", gap: 16 }}>
              {questions.map((question, index) => (
                <label key={question.prompt} style={{ display: "grid", gap: 7, border: "1px solid #d7c28a", borderRadius: 9, padding: 12 }}>
                  <strong>{index + 1}. {question.prompt}</strong>
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
                    style={{ padding: 10, border: "1px solid #c7a45b", borderRadius: 7, font: "inherit", direction: "rtl" }}
                  />
                  <small style={{ opacity: .76 }}>{question.hint}</small>
                </label>
              ))}
            </div>

            {message && <p style={{ marginTop: 14, fontWeight: 700 }}>{message}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <button type="button" disabled={busy} onClick={() => void submit()} style={{ padding: "10px 18px", border: 0, borderRadius: 7, background: "#173f33", color: "white" }}>
                {busy ? "در حال بررسی…" : "بررسی و دانلود"}
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
