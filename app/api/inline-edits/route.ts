import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensurePlatformSchema } from "../../../db/platform";
import { siteSettings } from "../../../db/schema";
import { canManageSiteRequest } from "../../admin-auth";
import { defaultSiteSettings, mergeSiteSettings } from "../../site-settings";


type PublicAssetRecord = Record<string, unknown>;

function isPublicAsset(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const asset = value as PublicAssetRecord;
  if ("visibility" in asset && asset.visibility !== "public") return false;
  if ("status" in asset && asset.status !== "published") return false;
  if (asset.type === "image") return true;
  return (
    asset.status === "published" &&
    asset.visibility === "public" &&
    typeof asset.publicSlug === "string" &&
    Boolean(asset.publicSlug)
  );
}

function sanitizeBlock(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const block = value as Record<string, unknown>;
  if (!Array.isArray(block.assets)) return block;
  return { ...block, assets: block.assets.filter(isPublicAsset) };
}

function sanitizeOverride(raw: string) {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return JSON.stringify(
        parsed.map((item) => {
          if (!item || typeof item !== "object" || Array.isArray(item)) return item;
          const section = item as Record<string, unknown>;
          return { ...section, body: sanitizeBlock(section.body) };
        }),
      );
    }
    return JSON.stringify(sanitizeBlock(parsed));
  } catch {
    return raw;
  }
}

function publicOverrides(overrides: Record<string, string> | undefined) {
  return Object.fromEntries(
    Object.entries(overrides || {}).map(([key, value]) => [key, sanitizeOverride(value)]),
  );
}

async function readSettings() {
  await ensurePlatformSchema();
  const db = await getDb();
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  const parsed = row?.data ? JSON.parse(row.data) : defaultSiteSettings;
  return { db, settings: mergeSiteSettings(parsed) };
}

export async function GET() {
  try {
    const { settings } = await readSettings();
    return Response.json(
      { overrides: publicOverrides(settings.inlineOverrides) },
      { headers: { "Cache-Control": "no-store" } },
    );
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
    if (value.length > 250000) {
      return Response.json({ error: "محتوا و پیوست‌های این بخش بیش از حد بزرگ است." }, { status: 400 });
    }

    const { db, settings } = await readSettings();
    settings.inlineOverrides = { ...(settings.inlineOverrides || {}), [key]: value };
    const now = new Date().toISOString();
    await db.insert(siteSettings).values({ id: 1, data: JSON.stringify(settings), updatedAt: now }).onConflictDoUpdate({
      target: siteSettings.id,
      set: { data: JSON.stringify(settings), updatedAt: now },
    });

    return Response.json({ ok: true, key, value });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "ذخیره انجام نشد." }, { status: 500 });
  }
}
