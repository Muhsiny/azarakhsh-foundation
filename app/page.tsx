import type { Metadata } from "next";
import HomeClient, { type LatestItem } from "./HomeClient";
import { siteSettings as settings } from "./site-settings";
import { getNumberedSeries } from "../db/article-series";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { "fa-AF": "/", en: "/en" } },
  openGraph: { url: "/" },
};

export default async function Home() {
  const series = await getNumberedSeries(["public"]);
  const latest: LatestItem[] = series
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
    .map((post) => ({
      id: -post.articleNo,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      contentType: post.contentType,
      coverImage: post.coverImage,
      publishedAt: post.publishedAt,
      articleNo: post.articleNo,
    }));

  const media = {
    councilEmblemUrl: settings.media.councilEmblemUrl,
    councilEmblemAlt: settings.media.councilEmblemAlt,
  };

  return <HomeClient media={media} latest={latest} />;
}
