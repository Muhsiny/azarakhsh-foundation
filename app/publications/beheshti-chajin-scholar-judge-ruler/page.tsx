import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";
import { canonicalPosts } from "../../../db/canonical-posts";
import ReadingTools from "../../components/ReadingTools";

const slug = "beheshti-chajin-scholar-judge-ruler";
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
  return value
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[۰-۹0-9،,\s]+\])/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (/^\[[۰-۹0-9،,\s]+\]$/.test(part)) {
        return <sup className="article-citation" key={index}>{part}</sup>;
      }
      return <Fragment key={index}>{part}</Fragment>;
    });
}

function renderBlock(value: string, index: number) {
  if (value.startsWith("## ")) {
    return <h2 key={index}>{value.slice(3)}</h2>;
  }
  if (value.startsWith("### ")) {
    return <h3 key={index}>{value.slice(4)}</h3>;
  }
  return <p key={index} style={{ direction: "rtl", textAlign: "justify" }}>{inlineFormatting(value)}</p>;
}

export default function CanonicalArticle03Page() {
  const blocks = post.content.split(/\n{2,}/).filter(Boolean);

  return (
    <main className="article-page">
      <div className="az-breadcrumb" data-inline-static>
        <a href="/publications">نشریات</a>
        <span aria-hidden="true"> / </span>
        <a href="/beheshti">آیت‌الله بهشتی</a>
        <span aria-hidden="true"> / </span>
        <span>مقالهٔ ۰۳</span>
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
            <img src={post.coverImage} alt={`تصویر آرشیوی ${post.title}`} />
            <figcaption>تصویر آرشیوی آیت‌الله سید علی بهشتی — بنیاد آذرخش.</figcaption>
          </figure>
        )}
        <div className="article-provenance">
          <div><b>پدیدآورنده</b><span>{post.authorName}</span></div>
          <div><b>شناسه</b><span>AZ-R03</span></div>
          <div><b>آخرین ویرایش</b><span>{new Date(post.updatedAt).toLocaleDateString("fa-AF")}</span></div>
        </div>
        <div className="article-body">{blocks.map(renderBlock)}</div>
        {post.sourceNote && (
          <section className="source-note">
            <strong>منبع و یادداشت پژوهشی</strong>
            <p>{post.sourceNote}</p>
          </section>
        )}
        <aside className="citation-box">
          <strong>شیوهٔ پیشنهادی ارجاع</strong>
          <p>بنیاد آذرخش، «{post.title}»، شناسهٔ AZ-R03، تاریخ دسترسی: {new Date().toLocaleDateString("fa-AF")}.</p>
        </aside>
      </article>
    </main>
  );
}
