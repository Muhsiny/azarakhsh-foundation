"use client";

import { useEffect, useRef, useState } from "react";

type Asset = { url: string; name: string; type: "image" | "pdf" | "link" };
type RichBlock = { html: string; textAlign?: string; direction?: string; fontFamily?: string; fontSize?: string; assets?: Asset[] };
type Subsection = { id: string; title: string; body: RichBlock };
type EditTarget = { key: string; element: HTMLElement; value: RichBlock };

const selector = "main h1,main h2,main h3,main h4,main p,main li,main blockquote,main figcaption";

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

function parseBlock(raw: string | undefined, fallback = ""): RichBlock {
  if (!raw) return { html: fallback, assets: [] };
  try {
    const value = JSON.parse(raw) as RichBlock;
    if (value && typeof value.html === "string") return { ...value, html: clean(value.html), assets: value.assets || [] };
  } catch {
    return { html: clean(raw), assets: [] };
  }
  return { html: fallback, assets: [] };
}

function keyFor(element: HTMLElement, all: HTMLElement[]) {
  const area = element.closest("section")?.id || element.closest("article")?.className || element.closest("main")?.className || "page";
  const same = all.filter((item) => item.tagName === element.tagName && (item.closest("section")?.id || item.closest("article")?.className || item.closest("main")?.className || "page") === area);
  return `${window.location.pathname}:${area}:${element.tagName.toLowerCase()}:${Math.max(0, same.indexOf(element))}`;
}

function renderAssets(element: HTMLElement, key: string, assets: Asset[] = []) {
  document.querySelector(`[data-rich-assets="${CSS.escape(key)}"]`)?.remove();
  if (!assets.length) return;
  const wrap = document.createElement("div");
  wrap.dataset.richAssets = key;
  Object.assign(wrap.style, { display: "grid", gap: "12px", margin: "14px 0 24px" });
  assets.forEach((asset) => {
    if (asset.type === "image") {
      const image = document.createElement("img");
      image.src = asset.url;
      image.alt = asset.name;
      Object.assign(image.style, { width: "100%", maxHeight: "620px", objectFit: "contain", borderRadius: "10px" });
      wrap.appendChild(image);
    } else {
      const link = document.createElement("a");
      link.href = asset.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = asset.type === "pdf" ? `دریافت PDF: ${asset.name}` : asset.name;
      Object.assign(link.style, { display: "inline-block", padding: "10px 14px", border: "1px solid #c7a45b", borderRadius: "8px" });
      wrap.appendChild(link);
    }
  });
  element.insertAdjacentElement("afterend", wrap);
}

function applyBlock(element: HTMLElement, key: string, block: RichBlock) {
  element.innerHTML = clean(block.html);
  element.style.textAlign = block.textAlign || "";
  element.style.direction = block.direction || "";
  element.style.fontFamily = block.fontFamily || "";
  element.style.fontSize = block.fontSize || "";
  renderAssets(element, key, block.assets);
}

export default function UniversalInlineEditor() {
  const [admin, setAdmin] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [target, setTarget] = useState<EditTarget | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [align, setAlign] = useState("right");
  const [direction, setDirection] = useState("rtl");
  const [font, setFont] = useState("");
  const [size, setSize] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [subTitle, setSubTitle] = useState("");
  const [editingSub, setEditingSub] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const subKey = typeof window === "undefined" ? "" : `${window.location.pathname}:subsections`;

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/posts", { cache: "no-store" }).then((r) => r.ok).catch(() => false),
      fetch("/api/inline-edits", { cache: "no-store" })
        .then(async (r) => (await r.json()) as { overrides?: Record<string, string> })
        .catch((): { overrides?: Record<string, string> } => ({ overrides: {} })),
    ]).then(([isAdmin, data]) => {
      setAdmin(isAdmin);
      setOverrides(data.overrides || {});
      const raw = data.overrides?.[`${window.location.pathname}:subsections`];
      if (raw) {
        try { setSubsections(JSON.parse(raw)); } catch { setSubsections([]); }
      }
    });
  }, []);

  useEffect(() => {
    const scan = () => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((el) => !el.closest("[data-universal-editor-ui]") && !el.closest("[data-generated-subsection]"));
      elements.forEach((element) => {
        const key = keyFor(element, elements);
        const raw = overrides[key];
        if (raw && element.dataset.richApplied !== raw) {
          applyBlock(element, key, parseBlock(raw, element.innerHTML));
          element.dataset.richApplied = raw;
        }
        if (!admin || element.dataset.pencilReady === "true" || !element.textContent?.trim()) return;
        element.dataset.pencilReady = "true";
        const pencil = document.createElement("button");
        pencil.type = "button";
        pencil.textContent = "✎";
        pencil.title = "ویرایش همین بخش";
        pencil.dataset.universalEditorUi = "true";
        Object.assign(pencil.style, { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", marginInlineStart: "8px", padding: "0", border: "1px solid #c7a45b", borderRadius: "50%", background: "#fffdf8", color: "#173f33", cursor: "pointer", verticalAlign: "middle", zIndex: "20" });
        pencil.onclick = (event) => {
          event.preventDefault(); event.stopPropagation();
          const value = parseBlock(overrides[key], element.innerHTML);
          setTarget({ key, element, value });
          setAssets(value.assets || []); setAlign(value.textAlign || "right"); setDirection(value.direction || "rtl"); setFont(value.fontFamily || ""); setSize(value.fontSize || ""); setMessage(""); setEditingSub(null);
          setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = value.html; }, 0);
        };
        element.insertAdjacentElement("afterend", pencil);
      });

      const article = document.querySelector<HTMLElement>(".knowledge-article");
      if (article && admin && !document.querySelector("[data-add-subsection]")) {
        const add = document.createElement("button");
        add.type = "button"; add.dataset.addSubsection = "true"; add.dataset.universalEditorUi = "true"; add.textContent = "+ افزودن زیربخش";
        Object.assign(add.style, { display: "block", margin: "26px 0", padding: "11px 18px", border: "1px solid #c7a45b", borderRadius: "8px", background: "#fffdf8", color: "#173f33", fontWeight: "700", cursor: "pointer" });
        add.onclick = () => {
          setSubTitle(""); setEditingSub("new"); setAssets([]); setAlign("right"); setDirection("rtl"); setFont(""); setSize(""); setMessage("");
          setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = ""; }, 0);
        };
        article.appendChild(add);
      }
    };
    scan();
    const observer = new MutationObserver(() => window.setTimeout(scan, 60));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [admin, overrides]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const next: Asset[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData(); form.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await response.json() as { url?: string; error?: string };
        if (!response.ok || !data.url) throw new Error(data.error || `آپلود ${file.name} انجام نشد.`);
        next.push({ url: data.url, name: file.name, type: file.type === "application/pdf" ? "pdf" : "image" });
      }
      setAssets((current) => [...current, ...next]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "آپلود انجام نشد."); }
    finally { setBusy(false); }
  }

  async function put(key: string, value: string) {
    const response = await fetch("/api/inline-edits", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) throw new Error(data.error || "ذخیره انجام نشد.");
    setOverrides((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!editorRef.current) return;
    setBusy(true); setMessage("");
    const block: RichBlock = { html: clean(editorRef.current.innerHTML), textAlign: align, direction, fontFamily: font, fontSize: size, assets };
    try {
      if (editingSub) {
        if (!subTitle.trim()) throw new Error("عنوان زیربخش را بنویس.");
        const next = editingSub === "new" ? [...subsections, { id: crypto.randomUUID(), title: subTitle.trim(), body: block }] : subsections.map((item) => item.id === editingSub ? { ...item, title: subTitle.trim(), body: block } : item);
        await put(subKey, JSON.stringify(next)); setSubsections(next); setEditingSub(null);
      } else if (target) {
        const raw = JSON.stringify(block); await put(target.key, raw); applyBlock(target.element, target.key, block); setTarget(null);
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "ذخیره انجام نشد."); }
    finally { setBusy(false); }
  }

  async function removeSub(id: string) {
    const next = subsections.filter((item) => item.id !== id);
    await put(subKey, JSON.stringify(next)); setSubsections(next);
  }

  const modalOpen = Boolean(target || editingSub);
  const tool = { padding: "7px 10px", border: "1px solid #c7a45b", borderRadius: 6, background: "#fff", cursor: "pointer" } as const;

  return (
    <>
      {subsections.length > 0 && <div data-generated-subsection="true" style={{ display: "contents" }}>{subsections.map((item, index) => <section key={item.id} id={`custom-section-${index + 1}`} style={{ margin: "38px 0" }}><span className="knowledge-index">{String(index + 1).padStart(2, "0")}</span><h2>{item.title}</h2><div dangerouslySetInnerHTML={{ __html: clean(item.body.html) }} style={{ textAlign: (item.body.textAlign || "right") as "right", direction: (item.body.direction || "rtl") as "rtl", fontFamily: item.body.fontFamily || undefined, fontSize: item.body.fontSize || undefined, lineHeight: 2 }} />{item.body.assets?.map((asset) => asset.type === "image" ? <img key={asset.url} src={asset.url} alt={asset.name} style={{ width: "100%", maxHeight: 620, objectFit: "contain", marginTop: 12 }} /> : <a key={asset.url} href={asset.url} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 10 }}>{asset.type === "pdf" ? `دریافت PDF: ${asset.name}` : asset.name}</a>)}{admin && <div style={{ display: "flex", gap: 8, marginTop: 12 }}><button onClick={() => { setEditingSub(item.id); setSubTitle(item.title); setAssets(item.body.assets || []); setAlign(item.body.textAlign || "right"); setDirection(item.body.direction || "rtl"); setFont(item.body.fontFamily || ""); setSize(item.body.fontSize || ""); setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = item.body.html; }, 0); }}>ویرایش زیربخش</button><button onClick={() => void removeSub(item.id)}>حذف</button></div>}</section>)}</div>}
      {modalOpen && <div data-universal-editor-ui="true" style={{ position: "fixed", inset: 0, zIndex: 12000, background: "rgba(4,27,22,.76)", overflow: "auto", padding: 18 }}><section style={{ width: "min(920px,100%)", margin: "24px auto", background: "#fffdf8", padding: 20, borderRadius: 14, direction: "rtl" }}><h2>{editingSub ? "افزودن یا ویرایش زیربخش" : "ویرایش همین بخش"}</h2>{editingSub && <input value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="عنوان زیربخش" style={{ width: "100%", padding: 11, marginBottom: 10, boxSizing: "border-box" }} />}<div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}><button style={tool} onClick={() => document.execCommand("bold")}><b>بولد</b></button><button style={tool} onClick={() => document.execCommand("italic")}><i>ایتالیک</i></button><button style={tool} onClick={() => document.execCommand("underline")}><u>زیرخط</u></button><button style={tool} onClick={() => document.execCommand("insertUnorderedList")}>فهرست</button><select style={tool} value={align} onChange={(e) => setAlign(e.target.value)}><option value="right">راست</option><option value="center">وسط</option><option value="left">چپ</option><option value="justify">دوطرفه</option></select><select style={tool} value={direction} onChange={(e) => setDirection(e.target.value)}><option value="rtl">راست‌به‌چپ</option><option value="ltr">چپ‌به‌راست</option></select><select style={tool} value={font} onChange={(e) => setFont(e.target.value)}><option value="">فونت پیش‌فرض</option><option value="var(--font-naskh)">نسخ</option><option value="var(--font-nastaliq)">نستعلیق</option><option value="Tahoma">Tahoma</option></select><select style={tool} value={size} onChange={(e) => setSize(e.target.value)}><option value="">اندازه پیش‌فرض</option><option value="14px">۱۴</option><option value="16px">۱۶</option><option value="18px">۱۸</option><option value="22px">۲۲</option><option value="28px">۲۸</option><option value="36px">۳۶</option></select></div><div ref={editorRef} contentEditable suppressContentEditableWarning style={{ minHeight: 190, border: "1px solid #c7a45b", borderRadius: 8, padding: 14, background: "white", lineHeight: 2, textAlign: align as "right", direction: direction as "rtl", fontFamily: font || undefined, fontSize: size || undefined }} /><div style={{ marginTop: 16 }}><strong>چند تصویر یا PDF</strong><input type="file" multiple accept="image/*,application/pdf" onChange={(e) => void upload(e.target.files)} style={{ display: "block", marginTop: 8 }} />{assets.map((asset, i) => <div key={`${asset.url}-${i}`} style={{ display: "flex", justifyContent: "space-between", padding: 7, borderBottom: "1px solid #ddd" }}><span>{asset.name}</span><button onClick={() => setAssets((list) => list.filter((_, x) => x !== i))}>حذف</button></div>)}</div>{message && <p>{message}</p>}<div style={{ display: "flex", gap: 10, marginTop: 18 }}><button disabled={busy} onClick={() => void save()} style={{ padding: "10px 18px", background: "#173f33", color: "white", border: 0, borderRadius: 7 }}>{busy ? "در حال ذخیره…" : "ذخیره"}</button><button disabled={busy} onClick={() => { setTarget(null); setEditingSub(null); }}>لغو</button></div></section></div>}
    </>
  );
}
