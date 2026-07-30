import { createDownloadPermit } from "../../../../download-gate";

const correctAnswers = [
  "۱۳۰۸ش، سنگ‌تختِ ورس",
  "آغاز نزد پدر و علمای محلی، حدود شش سال در یکاولنگ، سپس نجف",
  "مدرسهٔ علمیهٔ سنگ‌تخت، مدرسهٔ باقریه و شورای انقلابی اتفاق اسلامی افغانستان",
  "به‌سبب اعتبار علمی و دینی، حل اختلافات، نفوذ مردمی و نقش او در آزادسازی و سازمان‌دهی مناطق",
  "شش سال",
  "برای تکمیل حلقهٔ نهایی وحدت جریان‌های شیعی و بازگرداندن همه نیروها به یک محور مشترک",
  "حضور در شورای عالی نظارت و ایفای نقش وحدت‌بخش و نظارتی",
  "۶۷ سال؛ ۱۳۷۵ش",
  "تقریرات فقه و اصول، الارجوزة فی اصول الفقه، نوشته‌های شرح رسائل و قوانین، تجربه و مبارزه و اخلاق",
  "۸ ولایت، ۴۲ ولسوالی، ۱۵ حوزه و ۵ کمیسیون اصلی",
];

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "فایل معتبر نیست." }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as { answers?: unknown[] };
    const answers = Array.isArray(payload.answers) ? payload.answers : [];
    const complete = answers.length === correctAnswers.length && answers.every((answer) => typeof answer === "string" && answer.trim().length > 0);
    if (!complete) {
      return Response.json({ error: "برای دانلود، به هر ۱۰ پرسش پاسخ دهید." }, { status: 400 });
    }

    const wrong = correctAnswers
      .map((correct, index) => answers[index] === correct ? null : index + 1)
      .filter((value): value is number => value !== null);

    if (wrong.length) {
      return Response.json(
        { error: `پاسخ پرسش‌های ${wrong.join("، ")} نادرست است. سرنخ هر پرسش را بخوانید و در پرونده‌های تاریخی تحقیق کنید.` },
        { status: 400 },
      );
    }

    const token = await createDownloadPermit(id);
    return Response.json({ token, expiresInSeconds: 600 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "مجوز دانلود صادر نشد." },
      { status: 500 },
    );
  }
}
