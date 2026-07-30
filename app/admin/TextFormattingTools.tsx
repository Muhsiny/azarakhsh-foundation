"use client";

import { useEffect } from "react";

const toolbarStyle = [
  "display:flex",
  "gap:8px",
  "flex-wrap:wrap",
  "padding:10px",
  "margin:0 0 8px",
  "border:1px solid rgba(10,55,43,.18)",
  "background:#f7f3e9",
  "direction:rtl",
].join(";");

const buttonStyle = [
  "border:1px solid rgba(10,55,43,.25)",
  "background:#fff",
  "color:#062d24",
  "padding:7px 12px",
  "cursor:pointer",
  "font:inherit",
].join(";");

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  setter?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function currentParagraph(textarea: HTMLTextAreaElement) {
  const value = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  if (start !== end) return { start, end };

  const before = value.lastIndexOf("\n\n", Math.max(0, start - 1));
  const after = value.indexOf("\n\n", end);
  return {
    start: before === -1 ? 0 : before + 2,
    end: after === -1 ? value.length : after,
  };
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  paragraphMode = false,
) {
  const range = paragraphMode
    ? currentParagraph(textarea)
    : { start: textarea.selectionStart, end: textarea.selectionEnd };
  const selected = textarea.value.slice(range.start, range.end);
  if (!selected && !paragraphMode) return;

  const next =
    textarea.value.slice(0, range.start) +
    before +
    selected +
    after +
    textarea.value.slice(range.end);

  setTextareaValue(textarea, next);
  textarea.focus();
  textarea.setSelectionRange(
    range.start + before.length,
    range.start + before.length + selected.length,
  );
}

export default function TextFormattingTools() {
  useEffect(() => {
    const attach = () => {
      const textarea = document.querySelector<HTMLTextAreaElement>(
        "main.admin-shell section.admin-grid form.editor-card textarea.content-editor",
      );
      if (!textarea || textarea.dataset.formattingReady === "true") return;

      textarea.dataset.formattingReady = "true";
      textarea.dir = "rtl";
      textarea.style.textAlign = "right";

      const toolbar = document.createElement("div");
      toolbar.setAttribute("style", toolbarStyle);
      toolbar.setAttribute("role", "toolbar");
      toolbar.setAttribute("aria-label", "ابزار تنظیم متن");

      const tools = [
        {
          label: "B بولد",
          title: "بولد کردن متن انتخاب‌شده",
          action: () => wrapSelection(textarea, "**", "**"),
        },
        {
          label: "راست‌به‌چپ",
          title: "راست‌چین و راست‌به‌چپ کردن بند",
          action: () => wrapSelection(textarea, ":::rtl\n", "\n:::", true),
        },
        {
          label: "وسط‌چین",
          title: "قرار دادن بند در وسط",
          action: () => wrapSelection(textarea, ":::center\n", "\n:::", true),
        },
        {
          label: "تراز دوطرفه",
          title: "برابر کردن دو طرف بند",
          action: () => wrapSelection(textarea, ":::justify\n", "\n:::", true),
        },
      ];

      for (const tool of tools) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = tool.label;
        button.title = tool.title;
        button.setAttribute("style", buttonStyle);
        button.addEventListener("click", tool.action);
        toolbar.appendChild(button);
      }

      textarea.parentElement?.insertBefore(toolbar, textarea);
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
