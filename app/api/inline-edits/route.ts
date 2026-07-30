import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensurePlatformSchema } from "../../../db/platform";
import { siteSettings } from "../../../db/schema";
import { canManageSiteRequest } from "../../admin-auth";
import { defaultSiteSettings, mergeSiteSettings } from "../../site-settings";

async function readSettings() {
  await ensurePlatformSchema();
  const db = await getDb();
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);
  const parsed = row?.data ? JSON.parse(row.data) : defaultSiteSettings;
  return { db, settings: mergeSiteSettings(parsed) };
}

export async function GET() {
  try {
    const { settings } = await readSettings();
    return Response.json({ overrides: settings.inlineOverrides || {} });
  } catch {
    return Response.json({ overrides: {} });
  }
}

export async function PUT(request: Request) {
  if (!(await canManageSiteRequest())) {
    return Response.json({ error: "اجازهٔ ویرایش ندارید." }, { status: 403 });
  }

  try {
    const payload = (await request.json()) as { key?: string; value?: string };
    const key = payload.key?.trim() || "";
    const value = payload.value?.trim() || "";
    if (!key || key.length > 240) {
      return Response.json({ error: "شناسهٔ بخش معتبر نیست." }, { status: 400 });
    }
    if (value.length > 20000) {
      return Response.json({ error: "متن بیش از حد طولانی است." }, { status: 400 });
    }

    const { db, settings } = await readSettings();
    settings.inlineOverrides = { ...(settings.inlineOverrides || {}), [key]: value };
    const now = new Date().toISOString();
    await db
      .insert(siteSettings)
      .values({ id: 1, data: JSON.stringify(settings), updatedAt: now })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { data: JSON.stringify(settings), updatedAt: now },
      });

    return Response.json({ ok: true, key, value });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "ذخیره انجام نشد." },
      { status: 500 },
    );
  }
}
