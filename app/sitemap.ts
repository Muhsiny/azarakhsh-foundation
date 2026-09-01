import type { MetadataRoute } from "next";
import { SITE_URL } from "./site-url";

export default function sitemap(): MetadataRoute.Sitemap {
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
      url: `${SITE_URL}${path}`,
      lastModified: new Date("2026-09-01T00:00:00Z"),
      changeFrequency: path === "" || path === "/publications" ? "weekly" : "monthly",
      priority,
    }));
}
