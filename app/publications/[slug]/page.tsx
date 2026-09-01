import { Fragment, type ReactNode } from "react";
import { and, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../../db";
import { ensurePlatformSchema } from "../../../db/platform";
import { posts } from "../../../db/schema";
import { getAdminUser } from "../../admin-auth";
import DownloadQuizGate from "../../components/DownloadQuizGate";

export const dynamic = "force-dynamic";

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
  await ensurePlatformSchema();
  const { slug } = await params;
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
        inArray(posts.visibility, visibility),
      ),
    )
    .limit(1);

  if (!post) notFound();

  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);
  return (
    <main className="article-page">
      <header className="article-topbar"><a href="/">بنیاد آذرخش</a><a href="/publications">همهٔ نشرها ←</a></header>
      <article>
        <div className="article-meta"><span>{post.category}</span><time>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("fa-AF") : ""}</time></div>
        <h1>{post.title}</h1>
        <p className="article-deck">{post.excerpt}</p>
        {post.coverImage && <figure><img src={post.coverImage} alt={`تصویر شاخص ${post.title}`} /><figcaption>تصویر مرتبط با این پرونده — منبع باید در متن پژوهش درج شود.</figcaption></figure>}
        <div className="article-provenance"><div><b>پدیدآورنده</b><span>{post.authorName || "تحریریهٔ بنیاد آذرخش"}</span></div><div><b>شناسه</b><span>AZ-{post.id}</span></div><div><b>آخرین ویرایش</b><span>{new Date(post.updatedAt).toLocaleDateString("fa-AF")}</span></div></div>
        <div className="article-body">{paragraphs.map(formattedParagraph)}</div>
        {post.sourceNote && <section className="source-note"><strong>منبع و یادداشت آرشیوی</strong><p>{post.sourceNote}</p></section>}
        {post.fileUrl && <DownloadQuizGate postId={post.id} fileName={post.fileName || "فایل آرشیوی"} downloads={post.downloads} />}
        <aside className="citation-box"><strong>شیوهٔ پیشنهادی ارجاع</strong><p>بنیاد آذرخش، «{post.title}»، شناسهٔ AZ-{post.id}، تاریخ دسترسی: {new Date().toLocaleDateString("fa-AF")}.</p></aside>
      </article>
    </main>
  );
}
