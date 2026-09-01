"use client";

import { useEffect, useRef, useState } from "react";

type Asset = { url: string; name: string; type: "image" | "pdf" | "link" };
type StoredEdit = { html: string; textAlign?: string; direction?: string; fontFamily?: string; fontSize?: string; assets?: Asset[] };
type EditTarget = { key: string; element: HTMLElement; stored: StoredEdit };

const editableSelector = [
  "main h1", "main h2", "main h3", "main p", ".hero h1", ".hero .hero-lead",
  ".mission-heading h2", ".mission-heading p", ".council-intro h2",
  ".council-intro > p:not(.section-kicker)", ".beheshti-copy h2",
  ".beheshti-copy .beheshti-lead", ".archive-header h2", ".research-card h3",
  ".research-card > p",
].join(",");

function elementKey(element: HTMLElement, index: number) {
  const section = element.closest("section")?.id || element.closest("main")?.className || "page";
  return `${window.location.pathname}:${section}:${element.tagName.toLowerCase()}:${index}`;
}

function sanitizeHtml(html: string) {
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

function parseStored(value: string | undefined, fallback: string): StoredEdit {
  if (!value) return { html: fallback, assets: [] };
  try {
    const parsed = JSON.parse(value) as StoredEdit;
    if (parsed && typeof parsed.html === "string") return { ...parsed, html: sanitizeHtml(parsed.html), assets: parsed.assets || [] };
  } catch {
    return { html: sanitizeHtml(value), assets: [] };
  }
  return { html: fallback, assets: [] };
}

function applyStored(element: HTMLElement, key: string, stored: StoredEdit) {
  element.innerHTML = sanitizeHtml(stored.html);
  element.style.textAlign = stored.textAlign || "";
  element.style.direction = stored.direction || "";
  element.style.fontFamily = stored.fontFamily || "";
  element.style.fontSize = stored.fontSize || "";

  document.querySelector(`[data-inline-assets-for="${CSS.escape(key)}"]`)?.remove();
  if (!stored.assets?.length) return;
  const wrap = document.createElement("div");
  wrap.dataset.inlineAssetsFor = key;
  Object.assign(wrap.style, { display: "grid", gap: "12px", margin: "14px 0 22px" });
  stored.assets.forEach((asset) => {
    if (asset.type === "image") {
      const img = document.createElement("img");
      img.src = asset.url;
      img.alt = asset.name;
      Object.assign(img.style, { width: "100%", maxHeight: "560px", objectFit: "contain", borderRadius: "10px" });
      wrap.appendChild(img);
    } else {
      const link = document.createElement("a");
      link.href = asset.url;
      link.textContent = asset.type === "pdf" ? `دریافت PDF: ${asset.name}` : asset.name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      Object.assign(link.style, { display: "inline-block", padding: "10px 14px", border: "1px solid #c7a45b", borderRadius: "8px" });
      wrap.appendChild(link);
    }
  });
  element.insertAdjacentElement("afterend", wrap);
}

export default function AdminEditShortcut() {
  const [allowed, setAllowed] = useState(false);
  const [target, setTarget] = useState<EditTarget | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [textAlign, setTextAlign] = useState("right");
  const [direction, setDirection] = useState("rtl");
  const [fontFamily, setFontFamily] = useState("");
  const [fontSize, setFontSize] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/posts", { cache: "no-store" }).then((r) => setAllowed(r.ok)).catch(() => setAllowed(false));
  }, []);

  useEffect(() => {
    if (!allowed) return;
    let disposed = false;
    const buttons: HTMLButtonElement[] = [];

    const install = async () => {
      const response = await fetch("/api/inline-edits", { cache: "no-store" }).catch(() => null);
      const data = response?.ok ? (await response.json() as { overrides?: Record<string, string> }) : { overrides: {} };
      if (disposed) return;
      const elements = Array.from(document.querySelectorAll<HTMLElement>(editableSelector))
        .filter((el) => !el.closest("[data-inline-editor-ui]") && el.textContent?.trim());

      elements.forEach((element, index) => {
        if (element.dataset.inlineEditReady === "true") return;
        element.dataset.inlineEditReady = "true";
        const key = elementKey(element, index);
        const stored = parseStored(data.overrides?.[key], element.innerHTML);
        if (data.overrides?.[key]) applyStored(element, key, stored);

        const button = document.createElement("button");
        button.type = "button";
        button.title = "ویرایش همین بخش";
        button.dataset.inlineEditorUi = "true";
        button.textContent = "✎";
        Object.assign(button.style, {
          display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px",
          marginInlineStart: "8px", padding: "0", border: "1px solid rgba(199,164,91,.75)", borderRadius: "50%",
          background: "#fffdf8", color: "#173f33", fontSize: "16px", cursor: "pointer", verticalAlign: "middle",
          boxShadow: "0 3px 10px rgba(0,0,0,.12)",
        });
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const current = parseStored(data.overrides?.[key], element.innerHTML);
          setTarget({ key, element, stored: current });
          setAssets(current.assets || []);
          setTextAlign(current.textAlign || element.style.textAlign || "right");
          setDirection(current.direction || element.style.direction || "rtl");
          setFontFamily(current.fontFamily || element.style.fontFamily || "");
          setFontSize(current.fontSize || element.style.fontSize || "");
          setMessage("");
          window.setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = current.html; }, 0);
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
      document.querySelectorAll<HTMLElement>("[data-inline-edit-ready]").forEach((el) => delete el.dataset.inlineEditReady);
    };
  }, [allowed]);

  function command(name: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setMessage("");
    try {
      const uploaded: Asset[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await response.json() as { url?: string; error?: string };
        if (!response.ok || !data.url) throw new Error(data.error || `آپلود ${file.name} انجام نشد.`);
        uploaded.push({ url: data.url, name: file.name, type: file.type === "application/pdf" ? "pdf" : "image" });
      }
      setAssets((current) => [...current, ...uploaded]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "آپلود انجام نشد.");
    } finally {
      setUploading(false);
    }
  }

  function addLink() {
    const url = linkUrl.trim();
    if (!url) return;
    setAssets((current) => [...current, { url, name: linkLabel.trim() || url, type: "link" }]);
    setLinkUrl("");
    setLinkLabel("");
  }

  async function save() {
    if (!target || saving || !editorRef.current) return;
    const stored: StoredEdit = {
      html: sanitizeHtml(editorRef.current.innerHTML), textAlign, direction, fontFamily, fontSize, assets,
    };
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/inline-edits", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: target.key, value: JSON.stringify(stored) }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "ذخیره انجام نشد.");
      applyStored(target.element, target.key, stored);
      setMessage("ذخیره شد.");
      window.setTimeout(() => setTarget(null), 450);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  if (!allowed || !target) return null;
  const toolStyle = { padding: "7px 10px", border: "1px solid #c7a45b", borderRadius: 6, background: "#fff", cursor: "pointer" } as const;

  return (
    <div data-inline-editor-ui="true" role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(4,27,22,.72)", overflow: "auto", padding: 18 }}>
      <section style={{ width: "min(900px, 100%)", margin: "24px auto", background: "#fffdf8", color: "#173f33", borderRadius: 14, padding: 20, boxShadow: "0 24px 70px rgba(0,0,0,.35)", direction: "rtl" }}>
        <h2 style={{ marginTop: 0 }}>ویرایش همین بخش</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
          <button type="button" style={toolStyle} onClick={() => command("bold")}><b>بولد</b></button>
          <button type="button" style={toolStyle} onClick={() => command("italic")}><i>ایتالیک</i></button>
          <button type="button" style={toolStyle} onClick={() => command("underline")}><u>زیرخط</u></button>
          <button type="button" style={toolStyle} onClick={() => command("insertUnorderedList")}>فهرست</button>
          <button type="button" style={toolStyle} onClick={() => command("justifyRight")}>راست</button>
          <button type="button" style={toolStyle} onClick={() => command("justifyCenter")}>وسط</button>
          <button type="button" style={toolStyle} onClick={() => command("justifyLeft")}>چپ</button>
          <button type="button" style={toolStyle} onClick={() => command("justifyFull")}>دوطرفه</button>
          <select value={fontFamily} onChange={(e) => { setFontFamily(e.target.value); command("fontName", e.target.value); }} style={toolStyle}>
            <option value="">فونت پیش‌فرض</option><option value="var(--font-naskh)">نسخ</option><option value="var(--font-nastaliq)">نستعلیق</option><option value="Tahoma">Tahoma</option><option value="serif">Serif</option>
          </select>
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} style={toolStyle}>
            <option value="">اندازه پیش‌فرض</option><option value="14px">۱۴</option><option value="16px">۱۶</option><option value="18px">۱۸</option><option value="22px">۲۲</option><option value="28px">۲۸</option><option value="36px">۳۶</option>
          </select>
          <select value={direction} onChange={(e) => setDirection(e.target.value)} style={toolStyle}><option value="rtl">راست‌به‌چپ</option><option value="ltr">چپ‌به‌راست</option></select>
          <select value={textAlign} onChange={(e) => setTextAlign(e.target.value)} style={toolStyle}><option value="right">راست</option><option value="center">وسط</option><option value="left">چپ</option><option value="justify">دوطرفه</option></select>
        </div>

        <div ref={editorRef} contentEditable suppressContentEditableWarning style={{ minHeight: 180, padding: 14, border: "1px solid #c7a45b", borderRadius: 8, lineHeight: 1.9, direction: direction as "rtl" | "ltr", textAlign: textAlign as "right" | "center" | "left" | "justify", fontFamily: fontFamily || undefined, fontSize: fontSize || undefined, background: "white" }} />

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #ddd" }}>
          <strong>تصاویر و PDFها</strong>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" onChange={(e) => void uploadFiles(e.target.files)} disabled={uploading} style={{ display: "block", marginTop: 10 }} />
          {uploading && <p>در حال آپلود…</p>}
          {!!assets.length && <div style={{ display: "grid", gap: 8, marginTop: 12 }}>{assets.map((asset, index) => <div key={`${asset.url}-${index}`} style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", border: "1px solid #ddd", padding: 8, borderRadius: 7 }}><span>{asset.type === "image" ? "تصویر" : asset.type === "pdf" ? "PDF" : "لینک"}: {asset.name}</span><button type="button" onClick={() => setAssets((current) => current.filter((_, i) => i !== index))}>حذف</button></div>)}</div>}
        </div>

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #ddd" }}>
          <strong>افزودن لینک</strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginTop: 10 }}>
            <input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="عنوان لینک" style={{ padding: 9 }} />
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." dir="ltr" style={{ padding: 9 }} />
            <button type="button" onClick={addLink}>افزودن</button>
          </div>
        </div>

        {message && <p style={{ margin: "12px 0 0" }}>{message}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button type="button" onClick={() => void save()} disabled={saving || uploading} style={{ padding: "10px 18px", border: 0, borderRadius: 7, background: "#173f33", color: "white", cursor: "pointer" }}>{saving ? "در حال ذخیره…" : "ذخیره"}</button>
          <button type="button" onClick={() => setTarget(null)} disabled={saving || uploading} style={{ padding: "10px 18px", border: "1px solid #aaa", borderRadius: 7, background: "transparent", cursor: "pointer" }}>لغو</button>
        </div>
      </section>
    </div>
  );
}
