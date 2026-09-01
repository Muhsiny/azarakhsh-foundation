import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { siteSettings } from "../db/schema";
import { defaultSiteSettings, mergeSiteSettings, type SiteSettings } from "./site-settings";

const lotusFont = "'B Lotus', 'BLotus', 'Lotus', var(--font-lotus-fallback), 'B Mitra', 'BMitra', 'Mitra', var(--font-naskh), Tahoma, serif";

function normalizeTypography(settings: SiteSettings) {
  const current = settings.design.fontFamily || "";
  if (!current || /B Nazanin|BNazanin|Noto Naskh Arabic/i.test(current)) {
    settings.design.fontFamily = lotusFont;
  }
  return settings;
}

export async function loadSiteSettings() {
  try {
    const db = await getDb();
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);
    const parsed = row?.data ? JSON.parse(row.data) : defaultSiteSettings;
    return normalizeTypography(mergeSiteSettings(parsed));
  } catch {
    return normalizeTypography(mergeSiteSettings(defaultSiteSettings));
  }
}
