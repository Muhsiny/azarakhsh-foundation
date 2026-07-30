import { isOwnerRequest } from "../../admin-auth";
import { listVisitors } from "../../visitor-access";

export const dynamic = "force-dynamic";

export default async function VisitorsPage() {
  if (!(await isOwnerRequest())) {
    return <main className="admin-shell"><section className="admin-access-card"><h1>دسترسی محفوظ</h1><p>این بخش فقط برای مالک بنیاد قابل مشاهده است.</p></section></main>;
  }

  const visitors = await listVisitors() as Array<Record<string, unknown>>;
  return (
    <main className="admin-shell" dir="rtl">
      <section className="admin-access-card" style={{ maxWidth: 1180 }}>
        <p className="section-kicker">گزارش خصوصی مالک</p>
        <h1>بازدیدکنندگان تأییدشده</h1>
        <p>نام، ایمیل، شغل، هدف بازدید، آخرین صفحه و پاسخ‌های هشت پرسش فقط در این بخش خصوصی نمایش داده می‌شود.</p>
        <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
          {visitors.length === 0 && <p>هنوز بازدیدکننده‌ای ثبت نشده است.</p>}
          {visitors.map((visitor) => {
            let answers: string[] = [];
            try { answers = JSON.parse(String(visitor.answers_json || "[]")); } catch {}
            return (
              <article key={String(visitor.id)} style={{ border: "1px solid #d7c28a", borderRadius: 12, padding: 16, background: "#fffdf8" }}>
                <h2 style={{ marginTop: 0 }}>{String(visitor.full_name || "")}</h2>
                <p><strong>ایمیل:</strong> {String(visitor.email || "")}</p>
                <p><strong>شغل:</strong> {String(visitor.job || "")}</p>
                <p><strong>هدف بازدید:</strong> {String(visitor.visit_purpose || "")} {visitor.purpose_other ? `— ${String(visitor.purpose_other)}` : ""}</p>
                <p><strong>آخرین صفحه:</strong> {String(visitor.last_path || "/")}</p>
                <p><strong>تعداد ثبت بازدید:</strong> {String(visitor.visit_count || 0)}</p>
                <p><strong>آخرین فعالیت:</strong> {String(visitor.last_seen_at || "")}</p>
                <details>
                  <summary style={{ cursor: "pointer", fontWeight: 700 }}>نمایش پاسخ‌های هشت پرسش</summary>
                  <ol>
                    {answers.map((answer, index) => <li key={index} style={{ margin: "10px 0", whiteSpace: "pre-wrap" }}>{answer}</li>)}
                  </ol>
                </details>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
