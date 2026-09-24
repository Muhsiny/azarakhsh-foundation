import { writeAuditLog } from "../../../../admin-audit";
import { isOwnerRequest } from "../../../../admin-auth";
import { deleteContributionRecord } from "../../../../contribution-store";
import { isSameOriginMutation } from "../../../../security";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isOwnerRequest())) {
    return Response.json({ error: "اجازه ندارید." }, { status: 403 });
  }
  if (!isSameOriginMutation(request)) {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  }

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "شناسه نامعتبر است." }, { status: 400 });
  }

  const deleted = await deleteContributionRecord(id);
  if (!deleted) {
    return Response.json({ error: "منبع یافت نشد." }, { status: 404 });
  }

  await writeAuditLog({
    action: "contribution.delete",
    entityType: "public_contribution",
    entityId: id,
  });

  return Response.json({ ok: true });
}
