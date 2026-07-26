import type { Metadata } from "next";
import "./globals.css";
import OfflineBootstrap from "./OfflineBootstrap";

const siteUrl = "https://azarakhsh-foundation.zulfiqar14.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "بنیاد آذرخش | آذرخش؛ قاتل تاریکی و سایه‌یی سایه!",
    template: "%s | بنیاد آذرخش",
  },
  description:
    "بنیاد آذرخش؛ مرجع گردآوری اسناد، روایت‌ها و پژوهش‌های مربوط به حکومت شورای اتفاق اسلامی افغانستان و حضرت آیت‌الله العظمی بهشتی(ره).",
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_AF",
    url: "/",
    siteName: "بنیاد آذرخش",
    title: "بنیاد آذرخش",
    description: "آذرخش؛ قاتل تاریکی و سایه‌یی سایه!",
    images: [
      {
        url: "/azarakhsh-logo-web.png",
        width: 1536,
        height: 1024,
        alt: "نشان بنیاد آذرخش",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "بنیاد آذرخش",
    description: "آذرخش؛ قاتل تاریکی و سایه‌یی سایه!",
    images: ["/azarakhsh-logo-web.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/app-icon.png",
    shortcut: "/app-icon.png",
  },
  manifest: "/manifest.webmanifest",
  other: {
    "codex-preview": "development",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ResearchOrganization",
    name: "بنیاد آذرخش",
    alternateName: "Azarakhsh Research Foundation",
    url: siteUrl,
    logo: `${siteUrl}/azarakhsh-logo-web.png`,
    description:
      "بنیاد مستقل برای پژوهش عمیق تاریخ افغانستان، گردآوری اسناد و بازتاب مسئولانهٔ حقیقت‌های تاریخی.",
    areaServed: "Afghanistan",
    knowsAbout: [
      "تاریخ افغانستان",
      "حکومت شورای اتفاق اسلامی افغانستان",
      "حضرت آیت‌الله العظمی بهشتی",
      "تاریخ هزاره‌جات",
      "تاریخ شفاهی",
    ],
  };

  return (
    <html lang="fa" dir="rtl">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
        <OfflineBootstrap />
        {children}
      </body>
    </html>
  );
}
