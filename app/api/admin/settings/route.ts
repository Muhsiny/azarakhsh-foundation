import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { ensurePlatformSchema } from "../../../../db/platform";
import { siteSettings } from "../../../../db/schema";
import { writeAuditLog } from "../../../admin-audit";
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

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "خطای ناشناخته در دیتابیس.";
}

export async function GET() {
  if (!(await canManageSiteRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  try {
    await ensurePlatformSchema();
    const db = await getDb();
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);
    const parsed = row?.data ? JSON.parse(row.data) : defaultSiteSettings;
    return Response.json({ settings: normalizeTypography(mergeSiteSettings(parsed)) });
  } catch (error) {
    console.error("Failed to load site settings", error);
    return Response.json(
      { error: `دریافت تنظیمات انجام نشد: ${errorMessage(error)}` },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await canManageSiteRequest())) {
    return Response.json({ error: "اجازهٔ دسترسی ندارید." }, { status: 403 });
  }

  try {
    const payload = (await request.json()) as { settings?: Partial<SiteSettings> };
    const settings = normalizeTypography(mergeSiteSettings(payload.settings));
    await ensurePlatformSchema();
    const db = await getDb();
    const now = new Date().toISOString();
    await db
      .insert(siteSettings)
      .values({ id: 1, data: JSON.stringify(settings), updatedAt: now })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { data: JSON.stringify(settings), updatedAt: now },
      });

    try {
      await writeAuditLog({
        action: "site.settings.update",
        entityType: "site",
        entityId: 1,
        details: {
          siteName: settings.identity.siteName,
          sectionOrder: settings.sectionOrder,
          visibility: settings.visibility,
        },
      });
    } catch (auditError) {
      console.error("Settings saved but audit logging failed", auditError);
    }

    return Response.json({ settings });
  } catch (error) {
    console.error("Failed to save site settings", error);
    return Response.json(
      { error: `ذخیرهٔ تنظیمات انجام نشد: ${errorMessage(error)}` },
      { status: 500 },
    );
  }
}
