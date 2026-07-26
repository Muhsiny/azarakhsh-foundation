import { getAdminUser, isAdminRequest } from "../../../admin-auth";
import { ensurePlatformSchema } from "../../../../db/platform";

type RuntimeEnv = { DB?: D1Database };

export async function GET() {
  if (!(await isAdminRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }
  await ensurePlatformSchema();
  const { env } = await import("cloudflare:workers");
  const db = (env as unknown as RuntimeEnv).DB!;
  const [content, members, requests] = await Promise.all([
    db.prepare(`SELECT COUNT(*) total,
      SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) published,
      SUM(CASE WHEN status='review' THEN 1 ELSE 0 END) review,
      COALESCE(SUM(views),0) views,
      COALESCE(SUM(downloads),0) downloads FROM posts`).first(),
    db.prepare(`SELECT COUNT(*) total FROM admin_users WHERE status='active'`).first(),
    db.prepare(`SELECT COUNT(*) total FROM membership_requests WHERE status='pending'`).first(),
  ]);
  return Response.json({ content, members, requests, user: await getAdminUser() });
}
