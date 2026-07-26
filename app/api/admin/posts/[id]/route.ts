import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { posts } from "../../../../../db/schema";
import { isAdminRequest } from "../../../../admin-auth";

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
    status?: "draft" | "published";
  };
  const title = payload.title?.trim() ?? "";
  if (!title) {
    return Response.json({ error: "عنوان الزامی است." }, { status: 400 });
  }

  const status = payload.status === "published" ? "published" : "draft";
  const now = new Date().toISOString();
  const db = await getDb();
  const [post] = await db
    .update(posts)
    .set({
      title,
      excerpt: payload.excerpt?.trim() ?? "",
      content: payload.content?.trim() ?? "",
      category: payload.category?.trim() || "مقالات",
      coverImage: payload.coverImage?.trim() || null,
      status,
      publishedAt: status === "published" ? now : null,
      updatedAt: now,
    })
    .where(eq(posts.id, numericId))
    .returning();

  return Response.json({ post });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return Response.json({ error: "شناسه نامعتبر است." }, { status: 400 });
  }

  const db = await getDb();
  await db.delete(posts).where(eq(posts.id, numericId));
  return Response.json({ ok: true });
}
