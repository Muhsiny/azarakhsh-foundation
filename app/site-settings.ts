import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { ensurePlatformSchema } from "../db/platform";
import { siteSettingsStore } from "../db/schema";

export type SiteSettings = {
  identity: {
    siteName: string;
    logoUrl: string;
    tagline: string;
  };
  media: {
    leaderImageUrl: string;
    councilEmblemUrl: string;
    leaderImageAlt: string;
    councilEmblemAlt: string;
    councilEmblemCaption: string;
    bismillahUrl: string;
    heroFlagUrl: string;
  };
  council: {
    text: string;
  };
  footer: {
    mission: string;
    copyright: string;
    mottoKicker: string;
    mottoTitle: string;
    mottoText: string;
  };
  navigation: {
    primary: Array<{ href: string; label: string; enabled: boolean }>;
    more: Array<{ href: string; label: string; enabled: boolean }>;
    footer: Array<{ href: string; label: string; enabled: boolean }>;
  };
  contact: {
    email: string;
  };
  colors: {
    primary: string;
    dark: string;
    gold: string;
    paper: string;
  };
  design: {
    contentWidth: number;
  };
  home: {
    eyebrow: string;
    title: string;
    emphasis: string;
    description: string;
    archiveButton: string;
    standardsButton: string;
    leaderKicker: string;
    leaderTitle: string;
    leaderText: string;
    councilKicker: string;
    councilTitle: string;
    councilText: string;
    oralKicker: string;
    oralTitle: string;
    oralText: string;
    contributeKicker: string;
    contributeTitle: string;
    contributeText: string;
  };
};

export const siteSettings: Readonly<SiteSettings> = {
  identity: {
    siteName: "بنیاد آذرخش",
    logoUrl: "/azarakhsh-logo-transparent-web.png",
    tagline: "پژوهش، اسناد و حافظهٔ تاریخی",
  },
  media: {
    leaderImageUrl: "/media/beheshti-original.webp",
    councilEmblemUrl: "/media/council-emblem-color.webp",
    leaderImageAlt: "آیت‌الله سید علی بهشتی",
    councilEmblemAlt: "نشان تاریخی حکومت شورای اتفاق اسلامی افغانستان",
    councilEmblemCaption: "نشان رنگی شورای اتفاق اسلامی افغانستان، برگرفته از نسخهٔ تصویری آرشیف.",
    bismillahUrl: "/bismillah-transparent.svg",
    heroFlagUrl: "/media/council-flag-hq.svg",
  },
  council: {
    text: "پروندهٔ شورای اتفاق شکل‌گیری این نهاد در ورس در سال ۱۳۵۸، ساختار اداری، حکومت‌داری، قلمرو نفوذ و محدودیت‌های آن را با مقایسهٔ اسناد داخلی و پژوهش‌های دانشگاهی بررسی می‌کند.",
  },
  footer: {
    mission: "بنیاد مستقل پژوهش، اسناد و حافظهٔ تاریخی افغانستان",
    copyright: "تمام حقوق محفوظ است.",
    mottoKicker: "تاریخ",
    mottoTitle: "برای فهم آینده",
    mottoText: "منبع را حفظ می‌کنیم، روایت را می‌سنجیم و مرز میان سند و تفسیر را روشن نگه می‌داریم.",
  },
  contact: {
    email: "info@azarakhsh.foundation",
  },
  colors: {
    primary: "#173f33",
    dark: "#0b231d",
    gold: "#c7a45b",
    paper: "#f8f6f0",
  },
  design: {
    contentWidth: 1180,
  },
  home: {
    eyebrow: "بنیاد پژوهشی تاریخی آذرخش",
    title: "تاریخ، آنگاه روشن می‌شود",
    emphasis: "که اسناد سخن بگویند.",
    description: "نهاد مستقل پژوهشی برای گردآوری، سنجش و بازخوانی مستند تاریخ افغانستان؛ با تفکیک روشن میان سند، روایت، خاطره و تفسیر.",
    archiveButton: "کاوش در آرشیف",
    standardsButton: "معیارهای پژوهش",
    leaderKicker: "پروندهٔ زندگی و زمانه",
    leaderTitle: "آیت‌الله سید علی بهشتی",
    leaderText: "پروندهٔ مقاله‌های پژوهشیِ شماره‌دار.",
    councilKicker: "پروندهٔ محوری / ۰۱",
    councilTitle: "حکومت شورای اتفاق اسلامی افغانستان",
    councilText: "پروندهٔ مقاله‌های پژوهشیِ شماره‌دار.",
    oralKicker: "حافظهٔ زنده",
    oralTitle: "تاریخ شفاهی",
    oralText: "خاطرات و روایت‌های شاهدان، با ثبت زمینهٔ زمانی، موقعیت راوی و امکان مقایسه با اسناد و روایت‌های دیگر.",
    contributeKicker: "حافظهٔ جمعی",
    contributeTitle: "سند، تصویر یا خاطره‌ای در اختیار دارید؟",
    contributeText: "منشأ، زمینه و حقوق استفاده از هر منبع پیش از نشر بررسی می‌شود.",
  },
};

function mergeSettings(input: Partial<SiteSettings> | null | undefined): SiteSettings {
  const value = input ?? {};
  return {
    identity: { ...siteSettings.identity, ...(value.identity ?? {}) },
    media: { ...siteSettings.media, ...(value.media ?? {}) },
    council: { ...siteSettings.council, ...(value.council ?? {}) },
    footer: { ...siteSettings.footer, ...(value.footer ?? {}) },
    navigation: {
      primary: value.navigation?.primary ?? siteSettings.navigation.primary,
      more: value.navigation?.more ?? siteSettings.navigation.more,
      footer: value.navigation?.footer ?? siteSettings.navigation.footer,
    },
    contact: { ...siteSettings.contact, ...(value.contact ?? {}) },
    colors: { ...siteSettings.colors, ...(value.colors ?? {}) },
    design: { ...siteSettings.design, ...(value.design ?? {}) },
    home: { ...siteSettings.home, ...(value.home ?? {}) },
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    await ensurePlatformSchema();
    const db = await getDb();
    const [row] = await db
      .select()
      .from(siteSettingsStore)
      .where(eq(siteSettingsStore.key, "global"))
      .limit(1);
    if (!row?.value) return mergeSettings(null);
    return mergeSettings(JSON.parse(row.value) as Partial<SiteSettings>);
  } catch {
    return mergeSettings(null);
  }
}

export async function saveSiteSettings(input: Partial<SiteSettings>) {
  await ensurePlatformSchema();
  const db = await getDb();
  const settings = mergeSettings(input);
  const value = JSON.stringify(settings);
  await db
    .insert(siteSettingsStore)
    .values({ key: "global", value, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: siteSettingsStore.key,
      set: { value, updatedAt: new Date().toISOString() },
    });
  return settings;
}
