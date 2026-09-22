"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Asset = {
  url: string;
  name: string;
  type: "image" | "pdf" | "link";
  title?: string;
  status?: string;
  visibility?: string;
  publicSlug?: string;
};
type Block = { html: string; align?: string; direction?: string; font?: string; size?: string; fontFamily?: string; fontSize?: string; textAlign?: string; assets?: Asset[] };
type Subsection = { id: string; title: string; body: Block };

const universalSelector = "main h1,main h2,main h3,main h4,main p,main li,main blockquote,main figcaption";
const legacySelector = [
  "main h1","main h2","main h3","main p",".hero h1",".hero .hero-lead",
  ".mission-heading h2",".mission-heading p",".council-intro h2",
  ".council-intro > p:not(.section-kicker)",".beheshti-copy h2",
  ".beheshti-copy .beheshti-lead",".archive-header h2",".research-card h3",".research-card > p",
].join(",");

function clean(html: string) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,form,input,button").forEach((node) => node.remove());
  doc.querySelectorAll<HTMLElement>("*").forEach((node) => {
    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || (name === "href" && value.startsWith("javascript:"))) node.removeAttribute(attr.name);
    }
  });
  return doc.body.firstElementChild?.innerHTML || "";
}

function parseBlock(raw: string | undefined, fallback = ""): Block {
  if (!raw) return { html: fallback, assets: [] };
  try {
    const parsed = JSON.parse(raw) as Block;
    if (parsed && typeof parsed.html === "string") return { ...parsed, html: clean(parsed.html), assets: parsed.assets || [] };
  } catch {}
  return { html: clean(raw), assets: [] };
}

function areaOf(element: HTMLElement) {
  return element.closest("section")?.id || element.closest("article")?.className || element.closest("main")?.className || "page";
}

function stableKey(element: HTMLElement, all: HTMLElement[]) {
  const area = areaOf(element);
  const peers = all.filter((item) => item.tagName === element.tagName && areaOf(item) === area);
  return `${location.pathname}:${area}:${element.tagName.toLowerCase()}:${Math.max(0, peers.indexOf(element))}`;
}

function showAsset(asset: Asset) {
  if (asset.visibility && asset.visibility !== "public") return false;
  if (asset.status && asset.status !== "published") return false;
  if (asset.type === "image") return true;
  return asset.status === "published" && asset.visibility === "public" && Boolean(asset.publicSlug);
}

function applyBlock(element: HTMLElement, key: string, block: Block) {
  element.innerHTML = clean(block.html);
  element.style.textAlign = block.textAlign || block.align || "";
  element.style.direction = block.direction || "";
  element.style.fontFamily = block.fontFamily || block.font || "";
  element.style.fontSize = block.fontSize || block.size || "";
  document.querySelector(`[data-public-attachments-for="${CSS.escape(key)}"]`)?.remove();

  const assets = (block.assets || []).filter(showAsset);
  if (!assets.length) return;
  const wrap = document.createElement("div");
  wrap.dataset.publicAttachmentsFor = key;
  wrap.className = "az-inline-assets";
  for (const asset of assets) {
    if (asset.type === "image") {
      const image = document.createElement("img");
      image.src = asset.url;
      image.alt = asset.name || "";
      image.loading = "lazy";
      wrap.appendChild(image);
    } else {
      const link = document.createElement("a");
      link.href = asset.publicSlug ? `/publications/${asset.publicSlug}` : asset.url;
      link.textContent = asset.title || asset.name;
      wrap.appendChild(link);
    }
  }
  element.insertAdjacentElement("afterend", wrap);
}

export default function PublicInlineOverrides() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [articleRoot, setArticleRoot] = useState<HTMLElement | null>(null);
  const [adminEditor, setAdminEditor] = useState(false);

  useEffect(() => {
    const onAdminEditor = () => setAdminEditor(true);
    document.addEventListener("azarakhsh-admin-editor", onAdminEditor);
    return () => document.removeEventListener("azarakhsh-admin-editor", onAdminEditor);
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    let cancelled = false;
    fetch("/api/inline-edits", { cache: "no-store" })
      .then(async (response) => (await response.json()) as { overrides?: Record<string, string> })
      .then((data) => { if (!cancelled) setOverrides(data.overrides || {}); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!Object.keys(overrides).length) return;

    const all = Array.from(document.querySelectorAll<HTMLElement>(universalSelector))
      .filter((el) => !el.closest("[data-inline-ui]") && !el.closest("[data-inline-static]") && !el.closest("[data-custom-subsection]") && !el.closest(".azarakhsh-approved"));

    for (const element of all) {
      const key = stableKey(element, all);
      const raw = overrides[key];
      if (raw && element.dataset.publicOverrideValue !== raw) {
        applyBlock(element, key, parseBlock(raw, element.innerHTML));
        element.dataset.publicOverrideValue = raw;
      }
    }

    const legacy = Array.from(document.querySelectorAll<HTMLElement>(legacySelector))
      .filter((element) => !element.closest("[data-inline-ui]"))
      .filter((element) => !element.closest("[data-inline-static]"))
      .filter((element) => !element.closest(".azarakhsh-approved"))
      .filter((element) => element.textContent?.trim());

    legacy.forEach((element, index) => {
      if (element.dataset.publicOverrideValue) return;
      const section = element.closest("section")?.id || element.closest("main")?.className || "page";
      const key = `${location.pathname}:${section}:${element.tagName.toLowerCase()}:${index}`;
      const raw = overrides[key];
      if (raw && element.dataset.publicLegacyOverrideValue !== raw) {
        applyBlock(element, key, parseBlock(raw, element.innerHTML));
        element.dataset.publicLegacyOverrideValue = raw;
      }
    });

    setArticleRoot(document.querySelector<HTMLElement>(".knowledge-article"));
  }, [overrides]);

  const subsections = useMemo(() => {
    const raw = typeof window === "undefined" ? undefined : overrides[`${location.pathname}:subsections`];
    if (!raw) return [] as Subsection[];
    try {
      const parsed = JSON.parse(raw) as Subsection[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [overrides]);

  if (adminEditor || !articleRoot || !subsections.length) return null;

  return createPortal(
    <div data-custom-subsection="true" data-public-subsections="true">
      {subsections.map((item, index) => (
        <section key={item.id} id={`custom-section-${index + 1}`} className="az-public-subsection">
          <span className="knowledge-index">{String(index + 1).padStart(2, "0")}</span>
          <h2>{item.title}</h2>
          <div
            className="az-public-subsection-body"
            dangerouslySetInnerHTML={{ __html: clean(item.body.html || "") }}
            style={{
              textAlign: (item.body.align || "right") as "right",
              direction: (item.body.direction || "rtl") as "rtl",
              fontFamily: item.body.font || undefined,
              fontSize: item.body.size || undefined,
            }}
          />
          {(item.body.assets || []).filter(showAsset).map((asset) =>
            asset.type === "image"
              ? <img key={asset.url} src={asset.url} alt={asset.name || ""} loading="lazy" className="az-inline-image" />
              : <a key={asset.url} href={asset.publicSlug ? `/publications/${asset.publicSlug}` : asset.url}>{asset.title || asset.name}</a>,
          )}
        </section>
      ))}
    </div>,
    articleRoot,
  );
}