"use client";

import { useEffect, useState } from "react";

type EditTarget = {
  key: string;
  element: HTMLElement;
  value: string;
};

const editableSelector = [
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

function elementKey(element: HTMLElement, index: number) {
  const section = element.closest("section")?.id || element.closest("main")?.className || "page";
  const tag = element.tagName.toLowerCase();
  return `${window.location.pathname}:${section}:${tag}:${index}`;
}

export default function AdminEditShortcut() {
  const [allowed, setAllowed] = useState(false);
  const [target, setTarget] = useState<EditTarget | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/posts", { cache: "no-store" })
      .then((response) => {
        if (!cancelled) setAllowed(response.ok);
      })
      .catch(() => {
        if (!cancelled) setAllowed(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!allowed) return;

    let disposed = false;
    const buttons: HTMLButtonElement[] = [];

    const install = async () => {
      const response = await fetch("/api/inline-edits", { cache: "no-store" }).catch(() => null);
      const data = response?.ok
        ? ((await response.json()) as { overrides?: Record<string, string> })
        : { overrides: {} };
      if (disposed) return;

      const elements = Array.from(document.querySelectorAll<HTMLElement>(editableSelector))
        .filter((element) => !element.closest("[data-inline-editor-ui]"))
        .filter((element) => element.textContent?.trim());

      elements.forEach((element, index) => {
        if (element.dataset.inlineEditReady === "true") return;
        element.dataset.inlineEditReady = "true";

        const key = elementKey(element, index);
        const override = data.overrides?.[key];
        if (typeof override === "string" && override.trim()) {
          element.textContent = override;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.title = "ویرایش همین بخش";
        button.setAttribute("aria-label", "ویرایش همین بخش");
        button.dataset.inlineEditorUi = "true";
        button.textContent = "✎";
        Object.assign(button.style, {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "28px",
          marginInlineStart: "8px",
          padding: "0",
          border: "1px solid rgba(199,164,91,.75)",
          borderRadius: "50%",
          background: "#fffdf8",
          color: "#173f33",
          fontSize: "16px",
          lineHeight: "1",
          cursor: "pointer",
          verticalAlign: "middle",
          boxShadow: "0 3px 10px rgba(0,0,0,.12)",
        });

        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const value = element.textContent?.trim() || "";
          setTarget({ key, element, value });
          setDraft(value);
          setMessage("");
        });

        element.insertAdjacentElement("afterend", button);
        buttons.push(button);
      });
    };

    const timer = window.setTimeout(() => void install(), 250);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      buttons.forEach((button) => button.remove());
      document.querySelectorAll<HTMLElement>("[data-inline-edit-ready]").forEach((element) => {
        delete element.dataset.inlineEditReady;
      });
    };
  }, [allowed]);

  async function save() {
    if (!target || saving) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/inline-edits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: target.key, value: draft }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "ذخیره انجام نشد.");
      target.element.textContent = draft.trim();
      setMessage("ذخیره شد.");
      window.setTimeout(() => setTarget(null), 450);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  if (!allowed || !target) return null;

  return (
    <div
      data-inline-editor-ui="true"
      role="dialog"
      aria-modal="true"
      aria-label="ویرایش درجا"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(4,27,22,.72)",
        display: "grid",
        placeItems: "center",
        padding: 18,
      }}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !saving) setTarget(null);
      }}
    >
      <section
        style={{
          width: "min(680px, 100%)",
          background: "#fffdf8",
          color: "#173f33",
          borderRadius: 14,
          padding: 20,
          boxShadow: "0 24px 70px rgba(0,0,0,.35)",
          direction: "rtl",
        }}
      >
        <h2 style={{ marginTop: 0 }}>ویرایش همین بخش</h2>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          autoFocus
          rows={8}
          style={{
            width: "100%",
            resize: "vertical",
            padding: 12,
            border: "1px solid #c7a45b",
            borderRadius: 8,
            font: "inherit",
            lineHeight: 1.9,
            direction: "rtl",
            boxSizing: "border-box",
          }}
        />
        {message && <p style={{ margin: "10px 0 0" }}>{message}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !draft.trim()}
            style={{ padding: "10px 18px", border: 0, borderRadius: 7, background: "#173f33", color: "white", cursor: "pointer" }}
          >
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </button>
          <button
            type="button"
            onClick={() => setTarget(null)}
            disabled={saving}
            style={{ padding: "10px 18px", border: "1px solid #aaa", borderRadius: 7, background: "transparent", cursor: "pointer" }}
          >
            لغو
          </button>
        </div>
      </section>
    </div>
  );
}
