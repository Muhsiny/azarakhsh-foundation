"use client";

import { useEffect, useState } from "react";
import type { PublicQuizConfig } from "../quiz-config";

export default function DownloadQuizGate({
  postId,
  fileName,
  downloads,
  enabled,
  config,
}: {
  postId: number;
  fileName: string;
  downloads: number;
  enabled: boolean;
  config: PublicQuizConfig;
}) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<string[]>(() => Array(config.questions.length).fill(""));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setAnswers(Array(config.questions.length).fill(""));
  }, [config.questions.length]);

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
    if (answers.length !== config.questions.length || answers.some((answer) => !answer.trim())) {
      setMessage("لطفاً به همهٔ پرسش‌ها پاسخ دهید.");
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

  if (!enabled) {
    return (
      <a className="az-action az-action-primary az-download-trigger" href={"/api/posts/" + postId + "/download"}>
        دریافت {fileName} <span aria-label={downloads + " بار دریافت"}>({downloads})</span>
      </a>
    );
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
                <h2 id="az-quiz-title">{config.title}</h2>
              </div>
              <button className="az-quiz-close" type="button" onClick={() => setOpen(false)} disabled={busy} aria-label="بستن پنجره">×</button>
            </div>
            <p id="az-quiz-intro">{config.intro}</p>

            <section className="az-quiz-profile">
              <h3>مشخصات پژوهشی</h3>
              <div className="az-field-grid">
                <label>نام و نام خانوادگی<input className="az-form-control" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" /></label>
                <label>ایمیل<input className="az-form-control" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" dir="ltr" /></label>
                <label>شغل یا حوزهٔ فعالیت<input className="az-form-control" value={occupation} onChange={(event) => setOccupation(event.target.value)} autoComplete="organization-title" /></label>
              </div>
              <p>این اطلاعات برای مدیریت دسترسی و تحلیل پژوهشی پاسخ‌ها ثبت می‌شود و اطلاعات تماس بدون رضایت شما عمومی یا در اختیار اشخاص ثالث قرار نمی‌گیرد.</p>
              <label className="az-consent-box az-consent-compact">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                <span>با ثبت مشخصات و استفادهٔ پژوهشی از پاسخ خود موافقم.</span>
              </label>
            </section>

            <div className="az-quiz-questions">
              {config.questions.map((question, index) => (
                <label className="az-quiz-question" key={question.id || String(index)}>
                  <span className="az-quiz-number">{(index + 1).toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</span>
                  <strong>{question.prompt}</strong>
                  {question.multiline || question.kind === "analysis" ? (
                    <textarea
                      className="az-form-control"
                      value={answers[index] || ""}
                      placeholder={question.placeholder || "پاسخ خود را بنویسید"}
                      rows={index === config.questions.length - 1 ? 7 : 4}
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
                      value={answers[index] || ""}
                      placeholder={question.placeholder || "پاسخ"}
                      autoComplete="off"
                      onChange={(event) => {
                        const next = [...answers];
                        next[index] = event.target.value;
                        setAnswers(next);
                      }}
                    />
                  )}
                  {question.hint && <small>{question.hint}</small>}
                  {question.sourceNote && <small><b>راهنمای منبع:</b> {question.sourceNote}</small>}
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
