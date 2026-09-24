import { changeCurrentUserPassword, getAdminUser } from "../../../admin-auth";
import { consumeRateLimit, isSameOriginMutation } from "../../../security";

function redirect(request: Request, params: Record<string, string>) {
  const url = new URL("/account", request.url);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return new Response(null, {
    status: 303,
    headers: {
      Location: url.toString(),
      "Cache-Control": "no-store, private",
    },
  });
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  }
  const user = await getAdminUser();
  if (!user) return redirect(request, { error: "session" });

  const limit = await consumeRateLimit(
    request,
    "account-password-change",
    6,
    30 * 60,
    user.email,
  );
  if (!limit.allowed) return redirect(request, { error: "rate" });

  const form = await request.formData();
  const currentPassword = String(form.get("currentPassword") ?? "").slice(0, 512);
  const newPassword = String(form.get("newPassword") ?? "").slice(0, 512);
  const confirmPassword = String(form.get("confirmPassword") ?? "").slice(0, 512);

  if (newPassword !== confirmPassword) {
    return redirect(request, { error: "mismatch" });
  }

  try {
    await changeCurrentUserPassword(currentPassword, newPassword);
    return redirect(request, { status: "changed" });
  } catch {
    return redirect(request, { error: "password" });
  }
}
