"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

export type PublicChromeSettings = {
  identity: { siteName: string; logoUrl: string };
  colors: { primary: string; dark: string; gold: string; paper: string };
  design: { contentWidth: number };
  footer: { mission: string; copyright: string };
  contact: { email: string };
};

const links = [
  ["/about", "دربارهٔ بنیاد"],
  ["/council", "حکومت شورای اتفاق"],
  ["/beheshti", "آیت‌الله بهشتی"],
  ["/archive", "آرشیف"],
  ["/publications", "نشریات"],
] as const;

export default function PublicChrome({
  children,
  settings,
  extraPages = [],
}: {
  children: ReactNode;
  settings: PublicChromeSettings;
  extraPages?: Array<{ slug: string; title: string }>;
}) {
  const pathname = usePathname() || "/";
  const [menu, setMenu] = useState(false);

  useEffect(() => setMenu(false), [pathname]);

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
    <div className="public-redesign az2-shell" style={theme}>
      <a className="az-skip" href="#public-content">رفتن به محتوای صفحه</a>

      <header className="az2-header">
        <div className="az2-header-main az-container">
          <a className="az2-brand" href="/" aria-label={settings.identity.siteName + "، صفحهٔ نخست"}>
            <img src={settings.identity.logoUrl} width="48" height="48" alt="" />
            <span>
              <strong>{settings.identity.siteName}</strong>
              <small>پژوهش، اسناد و حافظهٔ تاریخی</small>
            </span>
          </a>

          <a href="/" className="az2-basmala" aria-label="صفحهٔ نخست">
            <img src="/bismillah.jpg" alt="بسم الله الرحمن الرحیم" width="1000" height="1000" />
          </a>

          <div className="az2-header-tools">
            <a className="az2-lang" href="/en" lang="en" dir="ltr">EN</a>
            <a className="az2-search" href="/archive" aria-label="جست‌وجو در آرشیف">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
            </a>
            <button
              className="az2-menu-button"
              type="button"
              aria-controls="az2-navigation"
              aria-expanded={menu}
              aria-label={menu ? "بستن فهرست" : "باز کردن فهرست"}
              onClick={() => setMenu((open) => !open)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        <div className="az2-nav-wrap">
          <nav
            id="az2-navigation"
            className={menu ? "az2-nav az-container is-open" : "az2-nav az-container"}
            aria-label="فهرست اصلی"
            onKeyDown={(event) => { if (event.key === "Escape") setMenu(false); }}
          >
            <a href="/" aria-current={pathname === "/" ? "page" : undefined}>آغاز</a>
            {links.map(([href, label]) => (
              <a href={href} aria-current={isCurrent(href)} key={href}>{label}</a>
            ))}
            <details className="az2-more">
              <summary>بیشتر</summary>
              <div>
                <a href="/standards" aria-current={isCurrent("/standards")}>روش پژوهش</a>
                <a href="/contribute" aria-current={isCurrent("/contribute")}>ارسال سند و خاطره</a>
                {extraPages.slice(0, 2).map((page) => (
                  <a href={"/pages/" + page.slug} aria-current={isCurrent("/pages/" + page.slug)} key={page.slug}>
                    {page.title}
                  </a>
                ))}
                <a href="/contact" aria-current={isCurrent("/contact")}>تماس</a>
              </div>
            </details>
          </nav>
        </div>
      </header>

      <div id="public-content" tabIndex={-1}>{children}</div>

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
    </div>
  );
}
