import { and, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "../db";
import { ensurePlatformSchema } from "../db/platform";
import { posts } from "../db/schema";
import { getAdminUser } from "./admin-auth";

export async function readableVisibilities() {
  const user = await getAdminUser();
  return {
    user,
    visibility: user ? (["public", "members"] as const) : (["public"] as const),
  };
}

export async function loadReadablePublicationById(id: number) {
  await ensurePlatformSchema();
  const { user, visibility } = await readableVisibilities();
  const db = await getDb();
  const [post] = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.id, id),
        eq(posts.status, "published"),
        inArray(posts.visibility, [...visibility]),
        ne(posts.contentType, "page"),
      ),
    )
    .limit(1);
  return { post: post ?? null, user };
}

export async function loadReadablePublicationBySlug(slug: string) {
  await ensurePlatformSchema();
  const { user, visibility } = await readableVisibilities();
  const db = await getDb();
  const [post] = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.slug, slug),
        eq(posts.status, "published"),
        inArray(posts.visibility, [...visibility]),
        ne(posts.contentType, "page"),
      ),
    )
    .limit(1);
  return { post: post ?? null, user };
}

export async function loadPublicManagedPage(slug: string) {
  await ensurePlatformSchema();
  const db = await getDb();
  const [page] = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.slug, slug),
        eq(posts.contentType, "page"),
        eq(posts.status, "published"),
        eq(posts.visibility, "public"),
      ),
    )
    .limit(1);
  return page ?? null;
}
