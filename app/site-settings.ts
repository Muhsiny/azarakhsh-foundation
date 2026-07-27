export type SectionKey =
  | "mission"
  | "council"
  | "timeline"
  | "leader"
  | "archive"
  | "standards"
  | "method"
  | "contribute";

export type LinkCard = {
  id: string;
  title: string;
  text: string;
  href: string;
  label?: string;
};

export type ArchiveItem = {
  id: string;
  category: string;
  title: string;
  text: string;
  code: string;
  status: string;
};

export type SiteSettings = {
  identity: { siteName: string; tagline: string; logoUrl: string };
  media: {
    leaderImageUrl: string;
    councilEmblemUrl: string;
    leaderImageAlt: string;
    councilEmblemAlt: string;
    councilEmblemCaption: string;
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
    principle: string;
  };
  mission: { kicker: string; title: string; text: string; cards: LinkCard[] };
  council: { kicker: string; title: string; text: string; mapTitle: string; mapStatus: string; axes: LinkCard[] };
  leader: { kicker: string; title: string; lead: string; quote: string; quoteSource: string; inquiries: LinkCard[]; collections: LinkCard[] };
  timeline: { kicker: string; title: string; text: string; items: LinkCard[] };
  archive: { kicker: string; title: string; searchPlaceholder: string; items: ArchiveItem[] };
  standards: { kicker: string; title: string; text: string; items: LinkCard[] };
  method: { kicker: string; title: string; items: LinkCard[] };
  contribute: { kicker: string; title: string; text: string; button: string; types: LinkCard[] };
  footer: { mission: string; copyright: string };
  contact: { email: string; phone: string; address: string; website: string };
  colors: { primary: string; dark: string; gold: string; paper: string };
  design: {
    fontFamily: string;
    heroAlignment: "right" | "center";
    density: "compact" | "balanced" | "spacious";
    headerStyle: "solid" | "glass";
    imageStyle: "archival" | "natural" | "monochrome";
    headingScale: number;
    sectionSpacing: number;
    contentWidth: number;
    cardRadius: number;
    customCss: string;
  };
  visibility: Record<SectionKey, boolean>;
  sectionOrder: SectionKey[];
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

const missionCards: LinkCard[] = [
  { id: "council", title: "شورای اتفاق", text: "بازخوانی ساختار، تصمیم‌ها، نهادها و تجربهٔ حکومت‌داری بر پایهٔ اسناد و روایت‌های قابل ارزیابی.", href: "#council", label: "گشودن پرونده" },
  { id: "leader", title: "پروندهٔ بهشتی", text: "زندگی، اندیشه، رهبری و میراث حضرت آیت‌الله العظمی بهشتی(ره) در آیینهٔ منابع تاریخی.", href: "#beheshti", label: "گشودن پرونده" },
  { id: "memory", title: "حافظهٔ مردمی", text: "گردآوری خاطرات، تصاویر، نامه‌ها و روایت‌های شاهدان برای تکمیل حافظهٔ جمعی هزاره‌جات.", href: "#contribute", label: "ثبت روایت" },
];

const leaderCollections: LinkCard[] = [
  { id: "life", title: "زندگی و زمانه", text: "پروندهٔ شمارهٔ ۱: زندگی‌نامه، سیر علمی و بستر تاریخی", href: "/beheshti" },
  { id: "works", title: "آثار و نوشته‌ها", text: "کتاب‌ها، رساله‌ها، نامه‌ها و یادداشت‌ها", href: "/publications?topic=works" },
  { id: "speeches", title: "سخنرانی‌ها", text: "صوت، تصویر، متن و پیاده‌سازی گفتارها", href: "/publications?topic=speeches" },
  { id: "thought", title: "اندیشه و باورها", text: "دین، عدالت، وحدت، جامعه و حکومت", href: "/publications?topic=thought" },
  { id: "memories", title: "روایت‌های مردم", text: "خاطره‌ها و شهادت‌های شفاهی نسل‌ها", href: "/publications?topic=memories" },
  { id: "gallery", title: "نگارخانه", text: "تصاویر، اسناد و یادگارهای تاریخی", href: "/publications?topic=gallery" },
];

const archiveItems: ArchiveItem[] = [
  { id: "gov-map", category: "حکومت‌داری", title: "نقشهٔ نهادی شورای اتفاق", text: "پرونده‌ای برای بازسازی ساختار تصمیم‌گیری، ادارهٔ محلی و نسبت نهادها با جامعه.", code: "AZ/GOV/01", status: "در حال گردآوری" },
  { id: "leadership", category: "رهبری", title: "آیت‌الله بهشتی و منطق وحدت سیاسی", text: "تحلیل زمینه‌ها، گزینه‌های راهبردی و محدودیت‌های رهبری در یکی از پیچیده‌ترین ادوار تاریخی.", code: "AZ/LEAD/02", status: "طرح پژوهش" },
  { id: "letters", category: "اسناد", title: "نامه‌ها و اعلامیه‌های تشکیلاتی", text: "فهرست‌نویسی، اصالت‌سنجی و خوانش انتقادی مکاتبات، فرمان‌ها و متون باقی‌مانده.", code: "AZ/DOC/03", status: "پذیرش منبع" },
  { id: "economy", category: "جامعه", title: "اقتصاد، معیشت و ادارهٔ محلی", text: "پرسش از چگونگی تأمین منابع، نظم بازار، حل اختلاف‌ها و زندگی روزمره در قلمرو شورا.", code: "AZ/SOC/04", status: "طرح پژوهش" },
  { id: "oral", category: "جامعه", title: "حافظهٔ خانواده‌ها و روایت‌های محلی", text: "ثبت روایت‌های چندصدایی از زنان، مردان، عالمان، کارگزاران و شهروندان مناطق مختلف.", code: "AZ/ORAL/05", status: "فراخوان روایت" },
  { id: "visual", category: "اسناد", title: "اطلس تصویری یک تجربهٔ سیاسی", text: "گردآوری تصاویر اشخاص، مکان‌ها، نشست‌ها و آثار مادی همراه با شرح و منشأ روشن.", code: "AZ/VIS/06", status: "فراخوان تصویر" },
];

export const defaultSiteSettings: SiteSettings = {
  identity: {
    siteName: "بنیاد آذرخش",
    tagline: "آذرخش؛ قاتل تاریکی و سایه‌یی سایه!",
    logoUrl: "/azarakhsh-logo-transparent-web.png",
  },
  media: {
    leaderImageUrl: "/api/media/site%2Fayatollah-beheshti.webp",
    councilEmblemUrl: "/api/media/site%2Fshura-e-ettefaq-emblem.webp",
    leaderImageAlt: "حضرت آیت‌الله العظمی بهشتی(ره)",
    councilEmblemAlt: "نشان تاریخی حکومت شورای اتفاق اسلامی افغانستان",
    councilEmblemCaption: "نسخهٔ آرشیوی؛ تاریخ و منشأ دقیق در حال تکمیل است.",
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
    description: "بنیاد آذرخش برای گردآوری، سنجش و بازتاب حقیقت‌های تاریخی افغانستان شکل گرفته است؛ با تمرکز ویژه بر حکومت شورای اتفاق اسلامی افغانستان و میراث فکری و سیاسی حضرت آیت‌الله العظمی بهشتی(ره).",
    primaryButton: "مطالعهٔ پروندهٔ محوری",
    secondaryButton: "روایت یا سندی دارید؟",
    principle: "هر ادعا باید از مسیر منبع، نقد و راستی‌آزمایی عبور کند.",
  },
  mission: {
    kicker: "مسیر پژوهش",
    title: "از حافظهٔ پراکنده تا روایتِ قابل دفاع",
    text: "آذرخش میان خاطره و سند، روایت و نقد، و گذشته و پرسش‌های امروز پیوند می‌سازد؛ نه برای اسطوره‌سازی، بلکه برای نزدیک‌شدن منصفانه به حقیقت.",
    cards: missionCards,
  },
  council: {
    kicker: "حکومت شورای اتفاق اسلامی افغانستان",
    title: "حکومتی که باید دوباره، دقیق و بی‌هراس خوانده شود.",
    text: "شورای اتفاق را نمی‌توان به یک نام در حاشیهٔ رخدادها فروکاست. این تجربه، پرسشی بنیادی دربارهٔ نظم سیاسی، اقتدار محلی، وحدت اجتماعی و دولت‌سازی در هزاره‌جات پیش روی پژوهشگر می‌گذارد.",
    mapTitle: "شورای اتفاق",
    mapStatus: "پروندهٔ باز",
    axes: [
      { id: "context", title: "زمینه‌ها", text: "پیدایش و نیروهای اجتماعی", href: "#archive" },
      { id: "structure", title: "ساختار", text: "نهادها و تصمیم‌گیری", href: "#archive" },
      { id: "governance", title: "حکمرانی", text: "نظم، عدالت و اداره", href: "#archive" },
      { id: "legacy", title: "فرجام", text: "بحران‌ها و میراث", href: "#archive" },
    ],
  },
  leader: {
    kicker: "زندگی، اندیشه و رهبری",
    title: "حضرت آیت‌الله العظمی بهشتی(ره)",
    lead: "پرونده‌ای برای شناخت یک رهبر در متن تاریخ؛ از سیر علمی و اجتماعی تا تصمیم‌های سیاسی و میراث ماندگار.",
    quote: "تاریخ شخصیت‌ها را نه با ستایش، بلکه با سند، زمینه و پیامد می‌سنجد.",
    quoteSource: "روش پژوهشی بنیاد آذرخش",
    inquiries: [
      { id: "science", title: "علم و تربیت", text: "تحصیلات، استادان، شاگردان، مدرسه‌ها و آثار علمی", href: "/beheshti" },
      { id: "leadership", title: "رهبری", text: "تصمیم‌گیری، وحدت سیاسی و ادارهٔ جامعه", href: "/beheshti" },
      { id: "legacy", title: "میراث", text: "اثر تاریخی، حافظهٔ عمومی و پرسش‌های باز", href: "/beheshti" },
    ],
    collections: leaderCollections,
  },
  timeline: {
    kicker: "خط زمانی",
    title: "رویدادها در بستر زمان",
    text: "تاریخ‌نگاری دقیق به ترتیب زمانی، زمینهٔ سیاسی و نسبت رویدادها نیاز دارد.",
    items: [],
  },
  archive: {
    kicker: "پرونده‌های پژوهشی",
    title: "آرشیو زندهٔ تاریخ",
    searchPlaceholder: "جست‌وجو در آرشیو...",
    items: archiveItems,
  },
  standards: {
    kicker: "معیارهای بنیاد",
    title: "پژوهش مسئولانه و قابل ارزیابی",
    text: "هر متن، تصویر، روایت و سند پیش از انتشار باید از مسیر سنجش منبع، زمینه و شفافیت عبور کند.",
    items: [
      { id: "source", title: "منبع روشن", text: "منشأ هر ادعا و سند باید مشخص باشد.", href: "/standards" },
      { id: "context", title: "زمینهٔ تاریخی", text: "رویدادها جدا از زمان و ساختار قدرت تحلیل نمی‌شوند.", href: "/standards" },
      { id: "voices", title: "چندصدایی", text: "روایت موافق، منتقد و شاهد از هم تفکیک می‌شود.", href: "/standards" },
      { id: "revision", title: "اصلاح‌پذیری", text: "نسخه‌ها با ورود سند معتبر به‌روزرسانی می‌شوند.", href: "/standards" },
    ],
  },
  method: {
    kicker: "روش کار",
    title: "از دریافت منبع تا نشر نهایی",
    items: [
      { id: "collect", title: "گردآوری", text: "ثبت نسخه، مالک و تاریخ دریافت.", href: "/standards" },
      { id: "verify", title: "راستی‌آزمایی", text: "مقایسه با اسناد و روایت‌های دیگر.", href: "/standards" },
      { id: "edit", title: "ویرایش", text: "تفکیک داده، تفسیر و داوری.", href: "/standards" },
      { id: "publish", title: "نشر", text: "انتشار همراه با توضیح منبع و درجهٔ اطمینان.", href: "/standards" },
    ],
  },
  contribute: {
    kicker: "همکاری پژوهشی",
    title: "سند، تصویر یا روایتی در اختیار دارید؟",
    text: "با ارسال منبع، در تکمیل حافظهٔ تاریخی و ساختن یک آرشیو معتبر سهم بگیرید.",
    button: "مشاهدهٔ راهنمای ارسال",
    types: [
      { id: "document", title: "سند", text: "نامه، فرمان، اعلامیه یا یادداشت", href: "/contact" },
      { id: "image", title: "تصویر", text: "عکس اشخاص، مکان‌ها و رویدادها", href: "/contact" },
      { id: "audio", title: "صوت و ویدیو", text: "سخنرانی، مصاحبه و روایت", href: "/contact" },
      { id: "memory", title: "خاطره", text: "روایت شاهد یا خانواده", href: "/contact" },
    ],
  },
  footer: {
    mission: "بنیاد مستقل پژوهش، اسناد و حافظهٔ تاریخی افغانستان",
    copyright: "تمام حقوق محفوظ است.",
  },
  contact: {
    email: "info@azarakhsh.foundation",
    phone: "",
    address: "افغانستان",
    website: "azarakhsh.foundation",
  },
  colors: {
    primary: "#173f33",
    dark: "#0b231d",
    gold: "#c7a45b",
    paper: "#f4efe5",
  },
  design: {
    fontFamily: "Vazirmatn, Tahoma, sans-serif",
    heroAlignment: "right",
    density: "balanced",
    headerStyle: "solid",
    imageStyle: "archival",
    headingScale: 1,
    sectionSpacing: 1,
    contentWidth: 1180,
    cardRadius: 18,
    customCss: "",
  },
  visibility: {
    mission: true,
    council: true,
    timeline: true,
    leader: true,
    archive: true,
    standards: true,
    method: true,
    contribute: true,
  },
  sectionOrder: ["mission", "council", "timeline", "leader", "archive", "standards", "method", "contribute"],
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge<T>(base: T, override?: DeepPartial<T>): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base) || Array.isArray(override)) return override as T;
  if (!isPlainObject(base) || !isPlainObject(override)) return override as T;

  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    result[key] = key in result
      ? deepMerge(result[key], value as never)
      : value;
  }
  return result as T;
}

export function mergeSiteSettings(
  settings?: DeepPartial<SiteSettings> | null,
): SiteSettings {
  return deepMerge(defaultSiteSettings, settings ?? undefined);
}
