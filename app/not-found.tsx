export default function NotFound() {
  return (
    <main className="knowledge-page">
      <section className="knowledge-hero">
        <p className="section-kicker">خطای ۴۰۴</p>
        <h1>این صفحه در آرشیو یافت نشد.</h1>
        <p>ممکن است نشانی تغییر کرده باشد، صفحه حذف شده باشد یا هنوز منتشر نشده باشد.</p>
        <div className="hero-actions">
          <a className="button button-dark" href="/">بازگشت به صفحه نخست</a>
          <a className="button button-ghost" href="/archive">مشاهده آرشیو</a>
        </div>
      </section>
    </main>
  );
}
