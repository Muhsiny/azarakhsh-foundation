import { isOwnerRequest } from "../../admin-auth";
import { ensureQuizResearchTables, getQuizDb } from "../../quiz-research";

export const dynamic = "force-dynamic";

type ResponseRow = {
  id: number;
  post_id: number;
  full_name: string;
  email: string;
  occupation: string;
  answers_json: string;
  analytical_answer: string;
  historical_score: number;
  created_at: string;
};

export default async function ResearchResponsesPage() {
  if (!(await isOwnerRequest())) {
    return (
      <main className="admin-shell">
        <section className="admin-access-card">
          <p className="section-kicker">دسترسی مخصوص مالک</p>
          <h1>این بخش فقط برای مالک بنیاد قابل مشاهده است.</h1>
          <a className="button button-dark" href="/admin">بازگشت به مدیریت</a>
        </section>
      </main>
    );
  }

  const db = await getQuizDb();
  let rows: ResponseRow[] = [];
  if (db) {
    await ensureQuizResearchTables(db);
    const result = await db.prepare(`SELECT id, post_id, full_name, email, occupation,
      answers_json, analytical_answer, historical_score, created_at
      FROM quiz_responses ORDER BY id DESC LIMIT 500`).all<ResponseRow>();
    rows = result.results;
  }

  return (
    <main className="admin-shell" dir="rtl">
      <section className="admin-access-card" style={{ maxWidth: 1180, margin: "24px auto" }}>
        <p className="section-kicker">پژوهش محفوظ</p>
        <h1>پاسخ‌های آزمون و دیدگاه‌های مخاطبان</h1>
        <p>این اطلاعات تنها برای حساب مالک نمایش داده می‌شود. تعداد پاسخ‌های ثبت‌شده: {rows.length}</p>
        <a className="button button-dark" href="/admin">بازگشت به پنل مدیریت</a>
      </section>

      <section style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto 40px", display: "grid", gap: 16 }}>
        {rows.length === 0 ? (
          <article style={{ background: "#fffdf8", border: "1px solid #d7c28a", borderRadius: 12, padding: 18 }}>
            هنوز پاسخی ثبت نشده است.
          </article>
        ) : rows.map((row) => {
          let answers: string[] = [];
          try { answers = JSON.parse(row.answers_json) as string[]; } catch {}
          return (
            <article key={row.id} style={{ background: "#fffdf8", color: "#173f33", border: "1px solid #d7c28a", borderRadius: 12, padding: 18 }}>
              <header style={{ display: "flex", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ margin: 0 }}>{row.full_name}</h2>
                  <p style={{ margin: "6px 0" }}>{row.occupation} — {row.email}</p>
                </div>
                <small>فایل #{row.post_id} · {row.created_at}</small>
              </header>
              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>مشاهدهٔ همهٔ پاسخ‌ها</summary>
                <ol style={{ display: "grid", gap: 8, paddingInlineStart: 24 }}>
                  {answers.map((answer, index) => <li key={`${row.id}-${index}`}>{answer}</li>)}
                </ol>
              </details>
              <section style={{ marginTop: 14, padding: 14, background: "#f4efe2", borderRadius: 9 }}>
                <strong>پاسخ تحلیلی پرسش پانزدهم</strong>
                <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{row.analytical_answer}</p>
              </section>
            </article>
          );
        })}
      </section>
    </main>
  );
}
