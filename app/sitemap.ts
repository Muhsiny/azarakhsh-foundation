import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.azarakhshfoundation.org",
      lastModified: new Date("2026-07-26"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.azarakhshfoundation.org/publications",
      lastModified: new Date("2026-07-26"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
