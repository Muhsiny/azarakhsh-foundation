"use client";

import { usePathname } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";
import type { SiteSettings } from "../site-settings";

const links = [
  ["/", "صفحهٔ نخست"],
  ["/archive", "آرشیف"],
  ["/publications", "نشریات"],
  ["/council", "شورای اتفاق"],
  ["/beheshti", "آیت‌الله بهشتی"],
  ["/about", "دربارهٔ بنیاد"],
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
    "--az-content-width": `${settings.design.contentWidth}px`,
  } as CSSProperties;

  return (
    <div className="public-redesign" style={theme}>
      <a className="az-skip" href="#public-content">رفتن به محتوای صفحه</a>
      <header className="az-masthead" data-inline-static>
        <div className="az-container az-header-row">
          <a href="/" className="az-wordmark" aria-label={`${settings.identity.siteName}، صفحهٔ نخست`}>
            <img src={settings.identity.logoUrl} width="58" height="48" alt="" />
            <span>
              <strong>{settings.identity.siteName}</strong>
              <small>پژوهش، سند و حافظهٔ تاریخی افغانستان</small>
            </span>
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
            className={menu ? "az-primary-nav is-open" : "az-primary-nav"}
            aria-label="فهرست اصلی"
            onKeyDown={(event) => { if (event.key === "Escape") setMenu(false); }}
          >
            {links.map(([href, label]) => (
              <a
                key={href}
                href={href}
                aria-current={(href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)) ? "page" : undefined}
                onClick={() => setMenu(false)}
              >
                {label}
              </a>
            ))}
            <a href="/contact" onClick={() => setMenu(false)}>تماس</a>
            <a className="az-language-link" href="/en" lang="en" dir="ltr">EN</a>
            <a className="az-member-link" href="/login">ورود اعضا</a>
          </nav>
        </div>
      </header>

      <div id="public-content" tabIndex={-1}>{children}</div>

      <footer className="az-site-footer" data-inline-static>
        <div className="az-container az-footer-grid">
          <div className="az-footer-brand">
            <div className="az-footer-name">{settings.identity.siteName}</div>
            <p>{settings.footer.mission}</p>
            <span className="az-footer-motto">درخششی برای روشن‌کردن حافظهٔ تاریخ.</span>
            <a className="az-email" href={`mailto:${settings.contact.email}`} dir="ltr">{settings.contact.email}</a>
          </div>

          <div>
            <h2>پژوهش و دسترسی</h2>
            <a href="/archive">آرشیف و اسناد</a>
            <a href="/publications">نشریات و پژوهش‌ها</a>
            <a href="/council">پروندهٔ شورای اتفاق</a>
            <a href="/beheshti">پروندهٔ آیت‌الله بهشتی</a>
            <a href="/standards">اصول پژوهش و نشر</a>
          </div>

          <div className="az-footer-contact">
            <h2>بنیاد و پاسخ‌گویی</h2>
            <a href="/about">دربارهٔ بنیاد</a>
            <a href="/governance">ساختار و پاسخ‌گویی</a>
            <a href="/contribute">ارسال سند و خاطره</a>
            <a href="/contact">تماس با بنیاد</a>
            <a href="/privacy">حریم خصوصی و حقوق نشر</a>
            <a href="/en" lang="en" dir="ltr">English overview</a>
          </div>
        </div>

        <div className="az-container az-footer-bottom">
          <span>{settings.footer.copyright}</span>
          <span>گذشته برای فهم آینده</span>
        </div>
      </footer>
    </div>
  );
}