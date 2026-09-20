import type { ReactNode } from "react";
import ReadingTools from "./ReadingTools";
import ExpandableSectionText from "./ExpandableSectionText";

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
  collapseSectionText = false,
  intro,
}: {
  kicker: string;
  title: string;
  lead: string;
  sections: InstitutionalSection[];
  children?: ReactNode;
  collapseSectionText?: boolean;
  intro?: ReactNode;
}) {
  return (
    <main className="knowledge-page">
      <section className="knowledge-hero">
        <p className="section-kicker section-kicker-light">{kicker}</p>
        <h1>{title}</h1>
        <p>{lead}</p>
      </section>
      {intro && <div className="az-institutional-intro" data-inline-static>{intro}</div>}
      <div className="knowledge-layout">
        <aside>
          <strong>در این صفحه</strong>
          {sections.map((section, index) => (
            <a href={`#section-${index + 1}`} key={section.title}>{section.title}</a>
          ))}
        </aside>
        <article className="knowledge-article">
          <ReadingTools />
          {sections.map((section, index) => (
            <section id={`section-${index + 1}`} key={section.title}>
              <span className="knowledge-index">{(index + 1).toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</span>
              <h2>{section.title}</h2>
              {collapseSectionText ? <ExpandableSectionText text={section.text} /> : <p>{section.text}</p>}
              {section.points && <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}
            </section>
          ))}
          {children}
        </article>
      </div>
    </main>
  );
}
