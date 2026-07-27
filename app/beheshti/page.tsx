import type { Metadata } from "next";
import LeaderProfile from "./LeaderProfile";

export const metadata: Metadata = {
  title: "پروندهٔ رهبر ۱ | زندگی و زمانهٔ آیت‌الله سید علی بهشتی",
  description:
    "پروندهٔ پژوهشی و قابل ویرایش آیت‌الله سید علی بهشتی؛ شامل زندگی، رهبری، اندیشه، آثار، سخنرانی‌ها، اسناد و روایت‌ها.",
};

export default function BeheshtiPage() {
  return <LeaderProfile />;
}
