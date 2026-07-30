import { verifyVisitor, visitorCookie } from "../../../visitor-access";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const token = await verifyVisitor({
      fullName: String(body.fullName || ""),
      email: String(body.email || ""),
      job: String(body.job || ""),
      purpose: String(body.purpose || ""),
      purposeOther: String(body.purposeOther || ""),
      code: String(body.code || ""),
      answers: Array.isArray(body.answers) ? body.answers.map(String) : [],
    });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", "Set-Cookie": visitorCookie(token) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تأیید انجام نشد.";
    return Response.json({ error: message }, { status: 400 });
  }
}
