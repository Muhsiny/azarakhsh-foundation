import { getDb } from "../../../db";
import { ensurePlatformSchema } from "../../../db/platform";
import { membershipRequests } from "../../../db/schema";

export async function POST(request: Request) {
  await ensurePlatformSchema();
  const payload = (await request.json()) as {
    fullName?: string;
    email?: string;
    organization?: string;
    reason?: string;
  };
  const fullName = payload.fullName?.trim() ?? "";
  const email = payload.email?.trim().toLowerCase() ?? "";
  if (fullName.length < 3 || !email.includes("@")) {
    return Response.json({ error: "نام و ایمیل معتبر الزامی است." }, { status: 400 });
  }
  const db = await getDb();
  await db.insert(membershipRequests).values({
    fullName,
    email,
    organization: payload.organization?.trim() ?? "",
    reason: payload.reason?.trim() ?? "",
  });
  return Response.json({ ok: true }, { status: 201 });
}
