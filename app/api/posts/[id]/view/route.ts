import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { ensurePlatformSchema } from "../../../../../db/platform";
import { posts } from "../../../../../db/schema";
import { consumeRateLimit, isSameOriginMutation } from "../../../../security";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ ok: false }, { status: 403 });
  }

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const limit = await consumeRateLimit(request, "post-view", 8, 60 * 60, String(id));
  if (!limit.allowed) {
    return Response.json({ ok: true, counted: false }, { status: 200 });
  }

  await ensurePlatformSchema();
  const db = await getDb();
  const result = await db
    .update(posts)
    .set({ views: sql`${posts.views} + 1` })
    .where(
      and(
        eq(posts.id, id),
        eq(posts.status, "published"),
        eq(posts.visibility, "public"),
      ),
    );

  return Response.json(
    { ok: true, counted: Boolean(result.rowsAffected) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
