"use client";

import { usePathname } from "next/navigation";
import type { PublicChromeSettings } from "./public-chrome-types";

export default function PublicFooter({ settings }: { settings: PublicChromeSettings }) {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="az2-footer">
      <div className="az-container az2-footer-grid">
        <div className="az2-footer-brand">
          <div className="az2-footer-brandline">
            <img src={settings.identity.logoUrl} width="54" height="54" alt="" />
            <div>
              <strong>{settings.identity.siteName}</strong>
              <span>پژوهش، اسناد و حافظهٔ تاریخی افغانستان</span>
            </div>
          </div>
          <p>{settings.footer.mission}</p>
          <a className="az2-footer-email" href={"mailto:" + settings.contact.email} dir="ltr">
            {settings.contact.email}
          </a>
        </div>

        <nav className="az2-footer-links" aria-label="پیوندهای پایانی">
          <a href="/about">دربارهٔ بنیاد</a>
          <a href="/standards">روش پژوهش</a>
          <a href="/archive">آرشیف</a>
          <a href="/publications">نشریات</a>
          <a href="/contribute">ارسال سند و خاطره</a>
          <a href="/join">عضویت پژوهشی</a>
          <a href="/login">ورود اعضا</a>
          <a href="/account">حساب من</a>
          <a href="/privacy">حریم خصوصی و حقوق نشر</a>
          <a href="/contact">تماس با ما</a>
        </nav>

        <div className="az2-footer-motto">
          <span>تاریخ</span>
          <strong>برای فهم آینده</strong>
          <p>منبع را حفظ می‌کنیم، روایت را می‌سنجیم و مرز میان سند و تفسیر را روشن نگه می‌داریم.</p>
        </div>
      </div>

      <div className="az-container az2-footer-bottom">
        <span>{settings.footer.copyright}</span>
        <span>بنیاد آذرخش</span>
      </div>
    </footer>
  );
}
