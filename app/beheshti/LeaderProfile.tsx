import { getNumberedSeries } from "../../db/article-series";

export default async function LeaderProfile({
  imageUrl,
  imageAlt,
}: {
  imageUrl: string;
  imageAlt: string;
}) {
  const series = await getNumberedSeries(["public"]);
  const articles = series
    .filter((post) => post.tags.split(",").map((tag) => tag.trim()).includes("beheshti"))
    .sort((a, b) => (a.articleNo ?? 0) - (b.articleNo ?? 0));

  return (
    <main className="az-leader-page">
      <section className="az-leader-hero">
        <div className="az-container az-leader-hero-grid">
          <div className="az-leader-copy">
            <span className="az-overline">پروندهٔ شخصیت</span>
            <h1>آیت‌الله سید علی بهشتی</h1>
            <p>این پرونده از این پس فقط با مقاله‌های پژوهشیِ شماره‌دار تکمیل می‌شود.</p>
          </div>

          <figure className="az-leader-portrait">
            <img src={imageUrl} alt={imageAlt} width="1182" height="1200" fetchPriority="high" />
            <figcaption>پروندهٔ آیت‌الله سید علی بهشتی</figcaption>
          </figure>
        </div>
      </section>

      <section className="az-container az-evidence-section" aria-labelledby="beheshti-numbered-title">
        <div className="az-evidence-heading">
          <span className="az-overline">مجموعهٔ شماره‌دار</span>
          <h2 id="beheshti-numbered-title">مقالات پژوهشی پرونده</h2>\n          <p>ترتیب مطالعه از شمارهٔ کمتر به شمارهٔ بیشتر است؛ شمارهٔ مقاله مسیر زمانی و پژوهشی مجموعه را نشان می‌دهد.</p>
        </div>
        <div className="az-evidence-list">
          {articles.length ? articles.map((post) => (
            <article key={post.slug}>
              <span>{(post.articleNo ?? 0).toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</span>
              <div>
                <h3><a href={`/publications/${post.slug}`}>{post.title}</a></h3>
                <p>{post.excerpt}</p>
              </div>
            </article>
          )) : (
            <article>
              <span>—</span>
              <div><h3>هنوز مقالهٔ شماره‌دار مستقلی در این پرونده نشر نشده است.</h3></div>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
