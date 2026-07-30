"use client";

import { useState } from "react";

type Question = { prompt: string; options: string[]; hint: string };

const questions: Question[] = [
  {
    prompt: "آیت‌الله سید علی بهشتی در چه سال و در کجا زاده شد؟",
    options: ["۱۳۰۸ش، سنگ‌تختِ ورس", "۱۳۱۸ش، کابل", "۱۲۹۸ش، نجف", "۱۳۲۸ش، یکاولنگ"],
    hint: "برای پاسخ، بخش «خاندان و تولد» پروندهٔ رهبر را مطالعه کنید.",
  },
  {
    prompt: "مسیر اصلی تحصیل آیت‌الله بهشتی کدام بود؟",
    options: ["آغاز نزد پدر و علمای محلی، حدود شش سال در یکاولنگ، سپس نجف", "فقط کابل و هرات", "مشهد، قم و دمشق", "فقط آموزش خصوصی در ورس"],
    hint: "نام استادان و مسیر یکاولنگ تا نجف در بخش «تحصیلات و استادان» آمده است.",
  },
  {
    prompt: "کدام مجموعه از نهادهایی است که آیت‌الله بهشتی در ایجاد یا بنیان‌گذاری آن‌ها نقش مستقیم داشت؟",
    options: ["مدرسهٔ علمیهٔ سنگ‌تخت، مدرسهٔ باقریه و شورای انقلابی اتفاق اسلامی افغانستان", "دانشگاه کابل و بانک مرکزی", "سازمان نصر و پاسداران جهاد", "حزب دموکراتیک خلق و شورای ملی"],
    hint: "به فعالیت‌های علمی پس از بازگشت از نجف و سپس نهادسازی سیاسی او توجه کنید.",
  },
  {
    prompt: "چرا نمایندگان مردم آیت‌الله بهشتی را به ریاست شورای اتفاق برگزیدند؟",
    options: ["به‌سبب اعتبار علمی و دینی، حل اختلافات، نفوذ مردمی و نقش او در آزادسازی و سازمان‌دهی مناطق", "به‌سبب حمایت ارتش شوروی", "به‌سبب انتصاب از کابل", "به‌سبب ثروت شخصی و مالکیت زمین"],
    hint: "پاسخ را در پیوند میان آموزش، حل منازعات، جهاد و اعتماد عمومی جست‌وجو کنید.",
  },
  {
    prompt: "حکومت محلی شورای اتفاق از ۱۳۵۸ تا ۱۳۶۴ دوام یافت؛ این دوره تقریباً چند سال بود؟",
    options: ["شش سال", "سه سال", "ده سال", "یک سال"],
    hint: "میان «دورهٔ انتخاب اولیه» و «مدت دوام حکومت محلی» تفاوت بگذارید.",
  },
  {
    prompt: "چرا آیت‌الله بهشتی در سال ۱۳۶۸ به روند تشکیل حزب وحدت اسلامی پیوست؟",
    options: ["برای تکمیل حلقهٔ نهایی وحدت جریان‌های شیعی و بازگرداندن همه نیروها به یک محور مشترک", "برای انحلال کامل همه شوراهای محلی", "برای پیوستن به دولت کمونیستی", "برای کناره‌گیری کامل از سیاست"],
    hint: "در منابع، پیوستن او «تکمیل حلقهٔ نهایی وحدت» توصیف شده است.",
  },
  {
    prompt: "مهم‌ترین نقش آیت‌الله بهشتی در ساختار حزب وحدت چه بود؟",
    options: ["حضور در شورای عالی نظارت و ایفای نقش وحدت‌بخش و نظارتی", "فرماندهی نیروی هوایی", "مسئولیت وزارت مالیه", "ریاست دستگاه تبلیغاتی خارجی"],
    hint: "به جایگاه او در شورای عالی نظارت و نقش او در مشروعیت‌بخشی و نظارت سیاسی توجه کنید.",
  },
  {
    prompt: "آیت‌الله بهشتی چند سال عمر کرد و در چه سالی درگذشت؟",
    options: ["۶۷ سال؛ ۱۳۷۵ش", "۵۷ سال؛ ۱۳۶۵ش", "۷۷ سال؛ ۱۳۸۵ش", "۴۷ سال؛ ۱۳۵۵ش"],
    hint: "سال تولد و وفات را کنار هم بگذارید.",
  },
  {
    prompt: "کدام گزینه مجموعه‌ای از آثار و نوشته‌های ثبت‌شدهٔ آیت‌الله بهشتی را درست‌تر نشان می‌دهد؟",
    options: ["تقریرات فقه و اصول، الارجوزة فی اصول الفقه، نوشته‌های شرح رسائل و قوانین، تجربه و مبارزه و اخلاق", "فقط یک دیوان شعر", "کتاب‌های پزشکی و مهندسی", "هیچ اثر علمی از او باقی نمانده است"],
    hint: "بخش «آثار علمی» را با دقت بخوانید؛ برخی آثار کتاب مستقل و برخی تقریرات و یادداشت‌های درسی‌اند.",
  },
  {
    prompt: "کدام ترکیب، ساختار قلمرو و ادارهٔ حکومت شورای اتفاق را درست بیان می‌کند؟",
    options: ["۸ ولایت، ۴۲ ولسوالی، ۱۵ حوزه و ۵ کمیسیون اصلی", "۵ ولایت، ۱۵ ولسوالی و ۲ کمیسیون", "۱۲ ولایت، ۶۰ ولسوالی و بدون کمیسیون", "۲ ولایت، ۸ ولسوالی و یک کمیسیون"],
    hint: "در بخش ساختار حکومت، هم تقسیمات جغرافیایی و هم کمیسیون‌های جهاد، فرهنگی، مالی، ارتباطات و قضا را بررسی کنید.",
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
        <div role="dialog" aria-modal="true" aria-label="آزمون تاریخی پیش از دانلود" style={{ position: "fixed", inset: 0, zIndex: 13000, background: "rgba(4,27,22,.78)", overflow: "auto", padding: 18 }}>
          <section style={{ width: "min(820px,100%)", margin: "24px auto", background: "#fffdf8", color: "#173f33", borderRadius: 14, padding: 20, direction: "rtl" }}>
            <h2 style={{ marginTop: 0 }}>آزمون حافظهٔ تاریخی آذرخش</h2>
            <p>این آزمون برای حفظ‌کردن چند عدد ساخته نشده است؛ هدف آن شناخت مسیر زندگی، منطق اعتماد مردم، نهادسازی، وحدت‌خواهی و کارنامهٔ حکومتی آیت‌الله بهشتی است. برای دانلود باید هر ۱۰ پاسخ درست باشد.</p>

            <div style={{ display: "grid", gap: 16 }}>
              {questions.map((question, index) => (
                <fieldset key={question.prompt} style={{ border: "1px solid #d7c28a", borderRadius: 9, padding: 12 }}>
                  <legend style={{ fontWeight: 700, padding: "0 6px" }}>{index + 1}. {question.prompt}</legend>
                  <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                    {question.options.map((option) => (
                      <label key={option} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="radio" name={`question-${index}`} value={option} checked={answers[index] === option} onChange={(event) => {
                          const next = [...answers];
                          next[index] = event.target.value;
                          setAnswers(next);
                        }} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <small style={{ display: "block", marginTop: 9, opacity: .78 }}>{question.hint}</small>
                </fieldset>
              ))}
            </div>

            {message && <p style={{ marginTop: 14, fontWeight: 700 }}>{message}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <button type="button" disabled={busy} onClick={() => void submit()} style={{ padding: "10px 18px", border: 0, borderRadius: 7, background: "#173f33", color: "white" }}>
                {busy ? "در حال بررسی پاسخ‌ها…" : "بررسی پاسخ‌ها و دانلود"}
              </button>
              <a href="/beheshti" target="_blank" rel="noreferrer" style={{ padding: "10px 18px", border: "1px solid #c7a45b", borderRadius: 7, textDecoration: "none" }}>مطالعهٔ پروندهٔ رهبر</a>
              <a href="/archive" target="_blank" rel="noreferrer" style={{ padding: "10px 18px", border: "1px solid #c7a45b", borderRadius: 7, textDecoration: "none" }}>مطالعهٔ پروندهٔ شورای اتفاق</a>
              <button type="button" disabled={busy} onClick={() => setOpen(false)} style={{ padding: "10px 18px", border: "1px solid #aaa", borderRadius: 7, background: "transparent" }}>لغو</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
