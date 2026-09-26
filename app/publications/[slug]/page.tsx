import { Fragment, cache, type ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNumberedSeries, getPostBySlug } from "../../../db/article-series";
import { getAdminUser } from "../../admin-auth";
import ReadingTools from "../../components/ReadingTools";
import DownloadQuizGate from "../../components/DownloadQuizGate";
import ViewTracker from "../../components/ViewTracker";
import { parseQuizConfig, toPublicQuizConfig } from "../../quiz-config";

export const dynamic = "force-dynamic";


const loadArticle = cache(async (slug: string) => {
  const user = await getAdminUser();
  const visibility = user ? ["public", "members"] : ["public"];
  const post = await getPostBySlug(slug, visibility);
  if (!post || post.contentType === "page") return null;
  return { ...post, canonical: post.articleNo !== null };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadArticle(slug);
  if (!post) {
    return {
      title: "مطلب یافت نشد",
      robots: { index: false, follow: false },
    };
  }

  const description = (post.excerpt || post.content || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  return {
    title: post.title,
    description,
    alternates: { canonical: `/publications/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/publications/${post.slug}`,
      title: post.title,
      description,
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : undefined,
    },
  };
}

function inlineFormatting(value: string): ReactNode[] {
  return value.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : <Fragment key={index}>{part}</Fragment>,
  );
}

function formattedLines(value: string) {
  return value.split("\n").map((line, index, lines) => (
    <Fragment key={index}>
      {inlineFormatting(line)}
      {index < lines.length - 1 && <br />}
    </Fragment>
  ));
}

function formattedParagraph(value: string, index: number) {
  const raw = value.trim();

  // The page already renders the article title as its H1.
  // Canonical article bodies also begin with "# title"; suppress that duplicate.
  if (raw.startsWith("# ")) return null;

  if (raw.startsWith("### ")) {
    return <h3 key={index}>{inlineFormatting(raw.slice(4))}</h3>;
  }

  if (raw.startsWith("## ")) {
    return <h2 key={index}>{inlineFormatting(raw.slice(3))}</h2>;
  }

  if (raw.startsWith("> ")) {
    return <blockquote key={index}>{formattedLines(raw.replace(/^> ?/gm, ""))}</blockquote>;
  }

  if (/^(?:[-*] .+\n?)+$/.test(raw)) {
    const items = raw.split("\n").map((line) => line.replace(/^[-*] /, "").trim()).filter(Boolean);
    return <ul key={index}>{items.map((item, itemIndex) => <li key={itemIndex}>{inlineFormatting(item)}</li>)}</ul>;
  }

  const match = raw.match(/^:::(rtl|center|justify)\n([\s\S]*?)\n:::$/);
  const mode = match?.[1];
  const text = match?.[2] ?? raw;
  const style = mode === "center"
    ? { direction: "rtl" as const, textAlign: "center" as const }
    : { direction: "rtl" as const, textAlign: "justify" as const };

  return <p key={index} style={style}>{formattedLines(text)}</p>;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await loadArticle(slug);

  if (!post) notFound();

  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);
  const publicQuizConfig = toPublicQuizConfig(parseQuizConfig(post.quizConfig));
  const numberedSeries = post.canonical ? await getNumberedSeries(["public"]) : [];
  const seriesIndex = post.canonical
    ? numberedSeries.findIndex((item) => item.articleNo === post.articleNo)
    : -1;
  const previousArticle = seriesIndex > 0 ? numberedSeries[seriesIndex - 1] : null;
  const nextArticle = seriesIndex >= 0 && seriesIndex < numberedSeries.length - 1 ? numberedSeries[seriesIndex + 1] : null;

  return (
    <main className="article-page">
      <div className="az-breadcrumb" data-inline-static><a href="/publications">نشریات</a><span aria-hidden="true"> / </span><span>مطالعهٔ مطلب</span></div>
      <article>
        {post.visibility === "public" && post.id > 0 && <ViewTracker postId={post.id} />}
        <ReadingTools />
        <div className="article-meta"><span>{post.category}</span>{post.canonical && post.articleNo && <span>مقالهٔ {post.articleNo.toLocaleString("fa-AF", { minimumIntegerDigits: 2 })} از مجموعهٔ شماره‌دار</span>}<time>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("fa-AF") : ""}</time></div>
        <h1>{post.title}</h1>
        <p className="article-deck">{post.excerpt}</p>
        {post.coverImage && <figure><img src={post.coverImage} alt={`تصویر شاخص ${post.title}`} /><figcaption>تصویر مرتبط با این پرونده — منبع باید در متن پژوهش درج شود.</figcaption></figure>}
        <div className="article-provenance"><div><b>پدیدآورنده</b><span>{post.authorName || "تحریریهٔ بنیاد آذرخش"}</span></div><div><b>شناسه</b><span>{post.canonical && post.articleNo ? `AZ-R${String(post.articleNo).padStart(2, "0")}` : `AZ-${post.id}`}</span></div><div><b>آخرین ویرایش</b><span>{new Date(post.updatedAt).toLocaleDateString("fa-AF")}</span></div></div>
        {post.canonical && (
          <nav className="article-series-nav" aria-label="ترتیب مقالات مجموعه">
            <p><strong>ترتیب مطالعه:</strong> شمارهٔ کمتر، زودتر در زنجیرهٔ پژوهش آمده است.</p>
            <div>
              {previousArticle?.articleNo ? <a href={`/publications/${previousArticle.slug}`}>← مقالهٔ {previousArticle.articleNo.toLocaleString("fa-AF", { minimumIntegerDigits: 2 })}</a> : <span>آغاز زنجیرهٔ موجود</span>}
              {nextArticle?.articleNo ? <a href={`/publications/${nextArticle.slug}`}>مقالهٔ {nextArticle.articleNo.toLocaleString("fa-AF", { minimumIntegerDigits: 2 })} →</a> : <span>آخرین مقالهٔ موجود</span>}
            </div>
          </nav>
        )}
        <div className="article-body">{paragraphs.map(formattedParagraph)}</div>
        {post.sourceNote && <section className="source-note"><strong>منبع و یادداشت آرشیوی</strong><p>{post.sourceNote}</p></section>}
        {post.fileUrl && post.id > 0 && (
          <DownloadQuizGate
            postId={post.id}
            fileName={post.fileName || "فایل آرشیوی"}
            downloads={post.downloads}
            enabled={Boolean(post.quizEnabled)}
            config={publicQuizConfig}
          />
        )}
        <aside className="citation-box"><strong>شیوهٔ پیشنهادی ارجاع</strong><p>بنیاد آذرخش، «{post.title}»، شناسهٔ {post.canonical && post.articleNo ? `AZ-R${String(post.articleNo).padStart(2, "0")}` : `AZ-${post.id}`}, تاریخ دسترسی: {new Date().toLocaleDateString("fa-AF")}.</p></aside>
      </article>
    </main>
  );
}
