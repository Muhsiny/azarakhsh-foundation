import type { Metadata } from "next";
import InstitutionalPage from "../components/InstitutionalPage";
import { loadSiteSettings } from "../load-site-settings";
export const metadata: Metadata = { title: "حکومت شورای اتفاق اسلامی افغانستان", description: "پروندهٔ پژوهشی حکومت شورای اتفاق؛ زمینه‌ها، ساختار و منابع تاریخی.", alternates: { canonical: "/council" } };
export default async function CouncilPage() {
  const settings = await loadSiteSettings();
  return <InstitutionalPage kicker="پروندهٔ محوری" title="حکومت شورای اتفاق اسلامی افغانستان" lead={settings.council.text} sections={[
    { title: "زمینه‌ها و شکل‌گیری", text: "این پرونده برای بررسی زمینه‌های اجتماعی و سیاسی شکل‌گیری شورای اتفاق و خواندن روایت‌های آن در بستر تاریخ افغانستان در نظر گرفته شده است." },
    { title: "ساختار و حکومت‌داری", text: "شناخت نهادها، شیوهٔ تصمیم‌گیری و ادارهٔ محلی، نیازمند بررسی اسناد، مکاتبات و روایت‌های قابل ارزیابی است." },
    { title: "اسناد و روایت‌ها", text: "میان سند اولیه، روایت شاهد و تحلیل پژوهشگر تمایز می‌گذاریم. منابع منتشرشدهٔ مرتبط از پیوند زیر قابل جست‌وجو هستند." },
  ]} intro={<div className="az-council-intro"><img src="/media/council-emblem.webp" alt={settings.media.councilEmblemAlt} width="130" height="130" /><div><p>{settings.media.councilEmblemCaption}</p><a className="az-action" href="/publications?topic=council">جست‌وجوی منابع شورای اتفاق ←</a></div></div>}><a className="az-action" href="/publications?topic=council">منابع و پژوهش‌های مرتبط ←</a></InstitutionalPage>;
}
