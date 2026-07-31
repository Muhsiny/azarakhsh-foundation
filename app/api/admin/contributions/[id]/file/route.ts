import { isOwnerRequest } from "../../../../../admin-auth";
import { getContribution, readContributionFile } from "../../../../../contribution-store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isOwnerRequest())) return new Response("Forbidden", { status: 403 });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) return new Response("Not found", { status: 404 });
  const contribution = await getContribution(id);
  if (!contribution?.attachment_key) return new Response("Not found", { status: 404 });
  const stored = await readContributionFile(contribution.attachment_key);
  if (!stored?.value) return new Response("Not found", { status: 404 });
  const metadata = stored.metadata || {};
  const fileName = metadata.fileName || contribution.attachment_name || "attachment";
  const headers = new Headers({
    "Content-Type": metadata.contentType || contribution.attachment_type || "application/octet-stream",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    "Cache-Control": "private, no-store",
  });
  return new Response(stored.value, { headers });
}
