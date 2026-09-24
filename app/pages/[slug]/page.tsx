import { cache } from "react";
import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../../db";
import { ensurePlatformSchema } from "../../../db/platform";
import { posts } from "../../../db/schema";
import DownloadQuizGate from "../../components/DownloadQuizGate";

export const dynamic = "force-dynamic";

const loadPage = cache(async (slug: string) => {
  await ensurePlatformSchema();
  const db = await getDb();
  const [page] = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.slug, slug),
        eq(posts.contentType, "page"),
        eq(posts.status, "published"),
        eq(posts.visibility, "public"),
      ),
    )
    .limit(1);
  return page ?? null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) {
    return { title: "صفحه یافت نشد", robots: { index: false, follow: false } };
  }
  const description = (page.excerpt || page.content)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  return {
    title: page.title,
    description,
    alternates: { canonical: `/pages/${page.slug}` },
    openGraph: {
      url: `/pages/${page.slug}`,
      title: page.title,
      description,
      images: page.coverImage ? [{ url: page.coverImage, alt: page.title }] : undefined,
    },
  };
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) notFound();

  return (
    <main className="knowledge-page custom-managed-page">
      <section className="knowledge-hero">
        <p className="section-kicker">صفحهٔ رسمی بنیاد آذرخش</p>
        <h1>{page.title}</h1>
        {page.excerpt && <p>{page.excerpt}</p>}
      </section>

      <div className="knowledge-layout knowledge-layout-single">
        <article className="knowledge-article">
          {page.coverImage && (
            <img className="managed-page-cover" src={page.coverImage} alt={page.title} />
          )}
          <div className="managed-page-content">
            {page.content
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          {page.fileUrl && (
            <DownloadQuizGate
              postId={page.id}
              fileName={page.fileName || "فایل پیوست"}
              downloads={page.downloads}
            />
          )}
        </article>
      </div>
    </main>
  );
}
