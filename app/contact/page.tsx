import type { Metadata } from "next";
import InstitutionalPage from "../components/InstitutionalPage";
import { siteSettings as settings } from "../site-settings";

export const metadata: Metadata = {
  title: "تماس و همکاری",
  description: "راه‌های تماس، همکاری پژوهشی و درخواست اصلاح محتوا در بنیاد آذرخش.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: "تماس و همکاری | بنیاد آذرخش", description: "راه‌های تماس، همکاری پژوهشی و درخواست اصلاح محتوا در بنیاد آذرخش." },
};
const sections = [
  { title: "پرسش و همکاری پژوهشی", text: "برای پیشنهاد پژوهش مشترک، معرفی منبع، تصحیح سند، کتاب‌شناسی یا طرح پروندهٔ موضوعی با بنیاد تماس بگیرید." },
  { title: "درخواست اصلاح یا تکمیل", text: "اگر در یکی از صفحه‌ها خطا، ابهام یا منبع تازه‌ای یافته‌اید، نشانی دقیق صفحه و شواهد پشتیبان را در پیام خود ذکر کنید." },
  { title: "حقوق نشر و استفاده از منابع", text: "برای بازنشر، استناد گسترده یا دریافت نسخهٔ پژوهشی یک منبع، عنوان و کاربرد موردنظر را روشن بنویسید." },
  { title: "اطلاعات حساس", text: "اطلاعات شخصی یا حساس را فقط در حد ضروری بفرستید. برای ارسال سند و خاطره از فرم مستقل و گزینه‌های رضایت آن استفاده کنید." },
];
export default async function ContactPage() {
  return <InstitutionalPage kicker="ارتباط با بنیاد" title="تماس و همکاری با بنیاد" lead="این صفحه برای پرسش، همکاری پژوهشی، درخواست اصلاح و امور حقوق نشر است. ارسال سند و خاطره مسیر جداگانه‌ای دارد." sections={sections} intro={<div className="az-contact-cards"><div><h2>ارتباط مستقیم با بنیاد</h2><address><a href={`mailto:${settings.contact.email}`} dir="ltr">{settings.contact.email}</a>{settings.contact.phone && <p>{settings.contact.phone}</p>}{settings.contact.address && <p>{settings.contact.address}</p>}</address></div><div><h2>سند یا خاطره‌ای دارید؟</h2><p>فرم ارسال منبع، اطلاعات منشأ، پیوست و ترجیح شما دربارهٔ ذکر نام را یک‌جا ثبت می‌کند.</p><a className="az-action" href="/contribute">رفتن به فرم ارسال سند و خاطره ←</a></div></div>} />;
}
