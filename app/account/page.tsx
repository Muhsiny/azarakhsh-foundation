import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "../admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "حساب پژوهشی",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    changed?: string;
    change?: string;
    returnTo?: string;
  }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/login?returnTo=/account");

  const params = await searchParams;
  const returnTo =
    params.returnTo?.startsWith("/") && !params.returnTo.startsWith("//")
      ? params.returnTo
      : "/publications";

  const errorMessages: Record<string, string> = {
    current: "رمز فعلی درست نیست.",
    confirm: "تکرار رمز جدید با رمز جدید یکسان نیست.",
    password: "رمز جدید باید دست‌کم ۱۲ نویسه داشته باشد.",
    rate: "تعداد تلاش‌ها زیاد شده است. کمی بعد دوباره تلاش کنید.",
  };

  return (
    <main className="admin-shell account-shell">
      <section className="admin-access-card account-card">
        <span className="admin-seal">آ</span>
        <p className="section-kicker">حساب پژوهشی</p>
        <h1>{user.displayName}</h1>
        <p dir="ltr">{user.email}</p>

        {params.change === "required" || user.mustChangePassword ? (
          <p className="admin-message">
            برای امنیت حساب، پیش از ادامه رمز موقت خود را تغییر دهید.
          </p>
        ) : null}
        {params.changed === "1" ? (
          <p className="admin-message account-success">
            رمز حساب با موفقیت تغییر کرد.
          </p>
        ) : null}
        {params.error && errorMessages[params.error] ? (
          <p className="admin-message">{errorMessages[params.error]}</p>
        ) : null}

        {user.role !== "owner" ? (
          <form action="/api/auth/change-password" method="post">
            <input type="hidden" name="returnTo" value={returnTo} />
            <label>
              رمز فعلی
              <input
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            <label>
              رمز جدید
              <input
                name="nextPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </label>
            <label>
              تکرار رمز جدید
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </label>
            <button className="button button-dark" type="submit">
              تغییر رمز
            </button>
          </form>
        ) : null}

        <div className="az-actions account-actions">
          <a className="az-action" href={returnTo}>ادامه به گنجینه</a>
          <form action="/api/auth/logout" method="post">
            <button className="az-text-link" type="submit">خروج از حساب</button>
          </form>
        </div>
      </section>
    </main>
  );
}
