import { getVisitorEmail, recordVisitorPath } from "../../../visitor-access";

export async function POST(request: Request) {
  try {
    const email = await getVisitorEmail();
    if (!email) return Response.json({ verified: false });
    const body = await request.json().catch(() => ({})) as { path?: string };
    await recordVisitorPath(email, body.path || "/");
    return Response.json({ verified: true });
  } catch {
    return Response.json({ verified: false });
  }
}
