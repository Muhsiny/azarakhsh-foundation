import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { ensurePlatformSchema } from "../../../../../db/platform";
import { posts } from "../../../../../db/schema";
import {
  canManageSiteRequest,
  canPublishRequest,
  isAdminRequest,
} from "../../../../admin-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return Response.json({ error: "شناسه نامعتبر است." }, { status: 400 });
  }

  const payload = (await request.json()) as {
    title?: string;
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
    .update(posts)
    .set({
      title,
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
      authorName: payload.authorName?.trim() || "",
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
    .where(eq(posts.id, numericId))
    .returning();

  return Response.json({ post });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await canManageSiteRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return Response.json({ error: "شناسه نامعتبر است." }, { status: 400 });
  }

  await ensurePlatformSchema();
  const db = await getDb();
  await db.delete(posts).where(eq(posts.id, numericId));
  return Response.json({ ok: true });
}
