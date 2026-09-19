import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { loadSiteSettings } from "./load-site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default async function Home() {
  const settings = await loadSiteSettings();
  return <HomeClient settings={settings} />;
}
