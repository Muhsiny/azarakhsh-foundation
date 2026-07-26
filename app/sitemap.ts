import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://azarakhsh-foundation.zulfiqar14.workers.dev";
  const pages = [
    ["", 1],
    ["/publications", 0.9],
    ["/beheshti", 0.95],
    ["/archive", 0.9],
    ["/about", 0.7],
    ["/standards", 0.75],
    ["/contact", 0.6],
    ["/privacy", 0.5],
  ] as const;
  return pages.map(([path, priority]) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date("2026-07-26"),
      changeFrequency: path === "" || path === "/publications" ? "weekly" : "monthly",
      priority,
    }));
}
