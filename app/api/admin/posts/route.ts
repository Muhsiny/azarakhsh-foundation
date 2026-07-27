import { desc } from "drizzle-orm";
import { getDb } from "../../../../db";
import { ensurePlatformSchema } from "../../../../db/platform";
import { posts } from "../../../../db/schema";
import { writeAuditLog } from "../../../admin-audit";
import {
  canPublishRequest,
  getAdminUser,
  isAdminRequest,
} from "../../../admin-auth";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  await ensurePlatformSchema();
  const db = await getDb();
  const rows = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.updatedAt), desc(posts.id));
  return Response.json({ posts: rows });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  const payload = (await request.json()) as {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    coverImage?: string | null;
    fileUrl?: string | null;
    fileName?: string | null;
    contentType?: string;
    language?: string;
    visibility?: string;
    authorName?: string;
    sourceNote?: string;
    tags?: string;
    featured?: boolean;
    status?: "draft" | "review" | "approved" | "published" | "archived";
  };

  const title = payload.title?.trim() ?? "";
  if (!title) {
    return Response.json({ error: "عنوان الزامی است." }, { status: 400 });
  }

  const baseSlug = slugify(payload.slug || title) || `post-${Date.now()}`;
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const requestedStatus = payload.status ?? "draft";
  const validStatuses = ["draft", "review", "approved", "published", "archived"];
  const status =
    requestedStatus === "published" && !(await canPublishRequest())
      ? "review"
      : validStatuses.includes(requestedStatus)
        ? requestedStatus
        : "draft";
  const now = new Date().toISOString();

  await ensurePlatformSchema();
  const db = await getDb();
  const [post] = await db
    .insert(posts)
    .values({
      title,
      slug,
      excerpt: payload.excerpt?.trim() ?? "",
      content: payload.content?.trim() ?? "",
      category: payload.category?.trim() || "مقالات",
      contentType: payload.contentType?.trim() || "article",
      language: ["fa", "ps", "en"].includes(payload.language ?? "")
        ? payload.language!
        : "fa",
      visibility: ["public", "members", "private"].includes(
        payload.visibility ?? "",
      )
        ? payload.visibility!
        : "public",
      authorName:
        payload.authorName?.trim() ||
        (await getAdminUser())?.displayName ||
        "",
      coverImage: payload.coverImage?.trim() || null,
      fileUrl: payload.fileUrl?.trim() || null,
      fileName: payload.fileName?.trim() || null,
      sourceNote: payload.sourceNote?.trim() || "",
      tags: payload.tags?.trim() || "",
      featured: payload.featured ? 1 : 0,
      status,
      publishedAt: status === "published" ? now : null,
      updatedAt: now,
    })
    .returning();

  await writeAuditLog({
    action: "content.create",
    entityType: post.contentType || "post",
    entityId: post.id,
    details: { title: post.title, slug: post.slug, status: post.status },
  });

  return Response.json({ post }, { status: 201 });
}
