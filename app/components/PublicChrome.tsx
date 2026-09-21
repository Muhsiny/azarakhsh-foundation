"use client";

import { usePathname } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";
import type { SiteSettings } from "../site-settings";

const collectionLinks = [
  ["/publications", "نشریات و منابع"],
  ["/archive", "آرشیف تاریخی"],
];

const dossierLinks = [
  ["/council", "حکومت شورای اتفاق"],
  ["/beheshti", "آیت‌الله سید علی بهشتی"],
];

const institutionLinks = [
  ["/about", "دربارهٔ بنیاد"],
  ["/standards", "اصول پژوهش و نشر"],
  ["/governance", "ساختار و پاسخ‌گویی"],
  ["/contact", "تماس و همکاری"],
  ["/contribute", "ارسال سند یا خاطره"],
];

export default function PublicChrome({ children, settings }: { children: ReactNode; settings: SiteSettings }) {
  const pathname = usePathname() || "/";
  const [menu, setMenu] = useState(false);
  if (pathname.startsWith("/admin")) return <>{children}</>;

  const theme = {
    "--az-forest": settings.colors.primary,
    "--az-deep": settings.colors.dark,
    "--az-gold": settings.colors.gold,
    "--az-paper": settings.colors.paper,
    "--az-content-width": settings.design.contentWidth + "px",
  } as CSSProperties;

  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(href + "/") ? "page" : undefined;

  return (
    <div className="public-redesign" style={theme}>
      <a className="az-skip" href="#public-content">رفتن به محتوای صفحه</a>

      <header className="az-masthead az-masthead-final" data-inline-static>
        <div className="az-container az-header-row az-header-row-final">
          <a href="/" className="az-wordmark az-wordmark-final" aria-label={settings.identity.siteName + "، صفحهٔ نخست"}>
            <img src={settings.identity.logoUrl} width="52" height="52" alt="" />
            <span>
              <strong>{settings.identity.siteName}</strong>
              <small>پژوهش · سند · حافظهٔ تاریخی</small>
            </span>
          </a>

          <a href="/" className="az-header-basmala" aria-label="صفحهٔ نخست">
            <span>بسم الله الرحمن الرحیم</span>
          </a>

          <button
            className="az-menu-toggle"
            type="button"
            aria-controls="public-navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? "بستن ✕" : "فهرست ☰"}
          </button>

          <nav
            id="public-navigation"
            className={menu ? "az-primary-nav az-primary-nav-final is-open" : "az-primary-nav az-primary-nav-final"}
            aria-label="فهرست اصلی"
            onKeyDown={(event) => { if (event.key === "Escape") setMenu(false); }}
          >
            <details className="az-nav-more">
              <summary aria-current={collectionLinks.some(([href]) => isCurrent(href)) ? "page" : undefined}>گنجینه</summary>
              <div className="az-nav-popover">
                {collectionLinks.map(([href, label]) => (
                  <a key={href} href={href} aria-current={isCurrent(href)} onClick={() => setMenu(false)}>{label}</a>
                ))}
              </div>
            </details>

            <details className="az-nav-more">
              <summary aria-current={dossierLinks.some(([href]) => isCurrent(href)) ? "page" : undefined}>پرونده‌ها</summary>
              <div className="az-nav-popover">
                {dossierLinks.map(([href, label]) => (
                  <a key={href} href={href} aria-current={isCurrent(href)} onClick={() => setMenu(false)}>{label}</a>
                ))}
              </div>
            </details>

            <details className="az-nav-more">
              <summary aria-current={institutionLinks.some(([href]) => isCurrent(href)) ? "page" : undefined}>بنیاد</summary>
              <div className="az-nav-popover">
                {institutionLinks.map(([href, label]) => (
                  <a key={href} href={href} aria-current={isCurrent(href)} onClick={() => setMenu(false)}>{label}</a>
                ))}
              </div>
            </details>

            <a className="az-language-link" href="/en" lang="en" dir="ltr" aria-label="English overview">EN</a>
            <a className="az-member-link" href="/login">ورود اعضا</a>
          </nav>
        </div>
      </header>

      <div id="public-content" tabIndex={-1}>{children}</div>

      <footer className="az-site-footer az-site-footer-final" data-inline-static>
        <div className="az-container az-footer-shell">
          <div className="az-footer-brand">
            <div className="az-footer-name">{settings.identity.siteName}</div>
            <p>{settings.footer.mission}</p>
            <span className="az-footer-motto">درخششی برای روشن‌کردن حافظهٔ تاریخ.</span>
            <a className="az-email" href={"mailto:" + settings.contact.email} dir="ltr">{settings.contact.email}</a>
          </div>

          <nav className="az-footer-utility" aria-label="پیوندهای پایانی">
            <a href="/about">درباره</a>
            <a href="/standards">روش پژوهش</a>
            <a href="/privacy">حریم خصوصی و حقوق نشر</a>
          </nav>
        </div>

        <div className="az-container az-footer-bottom">
          <span>{settings.footer.copyright}</span>
          <span>گذشته برای فهم آینده</span>
        </div>
      </footer>
    </div>
  );
}