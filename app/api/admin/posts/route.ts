import { desc } from "drizzle-orm";
import { getDb } from "../../../../db";
import { posts } from "../../../../db/schema";
import { isAdminRequest } from "../../../admin-auth";

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
    status?: "draft" | "published";
  };

  const title = payload.title?.trim() ?? "";
  if (!title) {
    return Response.json({ error: "عنوان الزامی است." }, { status: 400 });
  }

  const baseSlug = slugify(payload.slug || title) || `post-${Date.now()}`;
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const status = payload.status === "published" ? "published" : "draft";
  const now = new Date().toISOString();

  const db = await getDb();
  const [post] = await db
    .insert(posts)
    .values({
      title,
      slug,
      excerpt: payload.excerpt?.trim() ?? "",
      content: payload.content?.trim() ?? "",
      category: payload.category?.trim() || "مقالات",
      coverImage: payload.coverImage?.trim() || null,
      status,
      publishedAt: status === "published" ? now : null,
      updatedAt: now,
    })
    .returning();

  return Response.json({ post }, { status: 201 });
}
