"use client";

import { usePathname } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";
import type { SiteSettings } from "../site-settings";

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

      <header className="az-masthead az-masthead-reference" data-inline-static>
        <div className="az-reference-top">
          <div className="az-reference-top-side az-reference-top-side-right">
            <span>بنیاد مستقل پژوهشی تاریخ افغانستان</span>
          </div>

          <a href="/" className="az-reference-basmala" aria-label="صفحهٔ نخست">
            <img src="/media/bismillah" alt="بسم الله الرحمن الرحیم" />
          </a>

          <div className="az-reference-top-side az-reference-top-side-left">
            <a href="/en" lang="en" dir="ltr">EN</a>
            <span className="az-reference-separator" aria-hidden="true" />
            <a href="/publications">جست‌وجو در منابع</a>
            <span className="az-reference-search-icon" aria-hidden="true">⌕</span>
          </div>
        </div>

        <div className="az-reference-nav-shell">
          <div className="az-container az-reference-nav">
            <a href="/" className="az-reference-brand" aria-label={settings.identity.siteName + "، صفحهٔ نخست"}>
              <img src={settings.identity.logoUrl} width="56" height="56" alt="" />
              <span>
                <strong>{settings.identity.siteName}</strong>
                <small>پژوهش، سند و حافظهٔ تاریخی</small>
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
              className={menu ? "az-reference-menu is-open" : "az-reference-menu"}
              aria-label="فهرست اصلی"
              onKeyDown={(event) => { if (event.key === "Escape") setMenu(false); }}
            >
              <a href="/" aria-current={pathname === "/" ? "page" : undefined}>صفحهٔ نخست</a>
              <a href="/about" aria-current={isCurrent("/about")}>دربارهٔ بنیاد</a>
              <a href="/council" aria-current={isCurrent("/council")}>حکومت شورای اتفاق</a>
              <a href="/beheshti" aria-current={isCurrent("/beheshti")}>آیت‌الله بهشتی</a>
              <a href="/archive" aria-current={isCurrent("/archive")}>آرشیف</a>
              <a href="/publications" aria-current={isCurrent("/publications")}>نشریات</a>

              <details className="az-reference-more">
                <summary>بیشتر</summary>
                <div>
                  <a href="/standards" aria-current={isCurrent("/standards")}>معیارهای پژوهش</a>
                  <a href="/governance" aria-current={isCurrent("/governance")}>ساختار و پاسخ‌گویی</a>
                  <a href="/contribute" aria-current={isCurrent("/contribute")}>همکاری و ارسال منبع</a>
                  <a href="/contact" aria-current={isCurrent("/contact")}>تماس</a>
                </div>
              </details>
            </nav>

            <a className="az-reference-support" href="/contribute">ارسال سند و خاطره ←</a>
          </div>
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
            <a href="/about">دربارهٔ بنیاد</a>
            <a href="/standards">روش پژوهش</a>
            <a href="/contribute">ارسال سند و خاطره</a>
            <a href="/contact">تماس</a>
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
