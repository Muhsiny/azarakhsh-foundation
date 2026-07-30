import { requestVisitorCode } from "../../../visitor-access";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string };
    await requestVisitorCode(payload.email || "");
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "ارسال کد انجام نشد." }, { status: 400 });
  }
}
