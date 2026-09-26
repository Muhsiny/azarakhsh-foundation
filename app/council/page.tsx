import type { Metadata } from "next";
import { getSiteSettings } from "../site-settings";
import { getNumberedSeries } from "../../db/article-series";

export const metadata: Metadata = {
  title: "حکومت شورای اتفاق اسلامی افغانستان",
  description: "پروندهٔ مقاله‌های شماره‌دار دربارهٔ حکومت شورای اتفاق اسلامی افغانستان.",
  alternates: { canonical: "/council" },
  openGraph: {
    url: "/council",
    title: "پروندهٔ حکومت شورای اتفاق اسلامی افغانستان",
    description: "مجموعهٔ پژوهشی شماره‌دار بنیاد آذرخش.",
  },
};

export default async function CouncilPage() {
  const settings = await getSiteSettings();
  const series = await getNumberedSeries(["public"]);
  const articles = series
    .filter((post) => post.tags.split(",").map((tag) => tag.trim()).includes("council"))
    .sort((a, b) => (a.articleNo ?? 0) - (b.articleNo ?? 0));

  return (
    <main className="az-flagship-page">
      <section className="az-council-cover" aria-label="کاور پروندهٔ حکومت شورای اتفاق اسلامی افغانستان">
        <img src={settings.media.heroFlagUrl} alt="پرچم حکومت شورای اتفاق اسلامی افغانستان" width="1280" height="720" fetchPriority="high" />
        <div className="az-council-cover-caption">
          <span>پروندهٔ پژوهشی</span>
          <strong>حکومت شورای اتفاق اسلامی افغانستان</strong>
        </div>
      </section>

      <section className="az-flagship-hero">
        <div className="az-container az-flagship-hero-grid">
          <div className="az-flagship-copy">
            <span className="az-overline">پروندهٔ محوری</span>
            <h1>حکومت شورای اتفاق اسلامی افغانستان</h1>
            <p>این پرونده از این پس فقط با مقاله‌های پژوهشیِ شماره‌دار تکمیل می‌شود.</p>
          </div>
          <div className="az-flagship-emblem">
            <div className="az-emblem-frame">
              <img src={settings.media.councilEmblemUrl} alt={settings.media.councilEmblemAlt} width="1075" height="1100" />
            </div>
          </div>
        </div>
      </section>

      <section className="az-container az-evidence-section" aria-labelledby="council-articles-title">
        <div className="az-evidence-heading">
          <span className="az-overline">مجموعهٔ شماره‌دار</span>
          <h2 id="council-articles-title">مقالات پژوهشی پرونده</h2>\n          <p>ترتیب مطالعه از شمارهٔ کمتر به شمارهٔ بیشتر است؛ شمارهٔ مقاله مسیر زمانی و پژوهشی مجموعه را نشان می‌دهد.</p>
        </div>
        <div className="az-evidence-list">
          {articles.map((post) => (
            <article key={post.slug}>
              <span>{(post.articleNo ?? 0).toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</span>
              <div>
                <h3><a href={`/publications/${post.slug}`}>{post.title}</a></h3>
                <p>{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="az-container az-flagship-cta">
        <div>
          <span className="az-overline">آرشیف باز</span>
          <h2>سند، تصویر یا روایت مرتبط دارید؟</h2>
        </div>
        <div className="az-actions">
          <a className="az-action az-action-gold" href="/contribute">ارسال منبع ←</a>
          <a className="az-text-link az-text-link-light" href="/archive">مرور آرشیف ↗</a>
        </div>
      </section>
    </main>
  );
}
