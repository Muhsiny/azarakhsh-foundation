import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensurePlatformSchema } from "../../../db/platform";
import { membershipRequests } from "../../../db/schema";
import { consumeRateLimit, isSameOriginMutation } from "../../security";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  }

  const limit = await consumeRateLimit(request, "membership-request", 5, 60 * 60);
  if (!limit.allowed) {
    return Response.json(
      { error: "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfter),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > 64 * 1024) {
    return Response.json({ error: "حجم درخواست بیش از حد مجاز است." }, { status: 413 });
  }

  await ensurePlatformSchema();
  const payload = (await request.json()) as {
    fullName?: string;
    email?: string;
    organization?: string;
    reason?: string;
    website?: string;
  };

  // Honeypot field used by the public form.
  if (payload.website?.trim()) {
    return Response.json({ ok: true }, { status: 201 });
  }

  const fullName = payload.fullName?.trim().slice(0, 160) ?? "";
  const email = payload.email?.trim().toLowerCase().slice(0, 254) ?? "";
  const organization = payload.organization?.trim().slice(0, 300) ?? "";
  const reason = payload.reason?.trim().slice(0, 6000) ?? "";

  if (fullName.length < 3 || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: "نام و ایمیل معتبر الزامی است." }, { status: 400 });
  }
  if (reason.length < 20) {
    return Response.json(
      { error: "لطفاً هدف از عضویت را روشن‌تر توضیح دهید." },
      { status: 400 },
    );
  }

  const db = await getDb();
  const [existing] = await db
    .select({ status: membershipRequests.status })
    .from(membershipRequests)
    .where(eq(membershipRequests.email, email))
    .orderBy(desc(membershipRequests.id))
    .limit(1);

  if (existing?.status === "pending") {
    return Response.json(
      { ok: true, alreadyPending: true },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (existing?.status === "approved") {
    return Response.json(
      { error: "برای این ایمیل قبلاً عضویت تأیید شده است." },
      { status: 409, headers: { "Cache-Control": "no-store" } },
    );
  }

  await db.insert(membershipRequests).values({
    fullName,
    email,
    organization,
    reason,
  });
  return Response.json(
    { ok: true },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
