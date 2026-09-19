import type { Metadata } from "next";
import LeaderProfile from "./LeaderProfile";

export const metadata: Metadata = {
  title: "پروندهٔ رهبر ۱ | زندگی و زمانهٔ آیت‌الله سید علی بهشتی",
  description: "پروندهٔ پژوهشی آیت‌الله سید علی بهشتی؛ شامل زندگی، رهبری، اندیشه، آثار، سخنرانی‌ها، اسناد و روایت‌ها.",
  alternates: { canonical: "/beheshti" },
  openGraph: { url: "/beheshti", title: "پروندهٔ آیت‌الله سید علی بهشتی", description: "زندگی، اندیشه، رهبری، آثار، اسناد و روایت‌های مربوط به آیت‌الله سید علی بهشتی." },
};

export default function BeheshtiPage() {
  return <LeaderProfile />;
}
