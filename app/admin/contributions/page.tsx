import { isOwnerRequest } from "../../admin-auth";
import { listContributions } from "../../contribution-store";
import ContributionReviewList from "./ContributionReviewList";

export const dynamic = "force-dynamic";

export default async function ContributionsAdminPage() {
  if (!(await isOwnerRequest())) {
    return <main className="admin-shell"><section className="admin-access-card"><h1>دسترسی محفوظ</h1><p>این بخش فقط برای مالک بنیاد قابل مشاهده است.</p></section></main>;
  }
  const items = await listContributions();
  return (
    <main className="admin-shell" dir="rtl">
      <section className="admin-access-card" style={{ maxWidth: 1180 }}>
        <p className="section-kicker">صندوق خصوصی مالک</p>
        <h1>خاطرات، روایت‌ها و اسناد ارسالی مردم</h1>
        <p>هیچ موردی به‌صورت خودکار منتشر نمی‌شود. مالک می‌تواند متن، مشخصات، رضایت و ضمیمه را بررسی و وضعیت آن را تعیین کند.</p>
        <p><a href="/admin">بازگشت به پنل مدیریت ←</a></p>
        <ContributionReviewList initialItems={items} />
      </section>
    </main>
  );
}
