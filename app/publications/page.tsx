import type { Metadata } from "next";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../db";
import { ensurePlatformSchema } from "../../db/platform";
import { posts } from "../../db/schema";
import { getAdminUser } from "../admin-auth";
import PublicationsClient from "./PublicationsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "نشرها و گنجینهٔ پژوهش",
  description: "مقالات، کتاب‌ها، اسناد، زندگی‌نامه، تاریخ شفاهی، تصویر، صوت و ویدیو در گنجینهٔ پژوهشی بنیاد آذرخش.",
  alternates: { canonical: "/publications" },
  openGraph: {
    url: "/publications",
    title: "گنجینهٔ پژوهش | بنیاد آذرخش",
    description: "مقالات، کتاب‌ها، اسناد و منابع چندرسانه‌ای بنیاد آذرخش.",
  },
};

export default async function PublicationsPage() {
  await ensurePlatformSchema();
  const user = await getAdminUser();
  const visibility = user ? ["public", "members"] : ["public"];
  const db = await getDb();
  const rows = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.status, "published"),
        inArray(posts.visibility, visibility),
      ),
    )
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(200);

  return <PublicationsClient initialPosts={rows} />;
}
