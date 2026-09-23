import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../../db";
import { ensurePlatformSchema } from "../../../db/platform";
import { posts } from "../../../db/schema";

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

  return (
    <main className="knowledge-page custom-managed-page">
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

    </main>
  );
}
