export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="admin-shell">
      <section className="admin-access-card">
        <span className="admin-seal">آ</span>
        <p className="section-kicker">ورود محفوظ</p>
        <h1>مرکز مدیریت بنیاد آذرخش</h1>
        <p>با ایمیل و رمز مدیریتی وارد شوید.</p>
        <form action="/api/auth/login" method="post">
          <label>
            ایمیل
            <input name="email" required type="email" autoComplete="username" />
          </label>
          <label>
            رمز عبور
            <input
              name="password"
              required
              type="password"
              autoComplete="current-password"
            />
          </label>
          <button className="button button-dark" type="submit">
            ورود به پنل
          </button>
        </form>
        {error && <p className="admin-message">ایمیل یا رمز عبور درست نیست.</p>}
        <a href="/">بازگشت به سایت</a>
      </section>
    </main>
  );
}
