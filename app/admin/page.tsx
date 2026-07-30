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
      <AdminArchiveViewer />
      <PublishingHealth />
      <LeaderPageManager />
      <PageManager />
    </>
  );
}
