import type { ReactNode } from "react";

export type InstitutionalSection = {
  title: string;
  text: string;
  points?: string[];
};

export default function InstitutionalPage({
  kicker,
  title,
  lead,
  sections,
  children,
}: {
  kicker: string;
  title: string;
  lead: string;
  sections: InstitutionalSection[];
  children?: ReactNode;
}) {
  return (
    <main className="knowledge-page">
      <header className="knowledge-nav">
        <a className="brand" href="/">
          <span className="brand-mark">
            <img src="/azarakhsh-logo-web.png" alt="نشان بنیاد آذرخش" />
          </span>
          <span><strong>بنیاد آذرخش</strong><small>پژوهش، سند و حافظهٔ تاریخی</small></span>
        </a>
        <nav aria-label="فهرست دانشنامه">
          <a href="/beheshti">آیت‌الله بهشتی</a>
          <a href="/archive">آرشیو</a>
          <a href="/publications">نشرها</a>
          <a href="/about">دربارهٔ بنیاد</a>
        </nav>
      </header>
      <section className="knowledge-hero">
        <p className="section-kicker section-kicker-light">{kicker}</p>
        <h1>{title}</h1>
        <p>{lead}</p>
      </section>
      <div className="knowledge-layout">
        <aside>
          <strong>در این صفحه</strong>
          {sections.map((section, index) => (
            <a href={`#section-${index + 1}`} key={section.title}>{section.title}</a>
          ))}
        </aside>
        <article className="knowledge-article">
          {sections.map((section, index) => (
            <section id={`section-${index + 1}`} key={section.title}>
              <span className="knowledge-index">{String(index + 1).padStart(2, "0")}</span>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
              {section.points && <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}
            </section>
          ))}
          {children}
        </article>
      </div>
      <footer className="knowledge-footer">
        <p>بنیاد آذرخش — آذرخش؛ قاتل تاریکی و سایه‌یی سایه!</p>
        <div><a href="/standards">اصول پژوهش و نشر</a><a href="/contact">تماس و ارسال سند</a><a href="/privacy">حریم خصوصی</a></div>
      </footer>
    </main>
  );
}
