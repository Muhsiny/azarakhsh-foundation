"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import GovernanceCenter from "./GovernanceCenter";
import SiteStudio from "./SiteStudio";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  contentType: string;
  language: string;
  visibility: string;
  authorName: string;
  coverImage: string | null;
  fileUrl: string | null;
  fileName: string | null;
  sourceNote: string;
  tags: string;
  featured: number;
  views: number;
  downloads: number;
  status: "draft" | "review" | "approved" | "published" | "archived";
  updatedAt: string;
};

type Draft = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  contentType: string;
  language: string;
  visibility: string;
  authorName: string;
  coverImage: string;
  fileUrl: string;
  fileName: string;
  sourceNote: string;
  tags: string;
  featured: boolean;
  status: "draft" | "review" | "approved" | "published" | "archived";
};

const blankDraft: Draft = {
  title: "",
  excerpt: "",
  content: "",
  category: "مقالات",
  contentType: "article",
  language: "fa",
  visibility: "public",
  authorName: "",
  coverImage: "",
  fileUrl: "",
  fileName: "",
  sourceNote: "",
  tags: "",
  featured: false,
  status: "draft",
};

export default function AdminDashboard({
  displayName,
  signOutHref,
}: {
  displayName: string;
  signOutHref: string;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/posts");
    const data = (await response.json()) as { posts?: Post[]; error?: string };
    setPosts(data.posts ?? []);
    setMessage(data.error ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  async function uploadCover(file: File) {
    setSaving(true);
    setMessage("تصویر در حال بارگذاری است...");
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      setMessage(data.error ?? "بارگذاری تصویر انجام نشد.");
    } else {
      setDraft((current) => ({ ...current, coverImage: data.url! }));
      setMessage("تصویر با موفقیت آماده شد.");
    }
    setSaving(false);
  }

  async function uploadAttachment(file: File) {
    setSaving(true);
    setMessage("فایل در حال بارگذاری است...");
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      setMessage(data.error ?? "بارگذاری فایل انجام نشد.");
    } else {
      setDraft((current) => ({ ...current, fileUrl: data.url!, fileName: file.name }));
      setMessage("فایل با موفقیت به آرشیو افزوده شد.");
    }
    setSaving(false);
  }

  async function savePost(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch(
      editingId ? `/api/admin/posts/${editingId}` : "/api/admin/posts",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      },
    );
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "ذخیره انجام نشد.");
    } else {
      setMessage(editingId ? "تغییرات ذخیره شد." : "نوشته ایجاد شد.");
      setDraft(blankDraft);
      setEditingId(null);
      await loadPosts();
    }
    setSaving(false);
  }

  function editPost(post: Post) {
    setEditingId(post.id);
    setDraft({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      contentType: post.contentType,
      language: post.language,
      visibility: post.visibility,
      authorName: post.authorName,
      coverImage: post.coverImage ?? "",
      fileUrl: post.fileUrl ?? "",
      fileName: post.fileName ?? "",
      sourceNote: post.sourceNote,
      tags: post.tags,
      featured: Boolean(post.featured),
      status: post.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletePost(post: Post) {
    if (!window.confirm(`نوشتهٔ «${post.title}» حذف شود؟`)) return;
    const response = await fetch(`/api/admin/posts/${post.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { error?: string };
    setMessage(
      response.ok ? "نوشته حذف شد." : data.error ?? "حذف انجام نشد.",
    );
    if (response.ok) await loadPosts();
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="section-kicker">مرکز مدیریت بنیاد آذرخش</p>
          <h1>تحریریه و آرشیو</h1>
        </div>
        <div className="admin-account">
          <span>{displayName}</span>
          <a href="/">مشاهدهٔ سایت</a>
          <a href={signOutHref}>خروج</a>
        </div>
      </header>

      <GovernanceCenter />
      <SiteStudio />

      <section className="admin-grid">
        <form className="editor-card" onSubmit={savePost}>
          <div className="editor-title">
            <div>
              <p className="section-kicker">
                {editingId ? "ویرایش نوشته" : "نوشتهٔ تازه"}
              </p>
              <h2>{editingId ? "اصلاح و بازنشر" : "ایجاد محتوای جدید"}</h2>
            </div>
            {editingId && (
              <button
                className="quiet-button"
                onClick={() => {
                  setEditingId(null);
                  setDraft(blankDraft);
                }}
                type="button"
              >
                لغو ویرایش
              </button>
            )}
          </div>

          <label>
            عنوان
            <input
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              required
              value={draft.title}
            />
          </label>
          <div className="form-row">
            <label>
              نوع آرشیو
              <select
                onChange={(event) => setDraft({ ...draft, contentType: event.target.value })}
                value={draft.contentType}
              >
                <option value="article">مقاله و پژوهش</option>
                <option value="book">کتاب</option>
                <option value="document">سند تاریخی</option>
                <option value="biography">زندگی‌نامه</option>
                <option value="oral-history">تاریخ شفاهی</option>
                <option value="image">تصویر</option>
                <option value="video">ویدیو</option>
                <option value="audio">صوت</option>
                <option value="news">خبر بنیاد</option>
              </select>
            </label>
            <label>
              دسته‌بندی
              <select
                onChange={(event) =>
                  setDraft({ ...draft, category: event.target.value })
                }
                value={draft.category}
              >
                <option>مقالات</option>
                <option>شورای اتفاق</option>
                <option>آیت‌الله بهشتی</option>
                <option>اسناد تاریخی</option>
                <option>روایت‌ها</option>
                <option>اخبار بنیاد</option>
              </select>
            </label>
            <label>
              وضعیت
              <select
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    status: event.target.value as Draft["status"],
                  })
                }
                value={draft.status}
              >
                <option value="draft">پیش‌نویس</option>
                <option value="review">ارسال برای بررسی</option>
                <option value="approved">تأییدشده</option>
                <option value="published">منتشرشده</option>
                <option value="archived">بایگانی‌شده</option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              زبان
              <select
                onChange={(event) => setDraft({ ...draft, language: event.target.value })}
                value={draft.language}
              >
                <option value="fa">فارسی</option>
                <option value="ps">پښتو</option>
                <option value="en">English</option>
              </select>
            </label>
            <label>
              دسترسی
              <select
                onChange={(event) => setDraft({ ...draft, visibility: event.target.value })}
                value={draft.visibility}
              >
                <option value="public">عمومی</option>
                <option value="members">فقط اعضای تأییدشده</option>
                <option value="private">خصوصی مدیران</option>
              </select>
            </label>
          </div>
          <label>
            نویسنده یا پژوهشگر
            <input
              onChange={(event) => setDraft({ ...draft, authorName: event.target.value })}
              value={draft.authorName}
            />
          </label>
          <label>
            خلاصه
            <textarea
              onChange={(event) =>
                setDraft({ ...draft, excerpt: event.target.value })
              }
              rows={3}
              value={draft.excerpt}
            />
          </label>
          <label>
            متن کامل
            <textarea
              className="content-editor"
              onChange={(event) =>
                setDraft({ ...draft, content: event.target.value })
              }
              rows={12}
              value={draft.content}
            />
          </label>
          <div className="form-row">
            <label>
              برچسب‌ها
              <input
                onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
                placeholder="تاریخ، شورای اتفاق، بهشتی"
                value={draft.tags}
              />
            </label>
            <label>
              یادداشت منبع و اصالت
              <input
                onChange={(event) => setDraft({ ...draft, sourceNote: event.target.value })}
                value={draft.sourceNote}
              />
            </label>
          </div>
          <div className="cover-control">
            <label className="upload-button">
              انتخاب تصویر شاخص
              <input
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadCover(file);
                }}
                type="file"
              />
            </label>
            {draft.coverImage && (
              <div className="cover-preview">
                <img src={draft.coverImage} alt="پیش‌نمایش تصویر شاخص" />
                <button
                  onClick={() => setDraft({ ...draft, coverImage: "" })}
                  type="button"
                >
                  حذف تصویر
                </button>
              </div>
            )}
          </div>
          <div className="cover-control">
            <label className="upload-button">
              بارگذاری PDF، سند یا رسانه
              <input
                accept="application/pdf,image/*,audio/*,video/mp4"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadAttachment(file);
                }}
                type="file"
              />
            </label>
            {draft.fileUrl && (
              <div>
                <strong>{draft.fileName || "فایل آرشیوی"}</strong>
                <button type="button" onClick={() => setDraft({ ...draft, fileUrl: "", fileName: "" })}>
                  حذف فایل
                </button>
              </div>
            )}
          </div>
          <div className="form-row">
            <label>
              یا نشانی مستقیم فایل/ویدیو
              <input
                dir="ltr"
                onChange={(event) => setDraft({ ...draft, fileUrl: event.target.value })}
                placeholder="https://..."
                type="url"
                value={draft.fileUrl}
              />
            </label>
            <label>
              نام فایل
              <input
                onChange={(event) => setDraft({ ...draft, fileName: event.target.value })}
                placeholder="نام نمایشی فایل"
                value={draft.fileName}
              />
            </label>
          </div>
          <label className="visibility-toggle">
            <input
              checked={draft.featured}
              onChange={(event) => setDraft({ ...draft, featured: event.target.checked })}
              type="checkbox"
            />
            نمایش به‌عنوان محتوای برجسته
          </label>
          <button className="button button-dark" disabled={saving} type="submit">
            {saving ? "در حال ذخیره..." : "ذخیرهٔ محتوا"}
          </button>
          {message && <p className="admin-message">{message}</p>}
        </form>

        <aside className="post-manager">
          <div className="manager-heading">
            <div>
              <p className="section-kicker">مدیریت نشرها</p>
              <h2>همهٔ نوشته‌ها</h2>
            </div>
            <span>{posts.length}</span>
          </div>
          {loading ? (
            <p className="manager-empty">در حال دریافت نوشته‌ها...</p>
          ) : posts.length === 0 ? (
            <p className="manager-empty">هنوز نوشته‌ای ایجاد نشده است.</p>
          ) : (
            <div className="managed-posts">
              {posts.map((post) => (
                <article key={post.id}>
                  <span
                    className={`status-chip ${post.status === "published" ? "published" : ""}`}
                  >
                    {{
                      draft: "پیش‌نویس",
                      review: "در انتظار بررسی",
                      approved: "تأییدشده",
                      published: "منتشرشده",
                      archived: "بایگانی‌شده",
                    }[post.status]}
                  </span>
                  <h3>{post.title}</h3>
                  <p>{post.category}</p>
                  <div>
                    <button onClick={() => editPost(post)} type="button">
                      ویرایش
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => void deletePost(post)}
                      type="button"
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
