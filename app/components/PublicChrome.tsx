"use client";

import { usePathname } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";

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

export default function PublicChrome({ children, settings, extraPages = [] }: { children: ReactNode; settings: PublicChromeSettings; extraPages?: Array<{ slug: string; title: string }> }) {
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

      <header className="az-site-header">
        <div className="az-sacred-strip">
          <div className="az-container az-sacred-inner">
            <span>بنیاد مستقل پژوهشی تاریخ افغانستان</span>
            <a href="/" className="az-sacred-basmala" aria-label="صفحهٔ نخست">
              <img src="/bismillah.jpg" alt="بسم الله الرحمن الرحیم" width="1398" height="372" />
            </a>
            <div>
              <a href="/en" lang="en" dir="ltr">EN</a>
              <a href="/publications">جست‌وجو در منابع</a>
            </div>
          </div>
        </div>

        <div className="az-site-nav-shell">
          <div className="az-container az-site-nav">
            <a href="/" className="az-site-brand" aria-label={settings.identity.siteName + "، صفحهٔ نخست"}>
              <img src={settings.identity.logoUrl} width="52" height="52" alt="" />
              <span>
                <strong>{settings.identity.siteName}</strong>
                <small>پژوهش، سند و حافظهٔ تاریخی</small>
              </span>
            </a>

            <button
              className="az-menu-button"
              type="button"
              aria-controls="public-navigation"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <span aria-hidden="true"><i /><i /><i /></span>
              <b>{menu ? "بستن" : "فهرست"}</b>
            </button>

            <nav
              id="public-navigation"
              className={menu ? "az-site-links is-open" : "az-site-links"}
              aria-label="فهرست اصلی"
              onKeyDown={(event) => { if (event.key === "Escape") setMenu(false); }}
            >
              <a href="/" aria-current={pathname === "/" ? "page" : undefined}>صفحهٔ نخست</a>
              {links.map(([href, label]) => <a href={href} aria-current={isCurrent(href)} key={href}>{label}</a>)}
              <details className="az-site-more">
                <summary>بیشتر</summary>
                <div>
                  <a href="/standards" aria-current={isCurrent("/standards")}>معیارهای پژوهش</a>
                  <a href="/governance" aria-current={isCurrent("/governance")}>ساختار و پاسخ‌گویی</a>
                  <a href="/contribute" aria-current={isCurrent("/contribute")}>همکاری و ارسال منبع</a>
                  {extraPages.map((page) => (
                    <a href={"/pages/" + page.slug} aria-current={isCurrent("/pages/" + page.slug)} key={page.slug}>{page.title}</a>
                  ))}
                  <a href="/contact" aria-current={isCurrent("/contact")}>تماس</a>
                </div>
              </details>
            </nav>

            <a className="az-site-cta" href="/contribute">ارسال منبع</a>
          </div>
        </div>
      </header>

      <div id="public-content" tabIndex={-1}>{children}</div>

      <footer className="az-site-footer">
        <div className="az-container az-footer-shell">
          <div className="az-footer-brand">
            <div className="az-footer-name">{settings.identity.siteName}</div>
            <p>{settings.footer.mission}</p>
            <span className="az-footer-motto">درخششی برای روشن‌کردن حافظهٔ تاریخ.</span>
          </div>

          <nav className="az-footer-utility" aria-label="پیوندهای پایانی">
            <a href="/about">دربارهٔ بنیاد</a>
            <a href="/standards">روش پژوهش</a>
            <a href="/archive">آرشیف</a>
            <a href="/contribute">ارسال سند و خاطره</a>
            <a href="/contact">تماس</a>
            <a href="/privacy">حریم خصوصی و حقوق نشر</a>
            {extraPages.map((page) => (
              <a href={"/pages/" + page.slug} key={page.slug}>{page.title}</a>
            ))}
          </nav>

          <div className="az-footer-contact">
            <span>ارتباط پژوهشی</span>
            <a className="az-email" href={"mailto:" + settings.contact.email} dir="ltr">{settings.contact.email}</a>
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
