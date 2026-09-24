import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { ensurePlatformSchema } from "../../../../db/platform";
import { membershipRequests } from "../../../../db/schema";
import { writeAuditLog } from "../../../admin-audit";
import {
  canManageSiteRequest,
  createOrResetMemberUser,
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
    requests: await db
      .select()
      .from(membershipRequests)
      .orderBy(desc(membershipRequests.id)),
  });
}

export async function PATCH(request: Request) {
  if (!(await canManageSiteRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }
  if (!isSameOriginMutation(request)) {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  }

  const payload = (await request.json()) as {
    id?: number;
    decision?: "approved" | "rejected";
  };
  const id = Number(payload.id);
  if (!Number.isInteger(id) || id <= 0 || !payload.decision) {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  await ensurePlatformSchema();
  const db = await getDb();
  const [item] = await db
    .select()
    .from(membershipRequests)
    .where(eq(membershipRequests.id, id))
    .limit(1);

  if (!item) {
    return Response.json({ error: "درخواست یافت نشد." }, { status: 404 });
  }

  try {
    let password: string | undefined;
    if (payload.decision === "approved") {
      password = temporaryPassword();
      await createOrResetMemberUser({
        email: item.email,
        displayName: item.fullName,
        password,
      });
    } else {
      await setMemberAccountStatus(item.email, "disabled");
    }

    await db
      .update(membershipRequests)
      .set({
        status: payload.decision,
        reviewedAt: new Date().toISOString(),
      })
      .where(eq(membershipRequests.id, id));

    await writeAuditLog({
      action:
        payload.decision === "approved"
          ? "membership.approve"
          : "membership.reject",
      entityType: "membership_request",
      entityId: id,
      details: { email: item.email, previousStatus: item.status },
    });

    return Response.json({
      ok: true,
      temporaryPassword: password,
      passwordMustChange: payload.decision === "approved",
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "به‌روزرسانی عضویت انجام نشد.",
      },
      { status: 400 },
    );
  }
}
