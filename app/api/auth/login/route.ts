import { authenticateAdmin, sessionCookie } from "../../../admin-auth";
import { consumeRateLimit, isSameOriginMutation } from "../../../security";

function safeInternalPath(value: string, fallback: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function loginDestination(value: FormDataEntryValue | null) {
  return value === "/login" ? "/login" : "/admin/login";
}

function redirectToLogin(
  request: Request,
  loginPath: "/login" | "/admin/login",
  error: string,
  returnTo: string,
  retryAfter = 0,
) {
  const url = new URL(loginPath, request.url);
  url.searchParams.set("error", error);
  url.searchParams.set("returnTo", returnTo);
  const headers = new Headers({
    Location: url.toString(),
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
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(form.get("password") ?? "");
  const loginPath = loginDestination(form.get("loginPath"));
  const defaultReturn = loginPath === "/login" ? "/publications" : "/admin";
  const returnTo = safeInternalPath(
    String(form.get("returnTo") ?? defaultReturn),
    defaultReturn,
  );

  const [ipLimit, accountLimit] = await Promise.all([
    consumeRateLimit(request, "admin-login-ip", 20, 10 * 60),
    consumeRateLimit(request, "admin-login-account", 6, 10 * 60, email || "blank"),
  ]);

  if (!ipLimit.allowed || !accountLimit.allowed) {
    return redirectToLogin(
      request,
      loginPath,
      "rate",
      returnTo,
      Math.max(ipLimit.retryAfter, accountLimit.retryAfter),
    );
  }

  const result = await authenticateAdmin(email, password);
  if (!result) {
    return redirectToLogin(request, loginPath, "credentials", returnTo);
  }

  let destination = returnTo;
  if (result.user.role === "member" && destination.startsWith("/admin")) {
    destination = "/publications";
  }
  if (result.user.mustChangePassword && result.user.role === "member") {
    const account = new URL("/account", request.url);
    account.searchParams.set("change", "required");
    account.searchParams.set("returnTo", destination);
    destination = account.pathname + account.search;
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(destination, request.url).toString(),
      "Set-Cookie": sessionCookie(result.token),
      "Cache-Control": "no-store, private",
    },
  });
}
