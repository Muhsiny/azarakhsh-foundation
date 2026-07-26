import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { ensurePlatformSchema } from "../../../../../db/platform";
import { posts } from "../../../../../db/schema";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });
  await ensurePlatformSchema();
  const db = await getDb();
  const [item] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!item?.fileUrl) return new Response("Not found", { status: 404 });
  await db.update(posts).set({ downloads: sql`${posts.downloads} + 1` }).where(eq(posts.id, id));
  return Response.redirect(new URL(item.fileUrl, request.url), 302);
}
