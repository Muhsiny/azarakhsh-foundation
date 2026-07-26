import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { ensurePlatformSchema } from "../../../../../db/platform";
import { posts } from "../../../../../db/schema";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id)) return Response.json({ ok: false }, { status: 400 });
  await ensurePlatformSchema();
  const db = await getDb();
  await db.update(posts).set({ views: sql`${posts.views} + 1` }).where(eq(posts.id, id));
  return Response.json({ ok: true });
}
