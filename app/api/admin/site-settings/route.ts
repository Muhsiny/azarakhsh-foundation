import { getSiteSettings, saveSiteSettings, type SiteSettings } from "../../../site-settings";
import { isOwnerRequest } from "../../../admin-auth";
import { isSameOriginMutation } from "../../../security";

export async function GET() {
  if (!(await isOwnerRequest())) {
    return Response.json({ error: "این بخش فقط برای مالک بنیاد است." }, { status: 403 });
  }
  return Response.json({ settings: await getSiteSettings() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  }
  if (!(await isOwnerRequest())) {
    return Response.json({ error: "این بخش فقط برای مالک بنیاد است." }, { status: 403 });
  }

  try {
    const payload = (await request.json()) as { settings?: Partial<SiteSettings> };
    const settings = await saveSiteSettings(payload.settings ?? {});
    return Response.json({ settings });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "ذخیرهٔ تنظیمات انجام نشد." },
      { status: 500 },
    );
  }
}
