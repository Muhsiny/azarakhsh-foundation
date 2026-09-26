import type { Metadata } from "next";
import LeaderProfile from "./LeaderProfile";
import { getSiteSettings } from "../site-settings";

export const metadata: Metadata = {
  title: "پروندهٔ رهبر ۱ | زندگی و زمانهٔ آیت‌الله سید علی بهشتی",
  description: "پروندهٔ مقاله‌های پژوهشیِ شماره‌دار دربارهٔ آیت‌الله سید علی بهشتی.",
  alternates: { canonical: "/beheshti" },
  openGraph: { url: "/beheshti", title: "پروندهٔ آیت‌الله سید علی بهشتی", description: "مجموعهٔ مقاله‌های پژوهشیِ شماره‌دار بنیاد آذرخش." },
};

export default async function BeheshtiPage() {
  const settings = await getSiteSettings();
  return (
    <LeaderProfile
      imageUrl={settings.media.leaderImageUrl}
      imageAlt={settings.media.leaderImageAlt}
    />
  );
}
