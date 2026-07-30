"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Asset = { url: string; name: string; type: "image" | "pdf" | "link" };
type Block = { html: string; align?: string; direction?: string; font?: string; size?: string; assets?: Asset[] };
type Subsection = { id: string; title: string; body: Block };
type Target = { key: string; element: HTMLElement; block: Block };

const editableSelector = "main h1,main h2,main h3,main h4,main p,main li,main blockquote,main figcaption";

function clean(html: string) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,form,input,button").forEach((node) => node.remove());
  doc.querySelectorAll<HTMLElement>("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.toLowerCase();
      if (name.startsWith("on") || (name === "href" && value.startsWith("javascript:"))) node.removeAttribute(attr.name);
    });
  });
  return doc.body.firstElementChild?.innerHTML || "";
}

function parseBlock(raw: string | undefined, fallback: string): Block {
  if (!raw) return { html: fallback, assets: [] };
  try {
    const parsed = JSON.parse(raw) as Block;
    if (parsed && typeof parsed.html === "string") return { ...parsed, html: clean(parsed.html), assets: parsed.assets || [] };
  } catch {}
  return { html: clean(raw), assets: [] };
}

function stableKey(element: HTMLElement, all: HTMLElement[]) {
  const area = element.closest("section")?.id || element.closest("article")?.className || element.closest("main")?.className || "page";
  const peers = all.filter((item) => item.tagName === element.tagName && (item.closest("section")?.id || item.closest("article")?.className || item.closest("main")?.className || "page") === area);
  return `${location.pathname}:${area}:${element.tagName.toLowerCase()}:${Math.max(0, peers.indexOf(element))}`;
}

function apply(element: HTMLElement, key: string, block: Block) {
  element.innerHTML = clean(block.html);
  element.style.textAlign = block.align || "";
  element.style.direction = block.direction || "";
  element.style.fontFamily = block.font || "";
  element.style.fontSize = block.size || "";
  document.querySelector(`[data-attachments-for="${CSS.escape(key)}"]`)?.remove();
  if (!block.assets?.length) return;
  const wrap = document.createElement("div");
  wrap.dataset.attachmentsFor = key;
  Object.assign(wrap.style, { display: "grid", gap: "12px", margin: "14px 0 24px" });
  block.assets.forEach((asset) => {
    if (asset.type === "image") {
      const img = document.createElement("img");
      img.src = asset.url; img.alt = asset.name;
      Object.assign(img.style, { width: "100%", maxHeight: "620px", objectFit: "contain", borderRadius: "10px" });
      wrap.appendChild(img);
    } else {
      const link = document.createElement("a");
      link.href = asset.url; link.target = "_blank"; link.rel = "noopener noreferrer";
      link.textContent = asset.type === "pdf" ? `دریافت PDF: ${asset.name}` : asset.name;
      wrap.appendChild(link);
    }
  });
  element.insertAdjacentElement("afterend", wrap);
}

export default function UniversalInlineEditorV2() {
  const [admin, setAdmin] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [target, setTarget] = useState<Target | null>(null);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [editingSub, setEditingSub] = useState<string | null>(null);
  const [subTitle, setSubTitle] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [align, setAlign] = useState("right");
  const [direction, setDirection] = useState("rtl");
  const [font, setFont] = useState("");
  const [size, setSize] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [articleRoot, setArticleRoot] = useState<HTMLElement | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const subKey = typeof window === "undefined" ? "" : `${location.pathname}:subsections`;

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/posts", { cache: "no-store" }).then((r) => r.ok).catch(() => false),
      fetch("/api/inline-edits", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ overrides: {} })),
    ]).then(([isAdmin, data]) => {
      setAdmin(isAdmin);
      const map = data.overrides || {};
      setOverrides(map);
      const raw = map[`${location.pathname}:subsections`];
      if (raw) try { setSubsections(JSON.parse(raw)); } catch {}
    });
  }, []);

  useEffect(() => {
    let timer = 0;
    const scan = () => {
      setArticleRoot(document.querySelector<HTMLElement>(".knowledge-article"));
      const all = Array.from(document.querySelectorAll<HTMLElement>(editableSelector)).filter((el) => !el.closest("[data-inline-ui]") && !el.closest("[data-custom-subsection]"));
      all.forEach((element) => {
        const key = stableKey(element, all);
        const raw = overrides[key];
        if (raw && element.dataset.overrideValue !== raw) {
          apply(element, key, parseBlock(raw, element.innerHTML));
          element.dataset.overrideValue = raw;
        }
        if (!admin || element.dataset.inlinePencil === "1" || !element.textContent?.trim()) return;
        element.dataset.inlinePencil = "1";
        const pencil = document.createElement("button");
        pencil.type = "button"; pencil.textContent = "✎"; pencil.title = "ویرایش همین بخش"; pencil.dataset.inlineUi = "true";
        Object.assign(pencil.style, { display: "inline-flex", width: "28px", height: "28px", alignItems: "center", justifyContent: "center", marginInlineStart: "8px", border: "1px solid #c7a45b", borderRadius: "50%", background: "#fffdf8", color: "#173f33", cursor: "pointer", verticalAlign: "middle" });
        pencil.onclick = (event) => {
          event.preventDefault(); event.stopPropagation();
          const block = parseBlock(overrides[key], element.innerHTML);
          setTarget({ key, element, block }); setEditingSub(null); setAssets(block.assets || []); setAlign(block.align || "right"); setDirection(block.direction || "rtl"); setFont(block.font || ""); setSize(block.size || ""); setMessage("");
          setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = block.html; }, 0);
        };
        element.insertAdjacentElement("afterend", pencil);
      });
    };
    scan();
    const observer = new MutationObserver(() => { clearTimeout(timer); timer = window.setTimeout(scan, 80); });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [admin, overrides]);

  async function put(key: string, value: string) {
    const response = await fetch("/api/inline-edits", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) throw new Error(data.error || "ذخیره انجام نشد.");
    setOverrides((current) => ({ ...current, [key]: value }));
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setMessage("");
    try {
      const added: Asset[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData(); form.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await response.json() as { url?: string; error?: string };
        if (!response.ok || !data.url) throw new Error(data.error || `آپلود ${file.name} انجام نشد.`);
        added.push({ url: data.url, name: file.name, type: file.type === "application/pdf" ? "pdf" : "image" });
      }
      setAssets((current) => [...current, ...added]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "آپلود انجام نشد."); }
    finally { setBusy(false); }
  }

  function openNewSubsection() {
    setEditingSub("new"); setTarget(null); setSubTitle(""); setAssets([]); setAlign("right"); setDirection("rtl"); setFont(""); setSize(""); setMessage("");
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = ""; }, 0);
  }

  async function save() {
    if (!editorRef.current) return;
    const block: Block = { html: clean(editorRef.current.innerHTML), align, direction, font, size, assets };
    setBusy(true); setMessage("");
    try {
      if (editingSub) {
        if (!subTitle.trim()) throw new Error("عنوان زیربخش را بنویس.");
        const next = editingSub === "new" ? [...subsections, { id: crypto.randomUUID(), title: subTitle.trim(), body: block }] : subsections.map((item) => item.id === editingSub ? { ...item, title: subTitle.trim(), body: block } : item);
        await put(subKey, JSON.stringify(next)); setSubsections(next); setEditingSub(null);
      } else if (target) {
        const raw = JSON.stringify(block); await put(target.key, raw); apply(target.element, target.key, block); setTarget(null);
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "ذخیره انجام نشد."); }
    finally { setBusy(false); }
  }

  async function removeSub(id: string) {
    const next = subsections.filter((item) => item.id !== id);
    await put(subKey, JSON.stringify(next)); setSubsections(next);
  }

  const subsectionsUi = articleRoot ? createPortal(<div data-custom-subsection="true">
    {subsections.map((item, index) => <section key={item.id} id={`custom-section-${index + 1}`} style={{ margin: "42px 0" }}><span className="knowledge-index">{String(index + 1).padStart(2, "0")}</span><h2>{item.title}</h2><div dangerouslySetInnerHTML={{ __html: clean(item.body.html) }} style={{ textAlign: (item.body.align || "right") as "right", direction: (item.body.direction || "rtl") as "rtl", fontFamily: item.body.font || undefined, fontSize: item.body.size || undefined, lineHeight: 2 }} />{item.body.assets?.map((asset) => asset.type === "image" ? <img key={asset.url} src={asset.url} alt={asset.name} style={{ width: "100%", maxHeight: 620, objectFit: "contain", marginTop: 12 }} /> : <a key={asset.url} href={asset.url} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 10 }}>{asset.type === "pdf" ? `دریافت PDF: ${asset.name}` : asset.name}</a>)}{admin && <div style={{ display: "flex", gap: 8, marginTop: 12 }}><button onClick={() => { setEditingSub(item.id); setTarget(null); setSubTitle(item.title); setAssets(item.body.assets || []); setAlign(item.body.align || "right"); setDirection(item.body.direction || "rtl"); setFont(item.body.font || ""); setSize(item.body.size || ""); setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = item.body.html; }, 0); }}>ویرایش زیربخش</button><button onClick={() => void removeSub(item.id)}>حذف</button></div>}</section>)}
    {admin && <button data-inline-ui="true" onClick={openNewSubsection} style={{ margin: "28px 0", padding: "11px 18px", border: "1px solid #c7a45b", borderRadius: 8, background: "#fffdf8", color: "#173f33", fontWeight: 700 }}>+ افزودن زیربخش</button>}
  </div>, articleRoot) : null;

  const open = Boolean(target || editingSub);
  const tool = { padding: "7px 10px", border: "1px solid #c7a45b", borderRadius: 6, background: "#fff", cursor: "pointer" } as const;

  return <>{subsectionsUi}{open && <div data-inline-ui="true" style={{ position: "fixed", inset: 0, zIndex: 12000, background: "rgba(4,27,22,.76)", overflow: "auto", padding: 18 }}><section style={{ width: "min(920px,100%)", margin: "24px auto", background: "#fffdf8", padding: 20, borderRadius: 14, direction: "rtl" }}><h2>{editingSub ? "افزودن یا ویرایش زیربخش" : "ویرایش همین بخش"}</h2>{editingSub && <input value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="عنوان زیربخش" style={{ width: "100%", padding: 11, marginBottom: 10, boxSizing: "border-box" }} />}<div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}><button style={tool} onClick={() => document.execCommand("bold")}><b>بولد</b></button><button style={tool} onClick={() => document.execCommand("italic")}><i>ایتالیک</i></button><button style={tool} onClick={() => document.execCommand("underline")}><u>زیرخط</u></button><button style={tool} onClick={() => document.execCommand("insertUnorderedList")}>فهرست</button><select style={tool} value={align} onChange={(e) => setAlign(e.target.value)}><option value="right">راست</option><option value="center">وسط</option><option value="left">چپ</option><option value="justify">دوطرفه</option></select><select style={tool} value={direction} onChange={(e) => setDirection(e.target.value)}><option value="rtl">راست‌به‌چپ</option><option value="ltr">چپ‌به‌راست</option></select><select style={tool} value={font} onChange={(e) => setFont(e.target.value)}><option value="">فونت پیش‌فرض</option><option value="var(--font-naskh)">نسخ</option><option value="var(--font-nastaliq)">نستعلیق</option><option value="Tahoma">Tahoma</option></select><select style={tool} value={size} onChange={(e) => setSize(e.target.value)}><option value="">اندازه پیش‌فرض</option><option value="14px">۱۴</option><option value="16px">۱۶</option><option value="18px">۱۸</option><option value="22px">۲۲</option><option value="28px">۲۸</option><option value="36px">۳۶</option></select></div><div ref={editorRef} contentEditable suppressContentEditableWarning style={{ minHeight: 190, border: "1px solid #c7a45b", borderRadius: 8, padding: 14, background: "white", lineHeight: 2, textAlign: align as "right", direction: direction as "rtl", fontFamily: font || undefined, fontSize: size || undefined }} /><div style={{ marginTop: 16 }}><strong>چند تصویر یا PDF</strong><input type="file" multiple accept="image/*,application/pdf" onChange={(e) => void upload(e.target.files)} style={{ display: "block", marginTop: 8 }} />{assets.map((asset, index) => <div key={`${asset.url}-${index}`} style={{ display: "flex", justifyContent: "space-between", padding: 7, borderBottom: "1px solid #ddd" }}><span>{asset.name}</span><button onClick={() => setAssets((list) => list.filter((_, i) => i !== index))}>حذف</button></div>)}</div>{message && <p>{message}</p>}<div style={{ display: "flex", gap: 10, marginTop: 18 }}><button disabled={busy} onClick={() => void save()} style={{ padding: "10px 18px", background: "#173f33", color: "white", border: 0, borderRadius: 7 }}>{busy ? "در حال ذخیره…" : "ذخیره"}</button><button disabled={busy} onClick={() => { setTarget(null); setEditingSub(null); }}>لغو</button></div></section></div>}</>;
}
