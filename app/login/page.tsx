import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ورود اعضا",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: "/login" },
};

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const { error, returnTo } = await searchParams;
  return (
    <main className="admin-shell">
      <section className="admin-access-card">
        <span className="admin-seal">آ</span>
        <p className="section-kicker">دسترسی اعضای تأییدشده</p>
        <h1>ورود به گنجینهٔ پژوهشی آذرخش</h1>
        <p>با ایمیل و رمز حساب تأییدشدهٔ خود وارد شوید.</p>
        <form action="/api/auth/login" method="post">
          <input name="returnTo" type="hidden" value={returnTo || "/publications"} />
          <label>
            ایمیل
            <input name="email" required type="email" autoComplete="username" />
          </label>
          <label>
            رمز عبور
            <input name="password" required type="password" autoComplete="current-password" />
          </label>
          <button className="button button-dark" type="submit">ورود</button>
        </form>
        {error === "rate" ? (
          <p className="admin-message">تلاش‌های ورود بیش از حد مجاز شده است. چند دقیقه بعد دوباره تلاش کنید.</p>
        ) : error ? (
          <p className="admin-message">ایمیل یا رمز عبور درست نیست.</p>
        ) : null}
        <a href="/publications">بازگشت به گنجینه ←</a>
      </section>
    </main>
  );
}
