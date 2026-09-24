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
  searchParams: Promise<{ first?: string; status?: string; error?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/login?returnTo=/account");
  const params = await searchParams;

  return (
    <main className="admin-shell">
      <section className="admin-access-card">
        <span className="admin-seal">آ</span>
        <p className="section-kicker">حساب پژوهشی</p>
        <h1>{user.displayName}</h1>
        <p>{user.email} · {user.role === "member" ? "عضو پژوهشی" : "همکار بنیاد"}</p>

        {params.first === "1" || user.mustChangePassword ? (
          <p className="admin-message">برای امنیت حساب، رمز موقت را پیش از ادامه تغییر دهید.</p>
        ) : null}
        {params.status === "changed" ? (
          <p className="admin-message">رمز حساب با موفقیت تغییر کرد.</p>
        ) : null}
        {params.error ? (
          <p className="admin-message">
            {params.error === "mismatch"
              ? "تکرار رمز جدید با رمز جدید یکسان نیست."
              : params.error === "rate"
                ? "تلاش‌های تغییر رمز بیش از حد مجاز شده است. کمی بعد دوباره تلاش کنید."
                : "تغییر رمز انجام نشد. رمز فعلی و رمز جدید را دوباره بررسی کنید."}
          </p>
        ) : null}

        {user.role !== "owner" ? (
          <form action="/api/auth/password" method="post">
            <label>
              رمز فعلی
              <input name="currentPassword" required type="password" autoComplete="current-password" />
            </label>
            <label>
              رمز جدید
              <input name="newPassword" required minLength={12} type="password" autoComplete="new-password" />
            </label>
            <label>
              تکرار رمز جدید
              <input name="confirmPassword" required minLength={12} type="password" autoComplete="new-password" />
            </label>
            <button className="button button-dark" type="submit">تغییر رمز</button>
          </form>
        ) : (
          <p className="admin-message">رمز مالک از تنظیمات امن سرویس مدیریت می‌شود.</p>
        )}

        <div className="az-actions">
          <a className="az-action az-action-secondary" href="/publications">گنجینهٔ پژوهش</a>
          <form action="/api/auth/logout" method="post">
            <button className="az-text-link" type="submit">خروج از حساب</button>
          </form>
        </div>
      </section>
    </main>
  );
}
