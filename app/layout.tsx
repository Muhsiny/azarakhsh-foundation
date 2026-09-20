import type { Metadata } from "next";
import { Noto_Naskh_Arabic, Vazirmatn } from "next/font/google";
import "./globals.css";

import "./redesign.css";
import "./final-pass.css";
import OfflineBootstrap from "./OfflineBootstrap";
import SiteEnhancer from "./SiteEnhancer";
import UniversalInlineEditorV2 from "./components/UniversalInlineEditorV2";
import LegacyInlineEditCompatibility from "./components/LegacyInlineEditCompatibility";
import PublicChrome from "./components/PublicChrome";
import { loadSiteSettings } from "./load-site-settings";
import { SITE_URL } from "./site-url";

const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-naskh",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "بنیاد آذرخش | آرشیف و پژوهش تاریخ افغانستان",
    template: "%s | بنیاد آذرخش",
  },
  description:
    "بنیاد آذرخش؛ نهاد مستقل برای گردآوری، حفاظت، ارزیابی و انتشار اسناد، روایت‌ها و پژوهش‌های تاریخ افغانستان.",
  keywords: [
    "بنیاد آذرخش",
    "شورای اتفاق اسلامی افغانستان",
    "آیت الله بهشتی",
    "تاریخ هزاره‌جات",
    "تاریخ افغانستان",
    "آرشیو تاریخی",
  ],
  authors: [{ name: "بنیاد آذرخش" }],
  creator: "بنیاد آذرخش",
  openGraph: {
    type: "website",
    locale: "fa_AF",
    siteName: "بنیاد آذرخش",
    title: "بنیاد آذرخش | آرشیف و پژوهش تاریخ افغانستان",
    description: "نهاد مستقل برای گردآوری، حفاظت و انتشار مسئولانهٔ اسناد و روایت‌های تاریخ افغانستان.",
    images: [{ url: "/og-card", width: 1200, height: 630, alt: "بنیاد آذرخش؛ پژوهش، سند و حافظهٔ تاریخی افغانستان" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "بنیاد آذرخش | آرشیف و پژوهش تاریخ افغانستان",
    description: "نهاد مستقل برای گردآوری، حفاظت و انتشار مسئولانهٔ اسناد و روایت‌های تاریخ افغانستان.",
    images: ["/og-card"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: { icon: "/app-icon.png", shortcut: "/app-icon.png", apple: "/app-icon.png" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "بنیاد آذرخش",
    statusBarStyle: "black-translucent",
  },
  applicationName: "بنیاد آذرخش",
  other: { "mobile-web-app-capable": "yes" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await loadSiteSettings();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ResearchOrganization",
    name: "بنیاد آذرخش",
    alternateName: "Azarakhsh Research Foundation",
    url: SITE_URL,
    logo: `${SITE_URL}/azarakhsh-logo-web.png`,
    description: "بنیاد مستقل برای پژوهش عمیق تاریخ افغانستان، گردآوری اسناد و بازتاب مسئولانهٔ حقیقت‌های تاریخی.",
    areaServed: "Afghanistan",
    knowsAbout: ["تاریخ افغانستان", "حکومت شورای اتفاق اسلامی افغانستان", "حضرت آیت‌الله العظمی بهشتی", "تاریخ هزاره‌جات", "تاریخ شفاهی"],
  };

  return (
    <html lang="fa" dir="rtl" className={`${naskh.variable} ${vazirmatn.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
        <OfflineBootstrap />
        <SiteEnhancer />
        <UniversalInlineEditorV2 />
        <LegacyInlineEditCompatibility />
        <PublicChrome settings={settings}>{children}</PublicChrome>
      </body>
    </html>
  );
}