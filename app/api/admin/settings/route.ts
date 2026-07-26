import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { siteSettings } from "../../../../db/schema";
import { canManageSiteRequest } from "../../../admin-auth";
import {
  defaultSiteSettings,
  mergeSiteSettings,
  type SiteSettings,
} from "../../../site-settings";

export async function GET() {
  if (!(await canManageSiteRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }
  const db = await getDb();
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);
  const parsed = row?.data ? JSON.parse(row.data) : defaultSiteSettings;
  return Response.json({ settings: mergeSiteSettings(parsed) });
}

export async function PUT(request: Request) {
  if (!(await canManageSiteRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  const payload = (await request.json()) as { settings?: Partial<SiteSettings> };
  const settings = mergeSiteSettings(payload.settings);
  const db = await getDb();
  const now = new Date().toISOString();
  await db
    .insert(siteSettings)
    .values({ id: 1, data: JSON.stringify(settings), updatedAt: now })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: { data: JSON.stringify(settings), updatedAt: now },
    });
  return Response.json({ settings });
}
