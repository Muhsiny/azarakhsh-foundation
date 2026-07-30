import { createDownloadPermit } from "../../../../download-gate";

const acceptedAnswers: string[][] = [
  ["1308", "۱۳۰۸"],
  ["سنگ تخت", "سنگ‌تخت", "ورس"],
  ["8", "۸", "هشت"],
  ["15 سنبله 1358", "۱۵ سنبله ۱۳۵۸", "15سنبله1358", "۱۵سنبله۱۳۵۸"],
  ["3", "۳", "سه"],
  ["1364", "۱۳۶۴"],
  ["1368", "۱۳۶۸"],
  ["1375", "۱۳۷۵"],
  ["42", "۴۲", "چهل و دو", "چهل‌ودو"],
  ["5", "۵", "پنج"],
];

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[ـ‌]/g, " ")
    .replace(/[،,:؛.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "فایل معتبر نیست." }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as { answers?: unknown[] };
    const answers = Array.isArray(payload.answers) ? payload.answers : [];
    const complete = answers.length === acceptedAnswers.length && answers.every((answer) => typeof answer === "string" && answer.trim().length > 0);
    if (!complete) {
      return Response.json({ error: "برای دانلود، به هر ۱۰ پرسش پاسخ دهید." }, { status: 400 });
    }

    const wrong = acceptedAnswers
      .map((accepted, index) => {
        const candidate = normalize(String(answers[index]));
        return accepted.some((answer) => normalize(answer) === candidate) ? null : index + 1;
      })
      .filter((value): value is number => value !== null);

    if (wrong.length) {
      return Response.json(
        { error: `پاسخ پرسش‌های ${wrong.join("، ")} نادرست است. پاسخ باید کوتاه و دقیق باشد.` },
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
