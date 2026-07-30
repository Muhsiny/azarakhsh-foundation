import { createDownloadPermit } from "../../../../download-gate";

const correctAnswers = [
  "ورس",
  "ورس",
  "۱۵ سنبلهٔ ۱۳۵۸",
  "سه سال",
  "۴۲ ولسوالی",
  "۸ ولایت",
  "۱۵ حوزه",
  "قضا، مالیه، دارالانشا و فرماندهی جهاد",
  "خط راهداری",
  "۱۷ ماده",
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
        { error: `پاسخ پرسش‌های ${wrong.join("، ")} نادرست است. دوباره تلاش کنید.` },
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
