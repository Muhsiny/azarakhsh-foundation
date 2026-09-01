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

function overrideHtml(settings: SiteSettings, key: string) {
  const raw = settings.inlineOverrides[key];
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw) as { html?: string };
    return parsed.html || "";
  } catch {
    return raw;
  }
}

function plainText(html: string) {
  return html
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function applyHomepageOverrides(settings: SiteSettings) {
  const text = (key: string, fallback: string) => plainText(overrideHtml(settings, key)) || fallback;

  settings.hero.eyebrow = text("/:top:p:0", settings.hero.eyebrow);
  settings.hero.description = text("/:top:p:1", settings.hero.description);
  settings.hero.principle = text("/:top:p:2", settings.hero.principle);
  settings.council.kicker = text("/:council:p:0", settings.council.kicker);
  settings.council.title = text("/:council:h2:0", settings.council.title);
  settings.council.text = text("/:council:p:1", settings.council.text);
  settings.leader.title = text("/:beheshti:h2:0", settings.leader.title);
  settings.leader.lead = text("/:beheshti:p:1", settings.leader.lead);
  settings.mission.title = text("/:mission:h2:0", settings.mission.title);
  settings.mission.text = text("/:mission:p:1", settings.mission.text);
  settings.mission.cards[0].title = text("/:mission:h3:0", settings.mission.cards[0].title);
  settings.contribute.title = text("/:contribute:h2:0", settings.contribute.title);
  settings.contribute.text = text("/:contribute:p:1", settings.contribute.text);
  settings.archive.title = text("/:archive:h2:0", settings.archive.title);
  settings.standards.title = text("/:standards:h2:0", settings.standards.title);
  settings.standards.text = text("/:standards:p:1", settings.standards.text);

  const quoteHtml = overrideHtml(settings, "/:beheshti:blockquote:0");
  if (quoteHtml) {
    const source = quoteHtml.match(/<cite[^>]*>([\s\S]*?)<\/cite>/i)?.[1];
    settings.leader.quoteSource = source ? plainText(source) : settings.leader.quoteSource;
    settings.leader.quote = plainText(quoteHtml.replace(/<cite[^>]*>[\s\S]*?<\/cite>/i, "")) || settings.leader.quote;
  }

  ["/:beheshti:p:2", "/:beheshti:p:3", "/:beheshti:p:4"].forEach((key, index) => {
    const value = text(key, "");
    if (!value) return;
    const separator = value.indexOf(":");
    if (separator > 0) {
      settings.leader.inquiries[index].title = value.slice(0, separator).trim();
      settings.leader.inquiries[index].text = value.slice(separator + 1).trim();
    }
  });

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
    return applyHomepageOverrides(normalizeTypography(mergeSiteSettings(parsed)));
  } catch {
    return applyHomepageOverrides(normalizeTypography(mergeSiteSettings(defaultSiteSettings)));
  }
}
