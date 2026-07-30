import { requireAdminPage } from "../admin-auth";
import AdminDashboard from "./AdminDashboard";
import AdminArchiveViewer from "./AdminArchiveViewer";
import LeaderPageManager from "./LeaderPageManager";
import PageManager from "./PageManager";
import PublishingHealth from "./PublishingHealth";
import TextFormattingTools from "./TextFormattingTools";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { user, authorized } = await requireAdminPage();

  if (!authorized) {
    return (
      <main className="admin-shell">
        <section className="admin-access-card">
          <span className="admin-seal">آ</span>
          <p className="section-kicker">دسترسی محفوظ</p>
          <h1>برای مدیریت بنیاد وارد شوید.</h1>
          <p>پنل مدیریت تنها برای مالک و همکاران تأییدشده فعال است.</p>
          <a className="button button-dark" href="/admin/login">
            ورود به پنل
          </a>
        </section>
      </main>
    );
  }

  return (
    <>
      <TextFormattingTools />
      <AdminDashboard displayName={user.displayName} signOutHref="/api/auth/logout" />
      {user.role === "owner" && (
        <section className="admin-access-card" style={{ margin: "18px auto", width: "min(1100px, calc(100% - 32px))" }}>
          <p className="section-kicker">پژوهش محفوظ مالک</p>
          <h2>پاسخ‌ها و مخاطبان بنیاد</h2>
          <p>نام، ایمیل، شغل، هدف بازدید و پاسخ‌های پژوهشی فقط در حساب مالک قابل مشاهده است.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="button button-dark" href="/admin/research-responses">پاسخ‌های آزمون دانلود</a>
            <a className="button button-dark" href="/admin/visitors">بازدیدکنندگان تأییدشده</a>
          </div>
        </section>
      )}
      <AdminArchiveViewer />
      <PublishingHealth />
      <LeaderPageManager />
      <PageManager />
    </>
  );
}
