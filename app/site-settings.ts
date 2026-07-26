export type SiteSettings = {
  identity: {
    siteName: string;
    tagline: string;
    logoUrl: string;
  };
  navigation: {
    about: string;
    council: string;
    leader: string;
    archive: string;
    publications: string;
    contribute: string;
    cta: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    highlightedWord: string;
    description: string;
    primaryButton: string;
    secondaryButton: string;
  };
  mission: {
    kicker: string;
    title: string;
    text: string;
  };
  council: {
    kicker: string;
    title: string;
    text: string;
  };
  leader: {
    kicker: string;
    title: string;
    lead: string;
    quote: string;
  };
  footer: {
    mission: string;
    copyright: string;
  };
  colors: {
    primary: string;
    dark: string;
    gold: string;
    paper: string;
  };
  design: {
    fontFamily: string;
    heroAlignment: "right" | "center";
    density: "compact" | "balanced" | "spacious";
    customCss: string;
  };
  visibility: {
    mission: boolean;
    council: boolean;
    timeline: boolean;
    leader: boolean;
    archive: boolean;
    method: boolean;
    contribute: boolean;
  };
};

export const defaultSiteSettings: SiteSettings = {
  identity: {
    siteName: "بنیاد آذرخش",
    tagline: "آذرخش؛ قاتل تاریکی و سایه‌یی سایه!",
    logoUrl: "/azarakhsh-logo-transparent-web.png",
  },
  navigation: {
    about: "دربارهٔ بنیاد",
    council: "شورای اتفاق",
    leader: "آیت‌الله بهشتی",
    archive: "آرشیو",
    publications: "نشرها",
    contribute: "همکاری پژوهشی",
    cta: "تازه‌ترین نشرها",
  },
  hero: {
    eyebrow: "بنیاد مستقل تاریخ‌پژوهی افغانستان",
    title: "تاریخ، آنگاه روشن می‌شود که اسناد سخن بگویند.",
    highlightedWord: "اسناد",
    description:
      "بنیاد آذرخش برای گردآوری، سنجش و بازتاب حقیقت‌های تاریخی افغانستان شکل گرفته است؛ با تمرکز ویژه بر حکومت شورای اتفاق اسلامی افغانستان و میراث فکری و سیاسی حضرت آیت‌الله العظمی بهشتی(ره).",
    primaryButton: "مطالعهٔ پروندهٔ محوری",
    secondaryButton: "روایت یا سندی دارید؟",
  },
  mission: {
    kicker: "مسیر پژوهش",
    title: "از حافظهٔ پراکنده تا روایتِ قابل دفاع",
    text: "آذرخش میان خاطره و سند، روایت و نقد، و گذشته و پرسش‌های امروز پیوند می‌سازد؛ نه برای اسطوره‌سازی، بلکه برای نزدیک‌شدن منصفانه به حقیقت.",
  },
  council: {
    kicker: "حکومت شورای اتفاق اسلامی افغانستان",
    title: "حکومتی که باید دوباره، دقیق و بی‌هراس خوانده شود.",
    text: "شورای اتفاق را نمی‌توان به یک نام در حاشیهٔ رخدادها فروکاست. این تجربه، پرسشی بنیادی دربارهٔ نظم سیاسی، اقتدار محلی، وحدت اجتماعی و دولت‌سازی در هزاره‌جات پیش روی پژوهشگر می‌گذارد. آذرخش این پرونده را با تفکیک روشنِ سند، روایت، تفسیر و داوری بازسازی می‌کند.",
  },
  leader: {
    kicker: "زندگی، اندیشه و رهبری",
    title: "حضرت آیت‌الله العظمی بهشتی(ره)",
    lead: "پرونده‌ای برای شناخت یک رهبر در متن زمانهٔ او؛ نه مدح‌نامه‌ای بی‌پرسش و نه داوری‌ای جدا از شرایط تاریخی.",
    quote:
      "ارزش تاریخی یک رهبر تنها در آنچه ساخت سنجیده نمی‌شود؛ در امکان‌هایی که پس از او از دست رفت نیز دیده می‌شود.",
  },
  footer: {
    mission:
      "نهادی مستقل برای پژوهش عمیق تاریخ و بازتاب مسئولانهٔ حقیقت‌های افغانستان.",
    copyright: "© ۲۰۲۶ بنیاد آذرخش — تمامی حقوق محفوظ است.",
  },
  colors: {
    primary: "#0a3b2f",
    dark: "#041b16",
    gold: "#c99b3b",
    paper: "#f5f0e5",
  },
  design: {
    fontFamily:
      '"B Nazanin", Nazanin, "Noto Naskh Arabic", Tahoma, Arial, sans-serif',
    heroAlignment: "right",
    density: "balanced",
    customCss: "",
  },
  visibility: {
    mission: true,
    council: true,
    timeline: true,
    leader: true,
    archive: true,
    method: true,
    contribute: true,
  },
};

export function mergeSiteSettings(
  value: Partial<SiteSettings> | null | undefined,
): SiteSettings {
  if (!value) return defaultSiteSettings;
  const merged = {
    identity: { ...defaultSiteSettings.identity, ...value.identity },
    navigation: { ...defaultSiteSettings.navigation, ...value.navigation },
    hero: { ...defaultSiteSettings.hero, ...value.hero },
    mission: { ...defaultSiteSettings.mission, ...value.mission },
    council: { ...defaultSiteSettings.council, ...value.council },
    leader: { ...defaultSiteSettings.leader, ...value.leader },
    footer: { ...defaultSiteSettings.footer, ...value.footer },
    colors: { ...defaultSiteSettings.colors, ...value.colors },
    design: { ...defaultSiteSettings.design, ...value.design },
    visibility: { ...defaultSiteSettings.visibility, ...value.visibility },
  };
  if (merged.identity.siteName === "بنیاد پژوهشی آذرخش") {
    merged.identity.siteName = "بنیاد آذرخش";
  }
  if (merged.identity.tagline === "روایتِ مستندِ تاریخ") {
    merged.identity.tagline = "آذرخش؛ قاتل تاریکی و سایه‌یی سایه!";
  }
  if (
    merged.footer.copyright ===
    "© ۲۰۲۶ بنیاد پژوهشی آذرخش — تمامی حقوق محفوظ است."
  ) {
    merged.footer.copyright =
      "© ۲۰۲۶ بنیاد آذرخش — تمامی حقوق محفوظ است.";
  }
  return merged;
}
