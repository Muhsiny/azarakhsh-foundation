import { authenticateAdmin, sessionCookie } from "../../../admin-auth";
import { consumeRateLimit, isSameOriginMutation } from "../../../security";

function redirectToLogin(request: Request, error: string, retryAfter = 0) {
  const headers = new Headers({
    Location: new URL(`/admin/login?error=${encodeURIComponent(error)}`, request.url).toString(),
    "Cache-Control": "no-store, private",
  });
  if (retryAfter > 0) headers.set("Retry-After", String(retryAfter));
  return new Response(null, { status: 303, headers });
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return Response.json(
      { error: "درخواست نامعتبر است." },
      { status: 403, headers: { "Cache-Control": "no-store, private" } },
    );
  }

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const returnToValue = String(form.get("returnTo") ?? "/admin");
  const returnTo =
    returnToValue.startsWith("/") && !returnToValue.startsWith("//")
      ? returnToValue
      : "/admin";

  const [ipLimit, accountLimit] = await Promise.all([
    consumeRateLimit(request, "admin-login-ip", 20, 10 * 60),
    consumeRateLimit(request, "admin-login-account", 6, 10 * 60, email || "blank"),
  ]);
  if (!ipLimit.allowed || !accountLimit.allowed) {
    return redirectToLogin(
      request,
      "rate",
      Math.max(ipLimit.retryAfter, accountLimit.retryAfter),
    );
  }

  const result = await authenticateAdmin(email, password);

  if (!result) {
    return redirectToLogin(request, "credentials");
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(returnTo, request.url).toString(),
      "Set-Cookie": sessionCookie(result.token),
      "Cache-Control": "no-store, private",
    },
  });
}
