"use client";

import { useState } from "react";

const questions = [
  "هدف شما از دریافت این فایل چیست؟",
  "آیا در استفاده از این اثر، نام منبع را ذکر می‌کنید؟",
  "آیا از تحریف یا نسبت‌دادن مطالب نادرست به اثر خودداری می‌کنید؟",
  "آیا این فایل را برای مطالعه، پژوهش یا آموزش استفاده می‌کنید؟",
  "آیا هنگام نقل مطلب، عنوان اثر و ناشر را درج می‌کنید؟",
  "آیا میان متن اصلی و برداشت شخصی خود تفاوت می‌گذارید؟",
  "آیا از بازنشر ناقص و گمراه‌کننده خودداری می‌کنید؟",
  "آیا حقوق معنوی نویسنده و بنیاد را رعایت می‌کنید؟",
  "آیا در صورت یافتن خطا یا سند تازه، بنیاد را آگاه می‌سازید؟",
  "آیا مسئولیت استفاده درست از این فایل را می‌پذیرید؟",
];

const options = ["بلی", "خیر", "برای پژوهش شخصی"];

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
          aria-label="پرسش‌های پیش از دانلود"
          style={{ position: "fixed", inset: 0, zIndex: 13000, background: "rgba(4,27,22,.78)", overflow: "auto", padding: 18 }}
        >
          <section style={{ width: "min(760px,100%)", margin: "24px auto", background: "#fffdf8", color: "#173f33", borderRadius: 14, padding: 20, direction: "rtl" }}>
            <h2 style={{ marginTop: 0 }}>پیش از دانلود، به ۱۰ پرسش پاسخ دهید</h2>
            <p>پس از تکمیل همه پاسخ‌ها، مجوز دانلود این فایل برای مدت کوتاه صادر می‌شود.</p>

            <div style={{ display: "grid", gap: 14 }}>
              {questions.map((question, index) => (
                <label key={question} style={{ display: "grid", gap: 7 }}>
                  <strong>{index + 1}. {question}</strong>
                  <select
                    value={answers[index]}
                    onChange={(event) => {
                      const next = [...answers];
                      next[index] = event.target.value;
                      setAnswers(next);
                    }}
                    style={{ padding: 10, border: "1px solid #c7a45b", borderRadius: 7, font: "inherit" }}
                  >
                    <option value="">انتخاب پاسخ</option>
                    {options.map((option) => <option value={option} key={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </div>

            {message && <p style={{ marginTop: 14 }}>{message}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button type="button" disabled={busy} onClick={() => void submit()} style={{ padding: "10px 18px", border: 0, borderRadius: 7, background: "#173f33", color: "white" }}>
                {busy ? "در حال صدور مجوز…" : "تأیید و دانلود"}
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
