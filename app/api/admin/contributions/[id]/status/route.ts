import { isOwnerRequest } from "../../../../../admin-auth";
import { updateContributionStatus } from "../../../../../contribution-store";

const statuses = new Set(["pending", "reviewed", "accepted", "rejected"]);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isOwnerRequest())) return Response.json({ error: "اجازه ندارید." }, { status: 403 });
  const id = Number((await context.params).id);
  const body = await request.json().catch(() => ({})) as { status?: string };
  if (!Number.isInteger(id) || id <= 0 || !body.status || !statuses.has(body.status)) {
    return Response.json({ error: "درخواست معتبر نیست." }, { status: 400 });
  }
  await updateContributionStatus(id, body.status as "pending" | "reviewed" | "accepted" | "rejected");
  return Response.json({ ok: true });
}
