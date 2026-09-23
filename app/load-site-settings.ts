import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { siteSettings } from "../db/schema";
import { defaultSiteSettings, mergeSiteSettings } from "./site-settings";

export async function loadSiteSettings() {
  try {
    const db = await getDb();
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);
    const parsed = row?.data ? JSON.parse(row.data) : defaultSiteSettings;
    return mergeSiteSettings(parsed);
  } catch {
    return mergeSiteSettings(defaultSiteSettings);
  }
}
