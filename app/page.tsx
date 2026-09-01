import HomeClient from "./HomeClient";
import { loadSiteSettings } from "./load-site-settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await loadSiteSettings();
  return <HomeClient settings={settings} />;
}
