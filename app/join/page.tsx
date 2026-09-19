import type { Metadata } from "next";
import JoinClient from "./JoinClient";

export const metadata: Metadata = {
  title: "عضویت پژوهشی",
  description: "درخواست عضویت در شبکهٔ علمی و پژوهشی بنیاد آذرخش.",
  alternates: { canonical: "/join" },
  openGraph: {
    url: "/join",
    title: "عضویت پژوهشی | بنیاد آذرخش",
    description: "درخواست عضویت در شبکهٔ علمی و پژوهشی بنیاد آذرخش.",
  },
};

export default function JoinPage() {
  return <JoinClient />;
}
