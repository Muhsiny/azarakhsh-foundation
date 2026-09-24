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
};

export const siteSettings: Readonly<SiteSettings> = {
  identity: {
    siteName: "بنیاد آذرخش",
    logoUrl: "/azarakhsh-logo-transparent-web.png",
  },
  media: {
    leaderImageUrl: "/media/beheshti-original.webp",
    councilEmblemUrl: "/media/council-emblem-color.webp",
    leaderImageAlt: "آیت‌الله سید علی بهشتی",
    councilEmblemAlt: "نشان تاریخی حکومت شورای اتفاق اسلامی افغانستان",
    councilEmblemCaption: "نشان رنگی شورای اتفاق اسلامی افغانستان، برگرفته از نسخهٔ تصویری آرشیف.",
  },
  council: {
    text: "پروندهٔ شورای اتفاق شکل‌گیری این نهاد در ورس در سال ۱۳۵۸، ساختار اداری، حکومت‌داری، قلمرو نفوذ و محدودیت‌های آن را با مقایسهٔ اسناد داخلی و پژوهش‌های دانشگاهی بررسی می‌کند.",
  },
  footer: {
    mission: "بنیاد مستقل پژوهش، اسناد و حافظهٔ تاریخی افغانستان",
    copyright: "تمام حقوق محفوظ است.",
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
};
