export type SiteSettings = {
  identity: {
    siteName: string;
    logoUrl: string;
  };
  media: {
    leaderImageUrl: string;
    councilEmblemUrl: string;
    leaderImageAlt: string;
    councilEmblemAlt: string;
    councilEmblemCaption: string;
  };
  council: {
    text: string;
  };
  footer: {
    mission: string;
    copyright: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  colors: {
    primary: string;
    dark: string;
    gold: string;
    paper: string;
  };
  design: {
    fontFamily: string;
    contentWidth: number;
  };
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const defaultSiteSettings: SiteSettings = {
  identity: {
    siteName: "بنیاد آذرخش",
    logoUrl: "/azarakhsh-logo-transparent-web.png",
  },
  media: {
    leaderImageUrl: "/media/beheshti-original.webp",
    councilEmblemUrl: "/media/council-emblem.webp",
    leaderImageAlt: "آیت‌الله سید علی بهشتی",
    councilEmblemAlt: "نشان تاریخی حکومت شورای اتفاق اسلامی افغانستان",
    councilEmblemCaption: "نسخهٔ آرشیوی؛ تاریخ و منشأ دقیق در حال تکمیل است.",
  },
  council: {
    text: "این پرونده تجربهٔ حکومت شورای اتفاق اسلامی افغانستان را از مسیر اسناد، روایت‌ها و زمینهٔ تاریخی بررسی می‌کند.",
  },
  footer: {
    mission: "بنیاد مستقل پژوهش، اسناد و حافظهٔ تاریخی افغانستان",
    copyright: "تمام حقوق محفوظ است.",
  },
  contact: {
    email: "info@azarakhsh.foundation",
    phone: "",
    address: "افغانستان",
  },
  colors: {
    primary: "#173f33",
    dark: "#0b231d",
    gold: "#c7a45b",
    paper: "#f8f6f0",
  },
  design: {
    fontFamily: "Vazirmatn, Tahoma, sans-serif",
    contentWidth: 1180,
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge<T>(base: T, override?: DeepPartial<T>): T {
  if (override === undefined || override === null) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) return override as T;

  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined || !(key in result)) continue;
    result[key] = deepMerge(result[key], value as never);
  }
  return result as T;
}

export function mergeSiteSettings(settings?: DeepPartial<SiteSettings> | null): SiteSettings {
  return deepMerge(defaultSiteSettings, settings ?? undefined);
}
