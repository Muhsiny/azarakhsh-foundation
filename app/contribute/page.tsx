import type { Metadata } from "next";
import ContributeClient from "./ContributeClient";

export const metadata: Metadata = {
  title: "ثبت خاطره، روایت و سند",
  description: "درگاه امن بنیاد آذرخش برای ثبت خاطرات، روایت‌های شفاهی و اسناد تاریخی جهت بررسی پژوهشی.",
  alternates: { canonical: "/contribute" },
  openGraph: {
    url: "/contribute",
    title: "ثبت خاطره و سند | بنیاد آذرخش",
    description: "ثبت خاطرات، روایت‌ها و اسناد تاریخی برای بررسی پژوهشی بنیاد آذرخش.",
  },
};

export default function ContributePage() {
  return <ContributeClient />;
}
