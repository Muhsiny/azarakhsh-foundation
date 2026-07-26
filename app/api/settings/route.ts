import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { siteSettings } from "../../../db/schema";
import { defaultSiteSettings, mergeSiteSettings } from "../../site-settings";

const lotusFont = "'B Lotus', 'BLotus', 'Lotus', var(--font-lotus-fallback), 'B Mitra', 'BMitra', 'Mitra', var(--font-naskh), Tahoma, serif";

function normalizeTypography<T extends ReturnType<typeof mergeSiteSettings>>(settings: T): T {
  const current = settings.design.fontFamily || "";
  if (!current || /B Nazanin|BNazanin|Noto Naskh Arabic/i.test(current)) {
    settings.design.fontFamily = lotusFont;
  }
  return settings;
}

export async function GET() {
  try {
    const db = await getDb();
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);
    const parsed = row?.data ? JSON.parse(row.data) : defaultSiteSettings;
    return Response.json({ settings: normalizeTypography(mergeSiteSettings(parsed)) });
  } catch {
    return Response.json({ settings: normalizeTypography(mergeSiteSettings(defaultSiteSettings)) });
  }
}
