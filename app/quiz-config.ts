export type QuizQuestion = {
  id: string;
  prompt: string;
  kind: "fact" | "analysis";
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  acceptedAnswers?: string[];
  minimumLength?: number;
  sourceNote?: string;
};

export type QuizConfig = {
  title: string;
  intro: string;
  lockMinutes: number;
  questions: QuizQuestion[];
};

export type PublicQuizQuestion = Omit<QuizQuestion, "acceptedAnswers">;
export type PublicQuizConfig = Omit<QuizConfig, "questions"> & { questions: PublicQuizQuestion[] };

export const defaultQuizConfig: QuizConfig = {
  title: "پانزده پرسش برای پانزدهم سنبله",
  intro: "این پرسش‌ها برای مطالعهٔ فعال تنظیم شده‌اند. در موارد مورد اختلاف، سؤال به خودِ منبع یا اختلاف روایت‌ها ارجاع می‌دهد تا پاسخ قطعیِ ساختگی تحمیل نشود.",
  lockMinutes: 10,
  questions: [
    {
      id: "date",
      prompt: "تاریخ تأسیس شورای انقلابی اتفاق اسلامی افغانستان چه روزی ثبت شده است؟",
      kind: "fact",
      placeholder: "روز، ماه و سال",
      hint: "تاریخ خورشیدی را دقیق بنویسید.",
      acceptedAnswers: ["15 سنبله 1358", "۱۵ سنبله ۱۳۵۸", "15سنبله1358", "۱۵سنبله۱۳۵۸"],
      sourceNote: "منبع مادر و پژوهش‌های مربوط به تشکیل شورا.",
    },
    {
      id: "waras",
      prompt: "چرا ورس برای مرکز سیاسی و اداری شورا اهمیت پیدا کرد؟",
      kind: "analysis",
      multiline: true,
      minimumLength: 40,
      placeholder: "پاسخ توضیحی",
      hint: "به جغرافیا، شبکهٔ اجتماعی و شرایط جنگ توجه کنید.",
    },
    {
      id: "election-source",
      prompt: "در روایت منبع مادر، انتخاب رئیس شورا با چه تعبیر کوتاهی توصیف شده است؟",
      kind: "fact",
      placeholder: "تعبیر منبع",
      acceptedAnswers: ["اتفاق آرا", "اتفاق آراء", "به اتفاق آرا", "به اتفاق آراء"],
      sourceNote: "این پاسخ دربارهٔ نحوهٔ توصیف در منبع مادر است، نه ادعای وجود انتخابات عمومی مدرن.",
    },
    {
      id: "ibrahimi-provinces",
      prompt: "پژوهش نیامت‌الله ابراهیمی ساخت اداری شورا را شامل چند ولایت ثبت می‌کند؟",
      kind: "fact",
      placeholder: "فقط عدد",
      acceptedAnswers: ["7", "۷", "هفت"],
      sourceNote: "Niamatullah Ibrahimi, The Failure of a Clerical Proto-State.",
    },
    {
      id: "later-provinces",
      prompt: "برخی روایت‌های متأخر نزدیک به شورا از چند ولایت یاد می‌کنند؟",
      kind: "fact",
      placeholder: "فقط عدد",
      acceptedAnswers: ["8", "۸", "هشت"],
      sourceNote: "روایت‌های متأخر نزدیک به شورا؛ این رقم با گزارش ابراهیمی یکسان نیست.",
    },
    {
      id: "domains",
      prompt: "در برخی روایت‌ها، تقسیمات شورا شامل چند حوزه معرفی شده است؟",
      kind: "fact",
      placeholder: "فقط عدد",
      acceptedAnswers: ["42", "۴۲", "چهل و دو", "چهل‌ودو"],
      sourceNote: "این رقم در روایت‌ها و بازسازی‌های ساخت اداری آمده و باید از «ولسوالی رسمی» تفکیک شود.",
    },
    {
      id: "mother-commissions",
      prompt: "منبع مادر چند کمیسیون اصلی را برای ساخت حکومت ذکر می‌کند؟",
      kind: "fact",
      placeholder: "فقط عدد",
      acceptedAnswers: ["5", "۵", "پنج"],
      sourceNote: "منبع مادر.",
    },
    {
      id: "ibrahimi-commissions",
      prompt: "در بازسازی ابراهیمی، چند محور/کمیسیون مرکزیِ اصلی ثبت شده است؟",
      kind: "fact",
      placeholder: "فقط عدد",
      acceptedAnswers: ["4", "۴", "چهار"],
      sourceNote: "پژوهش ابراهیمی؛ تفاوت با منبع مادر پنهان نمی‌شود.",
    },
    {
      id: "commission-name",
      prompt: "نام یکی از کمیسیون‌های اصلی حکومت شورا را بنویسید.",
      kind: "fact",
      placeholder: "نام یک کمیسیون",
      acceptedAnswers: ["جهاد", "جهادی", "قضا", "قضایی", "مالی", "فرهنگ", "فرهنگی", "روابط", "ارتباطات"],
    },
    {
      id: "pass",
      prompt: "سند مربوط به شناسایی و رفت‌وآمد در قلمرو شورا با چه نامی یاد شده است؟",
      kind: "fact",
      placeholder: "نام سند",
      acceptedAnswers: ["خط راهداری", "راهداری", "خط راه داری"],
    },
    {
      id: "disagreement",
      prompt: "چرا اختلاف میان «هفت ولایت» و «هشت ولایت» باید در پژوهش حفظ شود و حذف نشود؟",
      kind: "analysis",
      multiline: true,
      minimumLength: 60,
      placeholder: "تحلیل کوتاه",
      hint: "به زمان منبع، نوع سند و تحول ساخت اداری توجه کنید.",
    },
    {
      id: "administration",
      prompt: "وجود قضا، مالیه، پولیس، اسناد عبور و تقسیمات اداری دربارهٔ نوع سازمان شورا چه چیزی نشان می‌دهد؟",
      kind: "analysis",
      multiline: true,
      minimumLength: 60,
      placeholder: "تحلیل کوتاه",
    },
    {
      id: "local-vs-regional",
      prompt: "تفاوت میان یک کمیتهٔ محلی جنگی و یک حکومت منطقه‌ای چیست؟",
      kind: "analysis",
      multiline: true,
      minimumLength: 60,
      placeholder: "پاسخ توضیحی",
    },
    {
      id: "best-evidence",
      prompt: "برای حل اختلاف دربارهٔ تعداد ولایت‌ها، چه نوع سندی از همه قوی‌تر است؟",
      kind: "analysis",
      multiline: true,
      minimumLength: 50,
      placeholder: "نوع سند و دلیل خود را بنویسید",
    },
    {
      id: "reflection",
      prompt: "پس از مطالعه، کدام سند یا داده بیشترین تغییر را در برداشت شما ایجاد کرد و چرا؟",
      kind: "analysis",
      multiline: true,
      minimumLength: 120,
      placeholder: "پاسخ تحلیلی خود را بنویسید",
      hint: "پاسخ آزاد است؛ استدلال و ارتباط با شواهد مهم است.",
    },
  ],
};

export function parseQuizConfig(value: string | null | undefined): QuizConfig {
  if (!value?.trim()) return defaultQuizConfig;
  try {
    const parsed = JSON.parse(value) as Partial<QuizConfig>;
    const questions = Array.isArray(parsed.questions)
      ? parsed.questions.filter((item): item is QuizQuestion => Boolean(item && typeof item.prompt === "string" && (item.kind === "fact" || item.kind === "analysis")))
      : [];
    return {
      title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title : defaultQuizConfig.title,
      intro: typeof parsed.intro === "string" ? parsed.intro : defaultQuizConfig.intro,
      lockMinutes: Number.isFinite(parsed.lockMinutes) ? Math.max(1, Math.min(1440, Number(parsed.lockMinutes))) : defaultQuizConfig.lockMinutes,
      questions: questions.length ? questions : defaultQuizConfig.questions,
    };
  } catch {
    return defaultQuizConfig;
  }
}

export function toPublicQuizConfig(config: QuizConfig): PublicQuizConfig {
  return {
    title: config.title,
    intro: config.intro,
    lockMinutes: config.lockMinutes,
    questions: config.questions.map(({ acceptedAnswers: _acceptedAnswers, ...question }) => question),
  };
}
