import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { ensurePlatformSchema } from "../../../../../db/platform";
import { posts } from "../../../../../db/schema";
import { getAdminUser } from "../../../../admin-auth";
import { createDownloadPermit } from "../../../../download-gate";
import {
  getQuizDb,
  isAcceptableExplanatoryAnswer,
  normalizeQuizAnswer,
} from "../../../../quiz-research";
import {
  consumeRateLimit,
  isSameOriginMutation,
} from "../../../../security";

const acceptedAnswers: Record<number, string[]> = {
  0: ["15 سنبله 1358", "۱۵ سنبله ۱۳۵۸", "15سنبله1358", "۱۵سنبله۱۳۵۸"],
  2: ["اتفاق آرا", "اتفاق آراء", "به اتفاق آرا", "به اتفاق آراء"],
  4: ["2", "۲", "دو"],
  5: ["2", "۲", "دو"],
  6: ["5", "۵", "پنج"],
  7: ["نظامی", "قضا", "قضایی", "مالی", "سیاسی", "فرهنگ", "فرهنگی", "روابط", "دارالانشا"],
  8: ["90", "۹۰", "نود"],
  9: ["8", "۸", "هشت"],
  10: ["42", "۴۲", "چهل و دو", "چهل‌ودو"],
  11: ["15", "۱۵", "پانزده"],
  12: ["خط راهداری", "راهداری", "خط راه داری"],
};

const explanatoryRules: Record<number, number> = {
  1: 30,
  3: 30,
  13: 50,
  14: 120,
};

function emailIsValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function boundedText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function downloadablePost(id: number) {
  await ensurePlatformSchema();
  const db = await getDb();
  const [item] = await db
    .select({
      id: posts.id,
      status: posts.status,
      visibility: posts.visibility,
      fileUrl: posts.fileUrl,
    })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!item || item.status !== "published" || !item.fileUrl) return null;
  if (item.visibility === "public") return item;
  if (item.visibility !== "members") return null;
  return (await getAdminUser()) ? item : null;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  }

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "فایل معتبر نیست." }, { status: 400 });
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > 72 * 1024) {
    return Response.json({ error: "حجم پاسخ بیش از حد مجاز است." }, { status: 413 });
  }

  const ipLimit = await consumeRateLimit(request, "download-quiz-ip", 12, 10 * 60, String(id));
  if (!ipLimit.allowed) {
    return Response.json(
      { error: "تعداد تلاش‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } },
    );
  }

  try {
    if (!(await downloadablePost(id))) {
      return Response.json({ error: "این فایل برای دانلود در دسترس نیست." }, { status: 404 });
    }

    const payload = (await request.json()) as {
      answers?: unknown[];
      fullName?: unknown;
      email?: unknown;
      occupation?: unknown;
      consent?: unknown;
    };
    const rawAnswers = Array.isArray(payload.answers) ? payload.answers : [];
    const answers = rawAnswers.map((answer) => boundedText(answer, 5000));
    const fullName = boundedText(payload.fullName, 160);
    const email = boundedText(payload.email, 254).toLowerCase();
    const occupation = boundedText(payload.occupation, 240);
    const consent = payload.consent === true;

    if (fullName.length < 3 || !emailIsValid(email) || occupation.length < 2) {
      return Response.json({ error: "نام کامل، ایمیل معتبر و شغل خود را دقیق وارد کنید." }, { status: 400 });
    }
    if (!consent) {
      return Response.json({ error: "برای ثبت پاسخ پژوهشی، موافقت شما لازم است." }, { status: 400 });
    }
    if (
      answers.length !== 15 ||
      answers.some((answer) => !answer) ||
      answers.some((answer, index) => answer.length > (index === 14 ? 5000 : 2500))
    ) {
      return Response.json({ error: "لطفاً به هر ۱۵ پرسش در اندازهٔ مجاز پاسخ دهید." }, { status: 400 });
    }

    const accountLimit = await consumeRateLimit(
      request,
      "download-quiz-account",
      6,
      10 * 60,
      `${id}|${email}`,
    );
    if (!accountLimit.allowed) {
      return Response.json(
        { error: "تعداد تلاش‌های این حساب بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(accountLimit.retryAfter) } },
      );
    }

    await ensurePlatformSchema();
    const rawDb = await getQuizDb();
    if (!rawDb) {
      return Response.json({ error: "پایگاه دادهٔ پژوهش فعال نیست." }, { status: 503 });
    }

    const lock = await rawDb.prepare(
      "SELECT locked_until FROM quiz_attempt_locks WHERE post_id = ? AND email = ? LIMIT 1",
    ).bind(id, email).first<{ locked_until: string }>();
    if (lock && new Date(lock.locked_until).getTime() > Date.now()) {
      const remaining = Math.max(
        1,
        Math.ceil((new Date(lock.locked_until).getTime() - Date.now()) / 60000),
      );
      return Response.json({ error: `تلاش بعدی پس از ${remaining} دقیقه ممکن است.` }, { status: 429 });
    }

    const wrongHistorical = Object.entries(acceptedAnswers)
      .map(([indexValue, accepted]) => {
        const index = Number(indexValue);
        const candidate = normalizeQuizAnswer(answers[index]);
        return accepted.some((answer) => normalizeQuizAnswer(answer) === candidate)
          ? null
          : index + 1;
      })
      .filter((value): value is number => value !== null);

    if (wrongHistorical.length) {
      const lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await rawDb.prepare(`INSERT INTO quiz_attempt_locks (post_id, email, locked_until, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(post_id, email) DO UPDATE SET locked_until = excluded.locked_until, updated_at = CURRENT_TIMESTAMP`)
        .bind(id, email, lockedUntil).run();
      return Response.json(
        { error: "یک یا چند پاسخ تاریخی درست نیست. ده دقیقه بعد دوباره تلاش کنید." },
        { status: 400 },
      );
    }

    const unacceptable = Object.entries(explanatoryRules)
      .map(([indexValue, minimumLength]) => {
        const index = Number(indexValue);
        return isAcceptableExplanatoryAnswer(answers[index], minimumLength)
          ? null
          : index + 1;
      })
      .filter((value): value is number => value !== null);

    if (unacceptable.length) {
      return Response.json(
        { error: `پاسخ پرسش‌های ${unacceptable.join("، ")} باید مرتبط، توضیحی و بدون توهین یا تحقیر باشد.` },
        { status: 400 },
      );
    }

    await rawDb.prepare(
      "DELETE FROM quiz_attempt_locks WHERE post_id = ? AND email = ?",
    ).bind(id, email).run();

    await rawDb.prepare(`INSERT INTO quiz_responses
      (post_id, full_name, email, occupation, answers_json, analytical_answer, historical_score, consent)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)`)
      .bind(
        id,
        fullName,
        email,
        occupation,
        JSON.stringify(answers),
        answers[14],
        Object.keys(acceptedAnswers).length,
      )
      .run();

    const token = await createDownloadPermit(id, email);
    return Response.json(
      { token, expiresInSeconds: 600 },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "مجوز دانلود صادر نشد. لطفاً دوباره تلاش کنید." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
