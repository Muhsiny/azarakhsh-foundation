import { Fragment, cache, type ReactNode } from "react";
import type { Metadata } from "next";
import { and, eq, inArray, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../../db";
import { posts } from "../../../db/schema";
import { canonicalPosts } from "../../../db/canonical-posts";
import { getAdminUser } from "../../admin-auth";
import ReadingTools from "../../components/ReadingTools";
import DownloadQuizGate from "../../components/DownloadQuizGate";
import ViewTracker from "../../components/ViewTracker";

export const dynamic = "force-dynamic";


const loadArticle = cache(async (slug: string) => {
  const canonical = canonicalPosts.find(
    (post) => post.slug === slug && post.status === "published" && post.visibility === "public",
  );

  if (canonical) {
    return {
      ...canonical,
      id: -canonical.articleNo,
      fileUrl: null,
      fileName: null,
      views: 0,
      downloads: 0,
      createdAt: canonical.publishedAt,
      canonical: true as const,
    };
  }
  const user = await getAdminUser();
  const visibility = user ? ["public", "members"] : ["public"];
  const db = await getDb();
  const [post] = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.slug, slug),
        eq(posts.status, "published"),
        ne(posts.contentType, "page"),
        inArray(posts.visibility, visibility),
      ),
    )
    .limit(1);
  if (!post) return null;
  const legacyTargetCategories = new Set(["حکومت شورای اتفاق", "آیت‌الله بهشتی"]);
  if (post.contentType === "article" && legacyTargetCategories.has(post.category)) return null;
  return { ...post, canonical: false as const };
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
  const match = value.match(/^:::(rtl|center|justify)\n([\s\S]*?)\n:::$/);
  const mode = match?.[1];
  const text = match?.[2] ?? value;
  const style = mode === "center"
    ? { direction: "rtl" as const, textAlign: "center" as const }
    : mode === "justify"
      ? { direction: "rtl" as const, textAlign: "justify" as const }
      : { direction: "rtl" as const, textAlign: "right" as const };

  return <p key={index} style={style}>{formattedLines(text)}</p>;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await loadArticle(slug);

  if (!post) notFound();

  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);
  return (
    <main className="article-page">
      <div className="az-breadcrumb" data-inline-static><a href="/publications">نشریات</a><span aria-hidden="true"> / </span><span>مطالعهٔ مطلب</span></div>
      <article>
        {post.visibility === "public" && !post.canonical && <ViewTracker postId={post.id} />}
        <ReadingTools />
        <div className="article-meta"><span>{post.category}</span><time>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("fa-AF") : ""}</time></div>
        <h1>{post.title}</h1>
        <p className="article-deck">{post.excerpt}</p>
        {post.coverImage && <figure><img src={post.coverImage} alt={`تصویر شاخص ${post.title}`} /><figcaption>تصویر مرتبط با این پرونده — منبع باید در متن پژوهش درج شود.</figcaption></figure>}
        <div className="article-provenance"><div><b>پدیدآورنده</b><span>{post.authorName || "تحریریهٔ بنیاد آذرخش"}</span></div><div><b>شناسه</b><span>{post.canonical ? `AZ-R${String(Math.abs(post.id)).padStart(2, "0")}` : `AZ-${post.id}`}</span></div><div><b>آخرین ویرایش</b><span>{new Date(post.updatedAt).toLocaleDateString("fa-AF")}</span></div></div>
        <div className="article-body">{paragraphs.map(formattedParagraph)}</div>
        {post.sourceNote && <section className="source-note"><strong>منبع و یادداشت آرشیوی</strong><p>{post.sourceNote}</p></section>}
        {post.fileUrl && <DownloadQuizGate postId={post.id} fileName={post.fileName || "فایل آرشیوی"} downloads={post.downloads} />}
        <aside className="citation-box"><strong>شیوهٔ پیشنهادی ارجاع</strong><p>بنیاد آذرخش، «{post.title}»، شناسهٔ {post.canonical ? `AZ-R${String(Math.abs(post.id)).padStart(2, "0")}` : `AZ-${post.id}`}, تاریخ دسترسی: {new Date().toLocaleDateString("fa-AF")}.</p></aside>
      </article>
    </main>
  );
}
