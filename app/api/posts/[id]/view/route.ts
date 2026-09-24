import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { posts } from "../../../../../db/schema";
import { loadReadablePublicationById } from "../../../../content-access";
import { consumeRateLimit, isSameOriginMutation } from "../../../../security";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ ok: false }, { status: 403 });
  }

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const { post } = await loadReadablePublicationById(id);
  if (!post) return Response.json({ ok: false }, { status: 404 });

  const limit = await consumeRateLimit(request, "post-view", 1, 6 * 60 * 60, String(id));
  if (!limit.allowed) {
    return Response.json({ ok: true, counted: false }, { headers: { "Cache-Control": "no-store" } });
  }

  const db = await getDb();
  await db
    .update(posts)
    .set({ views: sql`${posts.views} + 1` })
    .where(eq(posts.id, id));

  return Response.json(
    { ok: true, counted: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
