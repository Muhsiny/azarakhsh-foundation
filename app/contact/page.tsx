import type { Metadata } from "next";
import InstitutionalPage from "../components/InstitutionalPage";
import { loadSiteSettings } from "../load-site-settings";

export const metadata: Metadata = {
  title: "تماس و ارسال سند",
  description: "راهنمای همکاری پژوهشی و ارسال اسناد و روایت‌ها به بنیاد آذرخش.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: "تماس و ارسال سند | بنیاد آذرخش", description: "راهنمای همکاری پژوهشی، اهدای سند و ارسال روایت به بنیاد آذرخش." },
};
const sections = [
  { title: "ارسال سند", text: "پیش از ارسال، نوع سند، مالک فعلی، منشأ، تاریخ تقریبی، اشخاص یا مکان‌های مرتبط و اجازهٔ نشر را یادداشت کنید." },
  { title: "ارسال روایت", text: "روایت باید مشخص کند گوینده شاهد مستقیم است یا ناقل، واقعه در چه زمان و مکانی رخ داده و کدام بخش‌ها قطعی یا تقریبی‌اند." },
  { title: "همکاری پژوهشی", text: "پژوهشگران می‌توانند طرح، مقاله، تصحیح سند، کتاب‌شناسی یا پیشنهاد پروندهٔ موضوعی ارائه کنند." },
  { title: "روند بررسی", text: "دریافت اولیه به معنای انتشار نیست. مواد پس از ارزیابی منشأ، حقوق، کیفیت و ارتباط موضوعی وارد روند تحریریه می‌شوند." },
  { title: "امنیت و حقوق", text: "اصل اسناد ارزشمند را بدون نسخهٔ پشتیبان واگذار نکنید. شرایط مالکیت، نمایش و استفادهٔ پژوهشی باید روشن و مکتوب باشد." },
];
export default async function ContactPage() {
  const settings = await loadSiteSettings();
  return <InstitutionalPage kicker="درگاه مشارکت" title="تماس، همکاری و اهدای سند" lead="برای پرسش پژوهشی، پیشنهاد همکاری یا هماهنگی ارسال منابع با بنیاد در ارتباط باشید." sections={sections} intro={<div className="az-contact-cards"><div><h2>ارتباط مستقیم با بنیاد</h2><address><a href={`mailto:${settings.contact.email}`} dir="ltr">{settings.contact.email}</a>{settings.contact.phone && <p>{settings.contact.phone}</p>}{settings.contact.address && <p>{settings.contact.address}</p>}</address></div><div><h2>سند یا روایتی دارید؟</h2><p>اطلاعات منبع و ترجیح شما دربارهٔ ذکر نام در فرم ثبت می‌شود.</p><a className="az-action" href="/contribute">بازکردن فرم ارسال منبع ←</a></div></div>} />;
}
