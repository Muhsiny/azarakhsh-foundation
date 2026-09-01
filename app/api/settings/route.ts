import { loadSiteSettings } from "../../load-site-settings";

export async function GET() {
  return Response.json({ settings: await loadSiteSettings() });
}
