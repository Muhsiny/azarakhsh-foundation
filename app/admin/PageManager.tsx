"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type PagePost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentType: string;
  visibility: string;
  featured: number;
  status: "draft" | "review" | "approved" | "published" | "archived";
};

const blank = {
  title: "",
  excerpt: "",
  content: "",
  visibility: "public",
  featured: true,
  status: "draft" as PagePost["status"],
};

export default function PageManager() {
  const [pages, setPages] = useState<PagePost[]>([]);
  const [draft, setDraft] = useState(blank);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/posts");
    const data = (await response.json()) as { posts?: PagePost[]; error?: string };
    if (!response.ok) setMessage(data.error || "صفحه‌ها دریافت نشد.");
    setPages((data.posts || []).filter((post) => post.contentType === "page"));
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch(editingId ? `/api/admin/posts/${editingId}` : "/api/admin/posts", {
      method: editingId ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...draft,
        contentType: "page",
        category: "صفحات سایت",
        language: "fa",
        authorName: "بنیاد آذرخش",
        tags: "صفحه",
        sourceNote: "صفحهٔ رسمی سایت",
      }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) setMessage(data.error || "ذخیره صفحه انجام نشد.");
    else {
      setMessage(editingId ? "صفحه ویرایش شد." : "صفحه ایجاد شد. پس از انتشار، پیوند آن در سایت ظاهر می‌شود.");
      setDraft(blank);
      setEditingId(null);
      await load();
    }
    setSaving(false);
  }

  function edit(page: PagePost) {
    setEditingId(page.id);
    setDraft({
      title: page.title,
      excerpt: page.excerpt,
      content: page.content,
      visibility: page.visibility,
      featured: Boolean(page.featured),
      status: page.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(page: PagePost) {
    if (!window.confirm(`صفحهٔ «${page.title}» حذف شود؟`)) return;
    const response = await fetch(`/api/admin/posts/${page.id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    setMessage(response.ok ? "صفحه حذف شد." : data.error || "حذف انجام نشد.");
    if (response.ok) await load();
  }

  return (
    <section className="site-studio page-manager">
      <div className="studio-heading">
        <div>
          <p className="section-kicker">صفحه‌ساز</p>
          <h2>ساخت و مدیریت صفحه‌های مستقل</h2>
          <p>صفحهٔ تازه بسازید، پیش‌نویس نگه دارید، منتشر کنید و با گزینهٔ «نمایش در منو» آن را به هیدر و فوتر بیفزایید.</p>
        </div>
      </div>
      {message && <p className="admin-message">{message}</p>}

      <div className="admin-grid">
        <form className="editor-card" onSubmit={save}>
          <div className="editor-title">
            <div><p className="section-kicker">{editingId ? "ویرایش صفحه" : "صفحهٔ تازه"}</p><h2>{editingId ? "اصلاح صفحه" : "ایجاد صفحه"}</h2></div>
            {editingId && <button className="quiet-button" type="button" onClick={() => { setEditingId(null); setDraft(blank); }}>لغو</button>}
          </div>
          <label>عنوان صفحه<input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
          <label>خلاصه<textarea rows={3} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} /></label>
          <label>متن کامل صفحه<textarea className="content-editor" rows={14} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} /></label>
          <div className="form-row">
            <label>وضعیت<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as PagePost["status"] })}><option value="draft">پیش‌نویس</option><option value="review">بررسی</option><option value="approved">تأییدشده</option><option value="published">منتشرشده</option><option value="archived">بایگانی‌شده</option></select></label>
            <label>دسترسی<select value={draft.visibility} onChange={(e) => setDraft({ ...draft, visibility: e.target.value })}><option value="public">عمومی</option><option value="members">اعضا</option><option value="private">خصوصی</option></select></label>
          </div>
          <label className="visibility-toggle"><input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} /> نمایش پیوند صفحه در هیدر و فوتر</label>
          <button className="button button-dark" disabled={saving} type="submit">{saving ? "در حال ذخیره..." : editingId ? "ذخیرهٔ تغییرات" : "ساخت صفحه"}</button>
        </form>

        <section className="library-card">
          <div className="editor-title"><div><p className="section-kicker">کتابخانه صفحات</p><h2>صفحه‌های موجود</h2></div></div>
          {pages.length === 0 ? <p>هنوز صفحهٔ مستقلی ساخته نشده است.</p> : pages.map((page) => (
            <article className="admin-post-row" key={page.id}>
              <div><strong>{page.title}</strong><small>/{page.slug} — {page.status}{page.featured ? " — در منو" : ""}</small></div>
              <div><a href={`/pages/${page.slug}`} target="_blank" rel="noreferrer">مشاهده</a><button type="button" onClick={() => edit(page)}>ویرایش</button><button className="danger-button" type="button" onClick={() => void remove(page)}>حذف</button></div>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}
