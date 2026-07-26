import type { CSSProperties } from "react";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../../db";
import { ensurePlatformSchema } from "../../../db/platform";
import { posts, siteSettings } from "../../../db/schema";
import { defaultSiteSettings, mergeSiteSettings } from "../../site-settings";

export const dynamic = "force-dynamic";

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  await ensurePlatformSchema();
  const { slug } = await params;
  const db = await getDb();
  const [page] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.contentType, "page"), eq(posts.status, "published")))
    .limit(1);

  if (!page || page.visibility !== "public") notFound();

  const [settingsRow] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  const settings = mergeSiteSettings(settingsRow?.data ? JSON.parse(settingsRow.data) : defaultSiteSettings);

  const style = {
    "--forest-800": settings.colors.primary,
    "--forest-700": settings.colors.primary,
    "--forest-900": settings.colors.dark,
    "--forest-950": settings.colors.dark,
    "--gold-500": settings.colors.gold,
    "--gold-400": settings.colors.gold,
    "--paper": settings.colors.paper,
    "--font-persian": settings.design.fontFamily,
  } as CSSProperties;

  return (
    <main className="knowledge-page custom-managed-page" style={style}>
      {settings.design.customCss && <style>{settings.design.customCss}</style>}
      <header className="knowledge-nav">
        <a className="brand" href="/">
          <span className="brand-mark"><img src={settings.identity.logoUrl} alt={`لوگوی ${settings.identity.siteName}`} /></span>
          <span><strong>{settings.identity.siteName}</strong><small>{settings.identity.tagline}</small></span>
        </a>
        <nav><a href="/">صفحه نخست</a><a href="/publications">نشرها</a><a href="/archive">آرشیو</a><a href="/contact">تماس</a></nav>
      </header>

      <section className="knowledge-hero">
        <p className="section-kicker">صفحهٔ رسمی بنیاد آذرخش</p>
        <h1>{page.title}</h1>
        {page.excerpt && <p>{page.excerpt}</p>}
      </section>

      <div className="knowledge-layout">
        <article className="knowledge-article">
          {page.coverImage && <img className="managed-page-cover" src={page.coverImage} alt={page.title} />}
          <div className="managed-page-content">
            {page.content.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          {page.fileUrl && <p><a className="button button-dark" href={page.fileUrl}>دریافت {page.fileName || "فایل پیوست"}</a></p>}
        </article>
      </div>

      <footer className="knowledge-footer">
        <div className="footer-brand"><img src={settings.identity.logoUrl} alt="" /><div><strong>{settings.identity.siteName}</strong><p>{settings.identity.tagline}</p></div></div>
        <p className="footer-mission">{settings.footer.mission}</p>
        <small>{settings.footer.copyright}</small>
      </footer>
    </main>
  );
}
