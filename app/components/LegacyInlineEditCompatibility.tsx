"use client";

import { useEffect } from "react";

type LegacyBlock = {
  html?: string;
  textAlign?: string;
  align?: string;
  direction?: string;
  fontFamily?: string;
  font?: string;
  fontSize?: string;
  size?: string;
};

type SelectControl = HTMLElement & {
  options: ArrayLike<{ value: string }>;
  value: string;
};

const legacySelector = [
  "main h1",
  "main h2",
  "main h3",
  "main p",
  ".hero h1",
  ".hero .hero-lead",
  ".mission-heading h2",
  ".mission-heading p",
  ".council-intro h2",
  ".council-intro > p:not(.section-kicker)",
  ".beheshti-copy h2",
  ".beheshti-copy .beheshti-lead",
  ".archive-header h2",
  ".research-card h3",
  ".research-card > p",
].join(",");

function clean(html: string) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,form,input,button").forEach((node) => node.remove());
  doc.querySelectorAll<HTMLElement>("*").forEach((node) => {
    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || (name === "href" && value.startsWith("javascript:"))) {
        node.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.firstElementChild?.innerHTML || "";
}

function parse(raw: string): LegacyBlock {
  try {
    const parsed = JSON.parse(raw) as LegacyBlock;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    return { html: raw };
  }
  return { html: raw };
}

export default function LegacyInlineEditCompatibility() {
  useEffect(() => {
    let stopped = false;
    let overrides: Record<string, string> = {};

    const restoreLegacyValues = () => {
      if (stopped) return;
      const elements = Array.from(document.querySelectorAll<HTMLElement>(legacySelector))
        .filter((element) => !element.closest("[data-inline-ui]"))
        .filter((element) => element.textContent?.trim());

      elements.forEach((element, index) => {
        if (element.dataset.overrideValue) return;
        const section = element.closest("section")?.id || element.closest("main")?.className || "page";
        const key = `${window.location.pathname}:${section}:${element.tagName.toLowerCase()}:${index}`;
        const raw = overrides[key];
        if (!raw || element.dataset.legacyOverrideValue === raw) return;

        const block = parse(raw);
        if (typeof block.html === "string") element.innerHTML = clean(block.html);
        element.style.textAlign = block.textAlign || block.align || element.style.textAlign;
        element.style.direction = block.direction || element.style.direction;
        element.style.fontFamily = block.fontFamily || block.font || element.style.fontFamily;
        element.style.fontSize = block.fontSize || block.size || element.style.fontSize;
        element.dataset.legacyOverrideValue = raw;
      });
    };

    const ensureJustifyButton = () => {
      const selects = Array.from(
        document.querySelectorAll("[data-inline-ui] select"),
      ) as unknown as SelectControl[];
      selects.forEach((select) => {
        const hasJustify = Array.from(select.options).some((option) => option.value === "justify");
        if (!hasJustify || select.dataset.justifyButtonReady === "true") return;
        select.dataset.justifyButtonReady = "true";

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "تراز دوطرفه";
        button.dataset.inlineUi = "true";
        Object.assign(button.style, {
          padding: "7px 10px",
          border: "1px solid #c7a45b",
          borderRadius: "6px",
          background: "#fff",
          cursor: "pointer",
        });
        button.addEventListener("click", () => {
          select.value = "justify";
          select.dispatchEvent(new Event("change", { bubbles: true }));
        });
        select.insertAdjacentElement("beforebegin", button);
      });
    };

    fetch("/api/inline-edits", { cache: "no-store" })
      .then(async (response) => (await response.json()) as { overrides?: Record<string, string> })
      .then((data) => {
        overrides = data.overrides || {};
        restoreLegacyValues();
      })
      .catch(() => undefined);

    const observer = new MutationObserver(() => {
      window.setTimeout(() => {
        restoreLegacyValues();
        ensureJustifyButton();
      }, 60);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    ensureJustifyButton();

    return () => {
      stopped = true;
      observer.disconnect();
    };
  }, []);

  return null;
}
