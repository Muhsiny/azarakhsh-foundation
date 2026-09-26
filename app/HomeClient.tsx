export type LatestItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  contentType: string;
  coverImage: string | null;
  publishedAt: string | null;
  articleNo?: number | null;
};

const typeLabels: Record<string, string> = {
  article: "مقاله",
  book: "کتاب",
  document: "سند",
  "oral-history": "تاریخ شفاهی",
  image: "تصویر",
  audio: "صوت",
  video: "ویدئو",
  page: "پرونده",
};

export type HomeMedia = {
  councilEmblemUrl: string;
  councilEmblemAlt: string;
  leaderImageUrl: string;
  leaderImageAlt: string;
  heroFlagUrl: string;
};

export type HomeCopy = {
  eyebrow: string;
  title: string;
  emphasis: string;
  description: string;
  archiveButton: string;
  standardsButton: string;
  leaderKicker: string;
  leaderTitle: string;
  leaderText: string;
  councilKicker: string;
  councilTitle: string;
  councilText: string;
  oralKicker: string;
  oralTitle: string;
  oralText: string;
  contributeKicker: string;
  contributeTitle: string;
  contributeText: string;
};

const researchPaths = [
  {
    title: "اسناد تاریخی",
    text: "متون و مدارک",
    href: "/publications?type=document",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V20H7z" /><path d="M14 3.5V8h4M9.5 12h6M9.5 15.5h6" /></svg>
    ),
  },
  {
    title: "روایت‌ها",
    text: "گفت‌وگوها و خاطرات",
    href: "/publications?type=oral-history",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5c3.2-.8 5.8-.4 8 1.2v12c-2.2-1.6-4.8-2-8-1.2zM20 5.5c-3.2-.8-5.8-.4-8 1.2v12c2.2-1.6 4.8-2 8-1.2z" /></svg>
    ),
  },
  {
    title: "تاریخ شفاهی",
    text: "شاهدان تاریخ",
    href: "/publications?type=oral-history",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="2.4" /><circle cx="16" cy="8" r="2.4" /><path d="M3.8 18c.3-3.2 1.8-5 4.2-5s3.9 1.8 4.2 5M11.8 18c.3-3.2 1.8-5 4.2-5s3.9 1.8 4.2 5" /></svg>
    ),
  },
  {
    title: "تحلیل و پژوهش",
    text: "مقالات و مطالعات",
    href: "/publications?type=article",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 8-4 8 4-8 4zM6 11l6 3 6-3M6 15l6 3 6-3" /></svg>
    ),
  },
] as const;

export default function HomeClient({ media, home, latest }: { media: HomeMedia; home: HomeCopy; latest: LatestItem[] }) {
  const featured = latest;

  return (
    <main className="az2-home">
      <section className="az2-hero" aria-labelledby="az2-home-title">
        <div className="az-container az2-hero-grid">
          <div className="az2-hero-copy">
            <span className="az2-eyebrow">{home.eyebrow}</span>
            <h1 id="az2-home-title">
              {home.title}
              <em>{home.emphasis}</em>
            </h1>
            <p>{home.description}</p>
            <div className="az2-actions">
              <a className="az2-button az2-button-primary" href="/archive">
                <span>{home.archiveButton}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5h14v11H5zM8 4.5h8l1 3H7zM9 12h6" /></svg>
              </a>
              <a className="az2-button az2-button-ghost" href="/standards">
                <span>{home.standardsButton}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h10l2 2v14H6zM9 9h6M9 13h6M9 17h4" /></svg>
              </a>
            </div>
          </div>

          <figure className="az2-hero-visual">
            <div className="az2-hero-media">
              <img
                src={media.heroFlagUrl}
                alt="پرچم تاریخی حکومت شورای اتفاق اسلامی افغانستان"
                width="1280"
                height="720"
                fetchPriority="high"
              />
            </div>
            <figcaption>
              <span>آرشیف تصویری</span>
              <strong>پرچم حکومت شورای اتفاق اسلامی افغانستان</strong>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="az-container az2-research-dock" aria-label="مسیرهای پژوهش">
        {researchPaths.map((item) => (
          <a href={item.href} key={item.title}>
            <span className="az2-dock-icon">{item.icon}</span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.text}</small>
            </span>
          </a>
        ))}
      </section>

      <section className="az-container az2-feature-stack" aria-label="پرونده‌های برجسته">
        <article className="az2-feature az2-feature-leader">
          <div className="az2-feature-media">
            <img
              src={media.leaderImageUrl}
              alt={media.leaderImageAlt}
              width="1182"
              height="1200"
              loading="lazy"
            />
          </div>
          <div className="az2-feature-copy">
            <span className="az2-feature-kicker">{home.leaderKicker}</span>
            <h2>{home.leaderTitle}</h2>
            <p>{home.leaderText}</p>
            <a className="az2-inline-button" href="/beheshti">مطالعهٔ پرونده <span aria-hidden="true">←</span></a>
          </div>
        </article>

        <article className="az2-feature az2-feature-council">
          <div className="az2-feature-media az2-emblem-media">
            <img
              src={media.councilEmblemUrl}
              alt={media.councilEmblemAlt}
              width="1075"
              height="1100"
              loading="lazy"
            />
          </div>
          <div className="az2-feature-copy">
            <span className="az2-feature-kicker">{home.councilKicker}</span>
            <h2>{home.councilTitle}</h2>
            <p>{home.councilText}</p>
            <a className="az2-inline-button az2-inline-light" href="/council">مطالعهٔ پرونده <span aria-hidden="true">←</span></a>
          </div>
        </article>

        <article className="az2-feature az2-feature-oral">
          <div className="az2-oral-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><rect x="8" y="3" width="8" height="12" rx="4" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" /></svg>
          </div>
          <div className="az2-feature-copy">
            <span className="az2-feature-kicker">{home.oralKicker}</span>
            <h2>{home.oralTitle}</h2>
            <p>{home.oralText}</p>
            <a className="az2-inline-button" href="/publications?type=oral-history">مشاهدهٔ روایت‌ها <span aria-hidden="true">←</span></a>
          </div>
          <div className="az2-oral-wave" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, index) => <i key={index} />)}
          </div>
        </article>
      </section>

      {featured.length > 0 && (
        <section className="az-container az2-latest" aria-labelledby="az2-latest-title">
          <div className="az2-section-head">
            <div>
              <span>تازه‌ترین نشرها</span>
              <h2 id="az2-latest-title">مطالب و منابع تازه</h2>
            </div>
            <a href="/publications">همهٔ نشرها ←</a>
          </div>

          <div className="az2-latest-grid">
            {featured.map((item) => {
              const href = "/publications/" + item.slug;
              const label = typeLabels[item.contentType] || item.category;
              return (
                <article key={item.id}>
                  <a className="az2-latest-media" href={href}>
                    {item.coverImage ? (
                      <img src={item.coverImage} alt="" loading="lazy" decoding="async" width="720" height="480" />
                    ) : (
                      <div className="az2-latest-placeholder" aria-hidden="true">آذرخش</div>
                    )}
                    <span>{item.articleNo ? `مقالهٔ ${item.articleNo.toLocaleString("fa-AF", { minimumIntegerDigits: 2 })} · ${label}` : label}</span>
                  </a>
                  <div className="az2-latest-body">
                    <h3><a href={href}>{item.title}</a></h3>
                    {item.excerpt && <p>{item.excerpt}</p>}
                    <a href={href}>مطالعه و مشخصات منبع ←</a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="az-container az2-contribute">
        <div>
          <span className="az2-feature-kicker">{home.contributeKicker}</span>
          <h2>{home.contributeTitle}</h2>
          <p>{home.contributeText}</p>
        </div>
        <a className="az2-button az2-button-primary" href="/contribute">ارسال سند و خاطره</a>
      </section>
    </main>
  );
}
