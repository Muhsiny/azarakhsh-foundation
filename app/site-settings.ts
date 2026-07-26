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

const missionCards: LinkCard[] = [
  { id: "council", title: "شورای اتفاق", text: "بازخوانی ساختار، تصمیم‌ها، نهادها و تجربهٔ حکومت‌داری بر پایهٔ اسناد و روایت‌های قابل ارزیابی.", href: "#council", label: "گشودن پرونده" },
  { id: "leader", title: "پروندهٔ بهشتی", text: "زندگی، اندیشه، رهبری و میراث حضرت آیت‌الله العظمی بهشتی(ره) در آیینهٔ منابع تاریخی.", href: "#beheshti", label: "گشودن پرونده" },
  { id: "memory", title: "حافظهٔ مردمی", text: "گردآوری خاطرات، تصاویر، نامه‌ها و روایت‌های شاهدان برای تکمیل حافظهٔ جمعی هزاره‌جات.", href: "#contribute", label: "ثبت روایت" },
];

const leaderCollections: LinkCard[] = [
  { id: "life", title: "زندگی و زمانه", text: "زندگی‌نامه، سیر علمی و بستر تاریخی", href: "/publications?topic=life" },
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
    lead: "پرونده‌ای برای شناخت یک رهبر در متن زمانهٔ او؛ نه مدح‌نامه‌ای بی‌پرسش و نه داوری‌ای جدا از شرایط تاریخی.",
    quote: "ارزش تاریخی یک رهبر تنها در آنچه ساخت سنجیده نمی‌شود؛ در امکان‌هایی که پس از او از دست رفت نیز دیده می‌شود.",
    quoteSource: "یادداشت تحلیلی بنیاد آذرخش",
    inquiries: [
      { id: "belief", title: "اندیشهٔ سیاسی", text: "تلقی از مشروعیت و نسبت دین، جامعه و حکومت", href: "/publications?topic=thought" },
      { id: "lead", title: "شیوهٔ رهبری", text: "ائتلاف‌سازی و مدیریت تعارض‌های درون‌ساختاری", href: "/publications?topic=leadership" },
      { id: "legacy", title: "میراث تاریخی", text: "روایت‌های خانوادگی و حافظهٔ نسل‌های پسین", href: "/publications?topic=legacy" },
    ],
    collections: leaderCollections,
  },
  timeline: {
    kicker: "خط پژوهش، نه خط افسانه",
    title: "روایت تاریخی در پنج ایستگاه",
    text: "این خط زمانی برای صفحهٔ تفصیلی محفوظ است و در صفحهٔ نخست نمایش داده نمی‌شود.",
    items: [
      { id: "formation", title: "زمینه‌های شکل‌گیری", text: "جامعه، جغرافیا و خلأ قدرت", href: "#archive" },
      { id: "founding", title: "تأسیس و انسجام", text: "ائتلاف نیروها و تعریف نظم", href: "#archive" },
      { id: "institutions", title: "اداره و نهادسازی", text: "سازوکار تصمیم و اجرای قدرت", href: "#archive" },
      { id: "crisis", title: "بحران و فرسایش", text: "رقابت‌ها، فشارها و گسست‌ها", href: "#archive" },
      { id: "legacy", title: "میراث و امکان ازدست‌رفته", text: "اثر تاریخی و پرسش‌های امروز", href: "#archive" },
    ],
  },
  archive: {
    kicker: "گزیدهٔ آرشیو",
    title: "پرونده‌های در دست پژوهش",
    searchPlaceholder: "جست‌وجو در عنوان و موضوع...",
    items: archiveItems,
  },
  standards: {
    kicker: "اعتبار و پاسخ‌گویی علمی",
    title: "هر روایت باید شناسنامهٔ پژوهشی داشته باشد.",
    text: "بنیاد آذرخش میان سند، خاطره، تحلیل و داوری تمایز می‌گذارد و سطح اطمینان، منشأ و محدودیت هر منبع را برای خواننده روشن می‌سازد.",
    items: [
      { id: "source", title: "شناسنامهٔ منبع", text: "پدیدآورنده، تاریخ، مکان، مالکیت و مسیر دستیابی", href: "/standards" },
      { id: "confidence", title: "درجهٔ اطمینان", text: "تأییدشده، محتمل، محل اختلاف یا نیازمند بررسی", href: "/standards" },
      { id: "correction", title: "حق اصلاح", text: "ثبت نسخه‌ها، اصلاح شفاف خطا و حفظ سابقهٔ تغییر", href: "/standards" },
      { id: "ethics", title: "اخلاق انتشار", text: "رضایت صاحب منبع، حفاظت از اطلاعات حساس و منع تحریف", href: "/standards" },
    ],
  },
  method: {
    kicker: "منشور اعتبار",
    title: "فرایند تفصیلی پژوهش",
    items: [
      { id: "collect", title: "گردآوری", text: "شناسایی سند، ثبت منشأ، زمان، مالکیت و شرایط پیدایش منبع.", href: "/standards" },
      { id: "verify", title: "سنجش", text: "مقایسهٔ روایت‌ها، نقد درونی و بیرونی و تشخیص فاصلهٔ حافظه با واقعه.", href: "/standards" },
      { id: "analyze", title: "تحلیل", text: "تفکیک داده از تفسیر و سنجش رخداد در بستر اجتماعی و سیاسی خود.", href: "/standards" },
      { id: "publish", title: "انتشار", text: "بیان سطح اطمینان، ذکر محدودیت‌ها و گشودن راه نقد علمی و اصلاح.", href: "/standards" },
    ],
  },
  contribute: {
    kicker: "حافظهٔ شما، بخشی از تاریخ است",
    title: "یک روایت می‌تواند جای خالی یک نسل را پُر کند.",
    text: "اگر عکس، نامه، سند، خاطره یا شناختی از شاهدان این دوره دارید، بنیاد آذرخش آمادهٔ ارزیابی پژوهشی آن است. هیچ اثر بدون رضایت صاحب منبع منتشر نمی‌شود.",
    button: "راهنمای ثبت روایت",
    types: [
      { id: "audio", title: "صدا", text: "روایت شفاهی و گفت‌وگو با شاهد", href: "#contribute" },
      { id: "image", title: "تصویر", text: "عکس اشخاص، مکان‌ها و رویدادها", href: "#contribute" },
      { id: "document", title: "سند", text: "نامه، اعلامیه، حکم و یادداشت", href: "#contribute" },
      { id: "contact", title: "معرفی منبع", text: "معرفی شاهد، خانواده یا مجموعه‌دار", href: "#contribute" },
    ],
  },
  footer: {
    mission: "نهادی مستقل برای پژوهش عمیق تاریخ و بازتاب مسئولانهٔ حقیقت‌های افغانستان.",
    copyright: "© ۲۰۲۶ بنیاد آذرخش — تمامی حقوق محفوظ است.",
  },
  contact: { email: "", phone: "", address: "افغانستان", website: "" },
  colors: { primary: "#0a3b2f", dark: "#041b16", gold: "#c99b3b", paper: "#f5f0e5" },
  design: {
    fontFamily: "'B Lotus', 'BLotus', 'Lotus', var(--font-lotus-fallback), 'B Mitra', 'BMitra', 'Mitra', var(--font-naskh), Tahoma, serif",
    heroAlignment: "right",
    density: "balanced",
    headerStyle: "solid",
    imageStyle: "archival",
    headingScale: 1,
    sectionSpacing: 0.9,
    contentWidth: 1360,
    cardRadius: 0,
    customCss: "",
  },
  visibility: { mission: true, council: true, timeline: false, leader: true, archive: true, standards: true, method: false, contribute: true },
  sectionOrder: ["mission", "council", "leader", "archive", "standards", "contribute"],
};

function arrayOrDefault<T>(value: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(value) ? value : fallback;
}

export function mergeSiteSettings(value: Partial<SiteSettings> | null | undefined): SiteSettings {
  if (!value) return defaultSiteSettings;
  const merged: SiteSettings = {
    identity: { ...defaultSiteSettings.identity, ...value.identity },
    media: { ...defaultSiteSettings.media, ...value.media },
    navigation: { ...defaultSiteSettings.navigation, ...value.navigation },
    hero: { ...defaultSiteSettings.hero, ...value.hero },
    mission: { ...defaultSiteSettings.mission, ...value.mission, cards: arrayOrDefault(value.mission?.cards, defaultSiteSettings.mission.cards) },
    council: { ...defaultSiteSettings.council, ...value.council, axes: arrayOrDefault(value.council?.axes, defaultSiteSettings.council.axes) },
    leader: { ...defaultSiteSettings.leader, ...value.leader, inquiries: arrayOrDefault(value.leader?.inquiries, defaultSiteSettings.leader.inquiries), collections: arrayOrDefault(value.leader?.collections, defaultSiteSettings.leader.collections) },
    timeline: { ...defaultSiteSettings.timeline, ...value.timeline, items: arrayOrDefault(value.timeline?.items, defaultSiteSettings.timeline.items) },
    archive: { ...defaultSiteSettings.archive, ...value.archive, items: arrayOrDefault(value.archive?.items, defaultSiteSettings.archive.items) },
    standards: { ...defaultSiteSettings.standards, ...value.standards, items: arrayOrDefault(value.standards?.items, defaultSiteSettings.standards.items) },
    method: { ...defaultSiteSettings.method, ...value.method, items: arrayOrDefault(value.method?.items, defaultSiteSettings.method.items) },
    contribute: { ...defaultSiteSettings.contribute, ...value.contribute, types: arrayOrDefault(value.contribute?.types, defaultSiteSettings.contribute.types) },
    footer: { ...defaultSiteSettings.footer, ...value.footer },
    contact: { ...defaultSiteSettings.contact, ...value.contact },
    colors: { ...defaultSiteSettings.colors, ...value.colors },
    design: { ...defaultSiteSettings.design, ...value.design },
    visibility: { ...defaultSiteSettings.visibility, ...value.visibility, timeline: false, method: false },
    sectionOrder: arrayOrDefault(value.sectionOrder, defaultSiteSettings.sectionOrder).filter((key) => key !== "timeline" && key !== "method"),
  };
  if (merged.identity.siteName === "بنیاد پژوهشی آذرخش") merged.identity.siteName = "بنیاد آذرخش";
  if (merged.identity.tagline === "روایتِ مستندِ تاریخ") merged.identity.tagline = "آذرخش؛ قاتل تاریکی و سایه‌یی سایه!";
  return merged;
}
