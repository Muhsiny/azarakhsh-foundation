import type { Metadata } from "next";
import { and, desc, eq } from "drizzle-orm";
import { Noto_Naskh_Arabic, Vazirmatn } from "next/font/google";
import "./globals.css";

import "./public-system.css";
import "./apple-home.css";
import PublicChrome from "./components/PublicChrome";
import { siteSettings as settings } from "./site-settings";
import { SITE_URL } from "./site-url";
import { ensurePlatformSchema } from "../db/platform";
import { getDb } from "../db";
import { posts } from "../db/schema";

const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-naskh",
  display: "swap",
  weight: ["400", "600"],
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
  weight: ["400", "600", "700"],
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
    images: [{ url: "/og-card.png", width: 1200, height: 630, alt: "بنیاد آذرخش؛ پژوهش، سند و حافظهٔ تاریخی افغانستان" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "بنیاد آذرخش | آرشیف و پژوهش تاریخ افغانستان",
    description: "نهاد مستقل برای گردآوری، حفاظت و انتشار مسئولانهٔ اسناد و روایت‌های تاریخ افغانستان.",
    images: ["/og-card.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/app-icon.png",
  },
  applicationName: "بنیاد آذرخش",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let extraPages: Array<{ slug: string; title: string }> = [];
  try {
    await ensurePlatformSchema();
    const db = await getDb();
    extraPages = await db
      .select({ slug: posts.slug, title: posts.title })
      .from(posts)
      .where(and(
        eq(posts.contentType, "page"),
        eq(posts.status, "published"),
        eq(posts.visibility, "public"),
        eq(posts.featured, 1),
      ))
      .orderBy(desc(posts.updatedAt))
      .limit(6);
  } catch {
    extraPages = [];
  }
  const chromeSettings = {
    identity: {
      siteName: settings.identity.siteName,
      logoUrl: settings.identity.logoUrl,
    },
    colors: {
      primary: settings.colors.primary,
      dark: settings.colors.dark,
      gold: settings.colors.gold,
      paper: settings.colors.paper,
    },
    design: {
      contentWidth: settings.design.contentWidth,
    },
    footer: {
      mission: settings.footer.mission,
      copyright: settings.footer.copyright,
    },
    contact: {
      email: settings.contact.email,
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ResearchOrganization",
    name: "بنیاد آذرخش",
    alternateName: "Azarakhsh Research Foundation",
    url: SITE_URL,
    logo: `${SITE_URL}/azarakhsh-logo-transparent-web.png`,
    description: "بنیاد مستقل برای پژوهش عمیق تاریخ افغانستان، گردآوری اسناد و بازتاب مسئولانهٔ حقیقت‌های تاریخی.",
    areaServed: "Afghanistan",
    knowsAbout: ["تاریخ افغانستان", "حکومت شورای اتفاق اسلامی افغانستان", "حضرت آیت‌الله العظمی بهشتی", "تاریخ هزاره‌جات", "تاریخ شفاهی"],
  };

  return (
    <html lang="fa" dir="rtl" className={`${naskh.variable} ${vazirmatn.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
        <PublicChrome settings={chromeSettings} extraPages={extraPages}>{children}</PublicChrome>
      </body>
    </html>
  );
}