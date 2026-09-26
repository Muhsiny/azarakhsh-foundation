import { ensurePlatformSchema } from "../../../db/platform";
import { getDb } from "../../../db";

export async function GET() {
  try {
    await ensurePlatformSchema();
    const db = await getDb();
    const schema = await db.run(
      "SELECT version, updated_at FROM platform_schema WHERE id = 1 LIMIT 1"
    );
    const counts = await db.run(
      "SELECT COUNT(*) AS total, SUM(CASE WHEN article_no IS NOT NULL THEN 1 ELSE 0 END) AS numbered FROM posts"
    );
    return Response.json({ ok: true, schema: schema.rows?.[0] ?? null, counts: counts.rows?.[0] ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
