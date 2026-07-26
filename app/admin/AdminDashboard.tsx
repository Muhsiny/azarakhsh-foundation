"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import SiteStudio from "./SiteStudio";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string | null;
  status: "draft" | "published";
  updatedAt: string;
};

type Draft = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  status: "draft" | "published";
};

const blankDraft: Draft = {
  title: "",
  excerpt: "",
  content: "",
  category: "مقالات",
  coverImage: "",
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
      coverImage: post.coverImage ?? "",
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
                <option value="published">منتشرشده</option>
              </select>
            </label>
          </div>
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
          <button className="button button-dark" disabled={saving} type="submit">
            {saving
              ? "در حال ذخیره..."
              : draft.status === "published"
                ? "ذخیره و انتشار"
                : "ذخیرهٔ پیش‌نویس"}
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
                    {post.status === "published" ? "منتشرشده" : "پیش‌نویس"}
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
