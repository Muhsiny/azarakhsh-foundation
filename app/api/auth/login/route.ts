import { authenticateAdmin, sessionCookie } from "../../../admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const returnToValue = String(form.get("returnTo") ?? "/admin");
  const returnTo =
    returnToValue.startsWith("/") && !returnToValue.startsWith("//")
      ? returnToValue
      : "/admin";
  const result = await authenticateAdmin(email, password);

  if (!result) {
    return Response.redirect(new URL("/admin/login?error=1", request.url), 303);
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(returnTo, request.url).toString(),
      "Set-Cookie": sessionCookie(result.token),
      "Cache-Control": "no-store",
    },
  });
}
