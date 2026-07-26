import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { siteSettings } from "../../../../db/schema";
import { canManageSiteRequest } from "../../../admin-auth";
import {
  defaultSiteSettings,
  mergeSiteSettings,
  type SiteSettings,
} from "../../../site-settings";

const lotusFont = "'B Lotus', 'BLotus', 'Lotus', var(--font-lotus-fallback), 'B Mitra', 'BMitra', 'Mitra', var(--font-naskh), Tahoma, serif";

function normalizeTypography(settings: SiteSettings): SiteSettings {
  const current = settings.design.fontFamily || "";
  if (!current || /B Nazanin|BNazanin|Noto Naskh Arabic/i.test(current)) {
    settings.design.fontFamily = lotusFont;
  }
  settings.design.customCss = settings.design.customCss
    .replace(/\/\* AZARAKHSH_FONT_START \*\/[\s\S]*?\/\* AZARAKHSH_FONT_END \*\//g, "")
    .trim();
  return settings;
}

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
  return Response.json({ settings: normalizeTypography(mergeSiteSettings(parsed)) });
}

export async function PUT(request: Request) {
  if (!(await canManageSiteRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  const payload = (await request.json()) as { settings?: Partial<SiteSettings> };
  const settings = normalizeTypography(mergeSiteSettings(payload.settings));
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
