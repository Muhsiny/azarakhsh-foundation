import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "English Overview",
  description: "An English institutional overview of the Azarakhsh Foundation, its archive, research standards and areas of work.",
  alternates: { canonical: "/en", languages: { "fa-AF": "/", en: "/en" } },
  openGraph: {
    url: "/en",
    title: "Azarakhsh Foundation — English Overview",
    description: "Independent historical research, archives and public memory focused on Afghanistan.",
  },
};

const areas = [
  {
    title: "Historical Archive",
    text: "Collection and description of documents, photographs, audio, video and oral-history materials with provenance and access information.",
  },
  {
    title: "Research Publications",
    text: "Articles, dossiers and research outputs that distinguish primary evidence, witness accounts, secondary literature and interpretation.",
  },
  {
    title: "Council of Etefaq Dossier",
    text: "A research dossier on the historical context, institutions, local administration and surviving sources related to the Council of Etefaq.",
  },
  {
    title: "Sayyid Ali Beheshti Dossier",
    text: "A documented research profile covering life, scholarship, leadership, writings, speeches, archival material and public memory.",
  },
];

export default function EnglishOverviewPage() {
  return (
    <main className="az-info-page az-en" dir="ltr" lang="en">
      <div className="az-container">
        <section className="az-info-hero">
          <span className="az-overline">Institutional overview</span>
          <h1>Azarakhsh Foundation</h1>
          <p>
            Azarakhsh is an independent historical research foundation focused on collecting, preserving,
            evaluating and responsibly publishing sources on the history of Afghanistan.
          </p>
          <div className="az-actions">
            <a className="az-action" href="/publications">Browse publications</a>
            <a className="az-text-link" href="/contact">Contact the foundation</a>
          </div>
        </section>

        <section className="az-info-grid" aria-label="Research areas">
          {areas.map((area) => (
            <article key={area.title}>
              <h2>{area.title}</h2>
              <p>{area.text}</p>
            </article>
          ))}
        </section>

        <section className="az-en-standards">
          <span className="az-overline">Research standards</span>
          <h2>Source transparency, context and correction</h2>
          <p>
            Each published claim should be traceable to a source where possible. Primary documents, witness testimony,
            secondary scholarship and later interpretation are not treated as equivalent forms of evidence.
            Substantive corrections are recorded rather than silently replaced.
          </p>
          <div className="az-actions">
            <a className="az-action" href="/standards">Research and publication standards</a>
            <a className="az-text-link" href="/governance">Governance and accountability</a>
          </div>
        </section>
      </div>
    </main>
  );
}