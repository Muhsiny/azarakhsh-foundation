import { getPlatformDbBinding } from "../../../../../db/platform";
import { writeAuditLog } from "../../../../admin-audit";
import { isOwnerRequest } from "../../../../admin-auth";
import { isSameOriginMutation } from "../../../../security";

export async function POST(
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

  const db = await getPlatformDbBinding();
  const result = await db
    .prepare("DELETE FROM quiz_responses WHERE id = ?")
    .bind(id)
    .run();

  if ((result.meta.changes ?? 0) !== 1) {
    return Response.json({ error: "پاسخ یافت نشد." }, { status: 404 });
  }

  await writeAuditLog({
    action: "quiz_response.delete",
    entityType: "quiz_response",
    entityId: id,
  });

  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL("/admin/research-responses", request.url).toString(),
      "Cache-Control": "no-store, private",
    },
  });
}
