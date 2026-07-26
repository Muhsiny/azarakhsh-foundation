import { chatGPTSignOutPath } from "../chatgpt-auth";
import { requireAdminPage } from "../admin-auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { user, authorized } = await requireAdminPage();

  if (!authorized) {
    return (
      <main className="admin-shell">
        <section className="admin-access-card">
          <span className="admin-seal">آ</span>
          <p className="section-kicker">دسترسی محفوظ</p>
          <h1>این حساب اجازهٔ مدیریت بنیاد را ندارد.</h1>
          <p>
            پنل مدیریت فقط برای مالک تعیین‌شده فعال است. با حساب مالک وارد
            شوید.
          </p>
          <a className="button button-dark" href={chatGPTSignOutPath("/admin")}>
            خروج و ورود با حساب دیگر
          </a>
        </section>
      </main>
    );
  }

  return (
    <AdminDashboard
      displayName={user.displayName}
      signOutHref={chatGPTSignOutPath("/")}
    />
  );
}
