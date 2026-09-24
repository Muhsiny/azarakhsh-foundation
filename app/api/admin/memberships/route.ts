import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { ensurePlatformSchema } from "../../../../db/platform";
import { membershipRequests } from "../../../../db/schema";
import {
  canManageSiteRequest,
  createOrReactivateMember,
  findAccountByEmail,
  setMemberAccountStatus,
} from "../../../admin-auth";
import { isSameOriginMutation } from "../../../security";

function temporaryPassword() {
  return `Az-${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}!`;
}

export async function GET() {
  if (!(await canManageSiteRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }
  await ensurePlatformSchema();
  const db = await getDb();
  return Response.json({
    requests: await db.select().from(membershipRequests).orderBy(desc(membershipRequests.id)),
  });
}

export async function PATCH(request: Request) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  }
  if (!(await canManageSiteRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  const payload = (await request.json()) as {
    id?: number;
    decision?: "approved" | "rejected";
  };
  if (!payload.id || !payload.decision) {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  await ensurePlatformSchema();
  const db = await getDb();
  const [item] = await db
    .select()
    .from(membershipRequests)
    .where(eq(membershipRequests.id, payload.id))
    .limit(1);
  if (!item) {
    return Response.json({ error: "درخواست یافت نشد." }, { status: 404 });
  }

  let password: string | undefined;
  if (payload.decision === "approved") {
    const existing = await findAccountByEmail(item.email);
    if (existing && existing.role !== "member") {
      return Response.json(
        { error: "این ایمیل قبلاً برای یک حساب مدیریتی استفاده شده است." },
        { status: 409 },
      );
    }

    if (!existing || existing.status !== "active") {
      password = temporaryPassword();
      await createOrReactivateMember({
        email: item.email,
        displayName: item.fullName,
        password,
      });
    }
  } else {
    await setMemberAccountStatus(item.email, "disabled");
  }

  await db
    .update(membershipRequests)
    .set({
      status: payload.decision,
      reviewedAt: new Date().toISOString(),
    })
    .where(eq(membershipRequests.id, payload.id));

  return Response.json({
    ok: true,
    temporaryPassword: password,
    alreadyActive: payload.decision === "approved" && !password,
  });
}
