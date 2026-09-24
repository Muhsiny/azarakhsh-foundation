import { authenticateAdmin, sessionCookie } from "../../../admin-auth";
import { consumeRateLimit, isSameOriginMutation } from "../../../security";

function safePath(value: string, fallback: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function redirectToLogin(
  request: Request,
  loginPath: "/login" | "/admin/login",
  returnTo: string,
  error: string,
  retryAfter = 0,
) {
  const target = new URL(loginPath, request.url);
  target.searchParams.set("error", error);
  target.searchParams.set("returnTo", returnTo);
  const headers = new Headers({
    Location: target.toString(),
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

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > 32 * 1024) {
    return Response.json({ error: "درخواست بیش از حد مجاز است." }, { status: 413 });
  }

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(form.get("password") ?? "").slice(0, 512);
  const requestedLoginPath = String(form.get("loginPath") ?? "");
  const loginPath: "/login" | "/admin/login" =
    requestedLoginPath === "/login" ? "/login" : "/admin/login";
  const fallback = loginPath === "/login" ? "/publications" : "/admin";
  const returnTo = safePath(String(form.get("returnTo") ?? fallback), fallback);

  const [ipLimit, accountLimit] = await Promise.all([
    consumeRateLimit(request, "admin-login-ip", 20, 10 * 60),
    consumeRateLimit(request, "admin-login-account", 6, 10 * 60, email || "blank"),
  ]);
  if (!ipLimit.allowed || !accountLimit.allowed) {
    return redirectToLogin(
      request,
      loginPath,
      returnTo,
      "rate",
      Math.max(ipLimit.retryAfter, accountLimit.retryAfter),
    );
  }

  const result = await authenticateAdmin(email, password);
  if (!result) {
    return redirectToLogin(request, loginPath, returnTo, "credentials");
  }

  if (loginPath === "/admin/login" && result.user.role === "member") {
    return redirectToLogin(request, loginPath, returnTo, "credentials");
  }

  const destination = result.user.mustChangePassword ? "/account?first=1" : returnTo;
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(destination, request.url).toString(),
      "Set-Cookie": sessionCookie(result.token),
      "Cache-Control": "no-store, private",
    },
  });
}
