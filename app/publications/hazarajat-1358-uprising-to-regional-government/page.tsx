import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";
import { canonicalPosts } from "../../../db/canonical-posts";
import ReadingTools from "../../components/ReadingTools";

const slug = "hazarajat-1358-uprising-to-regional-government";
const post = canonicalPosts.find((item) => item.slug === slug)!;

export const metadata: Metadata = {
  title: post.title,
  description: post.excerpt,
  alternates: { canonical: `/publications/${slug}` },
  openGraph: {
    type: "article",
    url: `/publications/${slug}`,
    title: post.title,
    description: post.excerpt,
    images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : undefined,
  },
};

function inlineFormatting(value: string): ReactNode[] {
  return value.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : <Fragment key={index}>{part}</Fragment>,
  );
}

function formattedParagraph(value: string, index: number) {
  return <p key={index} style={{ direction: "rtl", textAlign: "justify" }}>{inlineFormatting(value)}</p>;
}

export default function CanonicalArticle02Page() {
  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);

  return (
    <main className="article-page">
      <div className="az-breadcrumb" data-inline-static>
        <a href="/publications">نشریات</a>
        <span aria-hidden="true"> / </span>
        <a href="/council">حکومت شورای اتفاق</a>
        <span aria-hidden="true"> / </span>
        <span>مقالهٔ ۰۲</span>
      </div>
      <article>
        <ReadingTools />
        <div className="article-meta">
          <span>{post.category}</span>
          <time>{new Date(post.publishedAt).toLocaleDateString("fa-AF")}</time>
        </div>
        <h1>{post.title}</h1>
        <p className="article-deck">{post.excerpt}</p>
        {post.coverImage && (
          <figure>
            <img src={post.coverImage} alt={`تصویر شاخص ${post.title}`} />
            <figcaption>پرچم تاریخی حکومت شورای اتفاق اسلامی افغانستان — پروندهٔ تصویری بنیاد آذرخش.</figcaption>
          </figure>
        )}
        <div className="article-provenance">
          <div><b>پدیدآورنده</b><span>{post.authorName}</span></div>
          <div><b>شناسه</b><span>AZ-R02</span></div>
          <div><b>آخرین ویرایش</b><span>{new Date(post.updatedAt).toLocaleDateString("fa-AF")}</span></div>
        </div>
        <div className="article-body">{paragraphs.map(formattedParagraph)}</div>
        <section className="source-note">
          <strong>منبع و یادداشت آرشیوی</strong>
          <p>{post.sourceNote}</p>
        </section>
        <aside className="citation-box">
          <strong>شیوهٔ پیشنهادی ارجاع</strong>
          <p>بنیاد آذرخش، «{post.title}»، شناسهٔ AZ-R02، تاریخ دسترسی: {new Date().toLocaleDateString("fa-AF")}.</p>
        </aside>
      </article>
    </main>
  );
}
