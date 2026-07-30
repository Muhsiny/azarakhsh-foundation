"use client";

import { useEffect, useState } from "react";

const purposes = [
  ["oral-history", "مطالعهٔ روایت‌ها و خاطرات تاریخی"],
  ["research", "مطالعهٔ مقاله‌ها و پژوهش‌ها"],
  ["leader", "شناخت زندگی و اندیشه‌های آیت‌الله سید علی بهشتی"],
  ["government", "تحقیق دربارهٔ حکومت شورای انقلابی اتفاق اسلامی افغانستان"],
  ["archive", "دسترسی به کتاب‌ها، اسناد و فایل‌های تاریخی"],
  ["contribute", "ارائهٔ روایت، خاطره، سند یا تصویر"],
  ["academic", "استفاده برای تحقیق دانشگاهی یا رسانه‌ای"],
  ["general", "آشنایی عمومی با تاریخ مناطق مرکزی"],
  ["other", "هدف دیگر"],
] as const;

const questions = [
  "هشتم ثور در تاریخ افغانستان یادآور کدام رویداد است؟",
  "به نظر شما سهم مردم مناطق مرکزی در جهاد افغانستان چگونه باید ثبت و روایت شود؟",
  "حکومت شورای اتفاق چه نقشی در تبدیل مقاومت‌های پراکنده به نظم سیاسی و اداری داشت؟",
  "آیت‌الله سید علی بهشتی در پیوند میان علما، مجاهدین و نمایندگان مردم چه نقشی ایفا کرد؟",
  "چرا آزادسازی مناطق بدون ایجاد اداره و قانون مشترک می‌توانست به هرج‌ومرج منجر شود؟",
  "کدام بخش از تاریخ قیام و حکومت مردم مناطق مرکزی کمتر شناخته شده و نیازمند پژوهش است؟",
  "در روایت‌های تاریخی، نقش اکبر پاریزی در جلسهٔ سنگ‌تخت و روند فروپاشی حکومت شورای انقلابی اتفاق اسلامی افغانستان چگونه توصیف شده است؟",
  "مهم‌ترین دلیل شما برای بازکردن وب‌سایت بنیاد آذرخش چیست و انتظار دارید به کدام منبع یا بخش راهنمایی شوید؟",
];

export default function VisitorAccessGate() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<"profile" | "code">("profile");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [job, setJob] = useState("");
  const [purpose, setPurpose] = useState("");
  const [purposeOther, setPurposeOther] = useState("");
  const [answers, setAnswers] = useState<string[]>(Array(8).fill(""));
  const [code, setCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/api")) return;
    fetch("/api/visitor/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname }),
    })
      .then((response) => response.json())
      .then((data) => setVisible(!data.verified))
      .catch(() => setVisible(true));
  }, []);

  async function sendCode() {
    if (!fullName.trim() || !email.trim() || !job.trim() || !purpose || answers.some((answer) => answer.trim().length < 3) || !consent) {
      setMessage("همهٔ بخش‌ها را تکمیل کنید و رضایت پژوهشی را بپذیرید.");
      return;
    }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/visitor/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "ارسال کد انجام نشد.");
      setStep("code");
      setMessage("کد شش‌رقمی به ایمیل شما فرستاده شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ارسال کد انجام نشد.");
    } finally { setBusy(false); }
  }

  async function verify() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/visitor/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, job, purpose, purposeOther, answers, code }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "تأیید انجام نشد.");
      setVisible(false);
      location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تأیید انجام نشد.");
    } finally { setBusy(false); }
  }

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 20000, background: "rgba(4,27,22,.96)", overflow: "auto", padding: 18, direction: "rtl" }}>
      <main style={{ width: "min(820px,100%)", margin: "24px auto", background: "#fffdf8", color: "#173f33", borderRadius: 16, padding: 22 }}>
        <p style={{ margin: 0, color: "#8a6a22", fontWeight: 700 }}>ورود پژوهشی بنیاد آذرخش</p>
        <h1 style={{ margin: "8px 0" }}>هشت پرسش برای هشتم ثور</h1>
        <p>به مناسبت هشتم ثور؛ روز پیروزی مجاهدین افغانستان. پاسخ‌ها برای شناخت مخاطبان، هدایت بهتر به منابع و پژوهش تاریخی بنیاد ثبت می‌شوند.</p>

        {step === "profile" ? (
          <div style={{ display: "grid", gap: 14 }}>
            <label>نام و نام خانوادگی<input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} /></label>
            <label>ایمیل<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} /></label>
            <label>شغل یا حوزهٔ فعالیت<input value={job} onChange={(e) => setJob(e.target.value)} style={inputStyle} /></label>
            <label>هدف اصلی شما از ورود به وب‌سایت چیست؟
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={inputStyle}>
                <option value="">انتخاب کنید</option>
                {purposes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            {purpose === "other" && <label>هدف دیگر<input value={purposeOther} onChange={(e) => setPurposeOther(e.target.value)} style={inputStyle} /></label>}

            {questions.map((question, index) => (
              <label key={question} style={{ display: "grid", gap: 7, border: "1px solid #d7c28a", padding: 12, borderRadius: 9 }}>
                <strong>{index + 1}. {question}</strong>
                <textarea rows={index >= 6 ? 5 : 3} value={answers[index]} onChange={(e) => {
                  const next = [...answers]; next[index] = e.target.value; setAnswers(next);
                }} style={{ ...inputStyle, resize: "vertical" }} />
              </label>
            ))}

            <label style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>با ثبت مشخصات، پاسخ‌ها و سابقهٔ بازدید برای امنیت دسترسی، راهنمایی مخاطب و پژوهش تاریخی موافقم. اطلاعات من بدون رضایت به‌صورت عمومی منتشر نمی‌شود.</span>
            </label>
            <button type="button" disabled={busy} onClick={() => void sendCode()} style={buttonStyle}>{busy ? "در حال ارسال…" : "ارسال کد تأیید به ایمیل"}</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <p>کد ارسال‌شده به <strong>{email}</strong> را وارد کنید.</p>
            <input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} style={{ ...inputStyle, fontSize: 24, textAlign: "center", letterSpacing: 6 }} />
            <button type="button" disabled={busy || code.length !== 6} onClick={() => void verify()} style={buttonStyle}>{busy ? "در حال تأیید…" : "تأیید و ورود به سایت"}</button>
            <button type="button" disabled={busy} onClick={() => setStep("profile")} style={{ ...buttonStyle, background: "transparent", color: "#173f33", border: "1px solid #c7a45b" }}>بازگشت و اصلاح مشخصات</button>
          </div>
        )}
        {message && <p style={{ marginTop: 14, fontWeight: 700 }}>{message}</p>}
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", marginTop: 6, padding: 10, border: "1px solid #c7a45b", borderRadius: 7, font: "inherit", direction: "rtl" };
const buttonStyle: React.CSSProperties = { padding: "11px 18px", border: 0, borderRadius: 8, background: "#173f33", color: "white", font: "inherit", cursor: "pointer" };
