import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DownloadQuizGate from "../../components/DownloadQuizGate";
import { loadPublicManagedPage } from "../../content-access";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPublicManagedPage(slug);
  if (!page) {
    return {
      title: "صفحه یافت نشد",
      robots: { index: false, follow: false },
    };
  }

  const description = (page.excerpt || page.content || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  return {
    title: page.title,
    description,
    alternates: { canonical: `/pages/${page.slug}` },
    openGraph: {
      type: "article",
      url: `/pages/${page.slug}`,
      title: page.title,
      description,
      images: page.coverImage
        ? [{ url: page.coverImage, alt: page.title }]
        : undefined,
    },
  };
}

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await loadPublicManagedPage(slug);
  if (!page) notFound();

  return (
    <main className="knowledge-page custom-managed-page">
      <section className="knowledge-hero">
        <p className="section-kicker">صفحهٔ رسمی بنیاد آذرخش</p>
        <h1>{page.title}</h1>
        {page.excerpt && <p>{page.excerpt}</p>}
      </section>

      <div className="custom-managed-layout">
        <article className="knowledge-article">
          {page.coverImage && (
            <img
              className="managed-page-cover"
              src={page.coverImage}
              alt={page.title}
            />
          )}
          <div className="managed-page-content">
            {page.content
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>

          {page.sourceNote && (
            <section className="source-note">
              <strong>منبع و یادداشت آرشیوی</strong>
              <p>{page.sourceNote}</p>
            </section>
          )}

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
