"use client";

import { useEffect } from "react";

type PagePost = { slug: string; title: string; contentType: string; featured: number; status: string };

export default function SiteEnhancer() {
  useEffect(() => {
    let cancelled = false;
    fetch("/api/posts")
      .then(async (response) => (await response.json()) as { posts?: PagePost[] })
      .then((data) => {
        if (cancelled) return;
        const pages = (data.posts || []).filter((post) => post.contentType === "page" && post.status === "published" && post.featured);
        const targets = [
          document.querySelector(".site-header nav"),
          document.querySelector(".mobile-menu > div"),
          document.querySelector("footer .footer-links"),
        ].filter(Boolean) as HTMLElement[];
        for (const target of targets) {
          target.querySelectorAll("[data-managed-page-link]").forEach((node) => node.remove());
          for (const page of pages) {
            const link = document.createElement("a");
            link.href = `/pages/${page.slug}`;
            link.textContent = page.title;
            link.dataset.managedPageLink = "true";
            target.appendChild(link);
          }
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  return null;
}
