import { changeCurrentUserPassword, getAdminUser } from "../../../admin-auth";
import { consumeRateLimit, isSameOriginMutation } from "../../../security";

function redirect(request: Request, path: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(path, request.url).toString(),
      "Cache-Control": "no-store, private",
    },
  });
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  }

  const user = await getAdminUser();
  if (!user || user.role === "owner") {
    return redirect(request, "/login");
  }

  const limit = await consumeRateLimit(
    request,
    "password-change",
    5,
    30 * 60,
    user.email,
  );
  if (!limit.allowed) {
    return redirect(request, "/account?error=rate");
  }

  const form = await request.formData();
  const currentPassword = String(form.get("currentPassword") ?? "").slice(0, 512);
  const nextPassword = String(form.get("nextPassword") ?? "").slice(0, 512);
  const confirmPassword = String(form.get("confirmPassword") ?? "").slice(0, 512);
  const returnToValue = String(form.get("returnTo") ?? "/publications");
  const returnTo =
    returnToValue.startsWith("/") && !returnToValue.startsWith("//")
      ? returnToValue
      : "/publications";

  if (nextPassword !== confirmPassword) {
    return redirect(
      request,
      `/account?error=confirm&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  try {
    await changeCurrentUserPassword(currentPassword, nextPassword);
    return redirect(
      request,
      `/account?changed=1&returnTo=${encodeURIComponent(returnTo)}`,
    );
  } catch (error) {
    const code =
      error instanceof Error && error.message.includes("فعلی")
        ? "current"
        : "password";
    return redirect(
      request,
      `/account?error=${code}&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }
}
