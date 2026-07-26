import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { posts } from "../../../db/schema";

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(100);

    return Response.json({ posts: rows });
  } catch {
    return Response.json({ posts: [] });
  }
}
