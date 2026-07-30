import { getDb } from "../../../../db";
import { ensurePlatformSchema } from "../../../../db/platform";
import { posts, siteSettings } from "../../../../db/schema";
import { canManageSiteRequest, getAdminUser } from "../../../admin-auth";

type RuntimeEnv = {
  DB?: D1Database;
  MEDIA?: KVNamespace;
};

export async function GET() {
  if (!(await canManageSiteRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  const user = await getAdminUser();
  const checks = {
    owner: user?.role === "owner" || user?.role === "admin",
    database: false,
    posts: false,
    settings: false,
    media: false,
  };
  const errors: string[] = [];

  try {
    const { env } = await import("cloudflare:workers");
    const runtime = env as unknown as RuntimeEnv;
    checks.database = Boolean(runtime.DB);
    checks.media = Boolean(runtime.MEDIA);

    if (!runtime.DB) {
      errors.push("اتصال D1 به Worker موجود نیست.");
    } else {
      await ensurePlatformSchema();
      const db = await getDb();
      await db.select({ id: posts.id }).from(posts).limit(1);
      checks.posts = true;
      await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
      checks.settings = true;
    }

    if (!runtime.MEDIA) {
      errors.push("اتصال MEDIA به Worker موجود نیست.");
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "خطای ناشناختهٔ زیرساخت.");
  }

  const ok = Object.values(checks).every(Boolean);
  return Response.json({ ok, checks, errors });
}
