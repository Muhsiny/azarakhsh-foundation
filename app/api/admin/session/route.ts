import { isAdminRequest } from "../../../admin-auth";

export async function GET() {
  return new Response(null, {
    status: (await isAdminRequest()) ? 204 : 403,
    headers: { "Cache-Control": "no-store, private" },
  });
}