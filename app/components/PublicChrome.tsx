"use client";

import { usePathname } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";
import type { SiteSettings } from "../site-settings";

const links = [
  ["/", "صفحهٔ نخست"], ["/archive", "آرشیف"], ["/publications", "نشریات"],
  ["/council", "شورای اتفاق"], ["/beheshti", "آیت‌الله بهشتی"], ["/about", "دربارهٔ بنیاد"], ["/contact", "تماس"],
];

export default function PublicChrome({ children, settings }: { children: ReactNode; settings: SiteSettings }) {
  const pathname = usePathname() || "/";
  const [menu, setMenu] = useState(false);
  if (pathname.startsWith("/admin")) return <>{children}</>;
  const theme = { "--az-forest": settings.colors.primary, "--az-deep": settings.colors.dark, "--az-gold": settings.colors.gold } as CSSProperties;
  return (
    <div className="public-redesign" style={theme}>
      <a className="az-skip" href="#public-content">رفتن به محتوای صفحه</a>
      <header className="az-masthead" data-inline-static>
        <div className="az-container az-header-row">
          <a href="/" className="az-wordmark" aria-label={`${settings.identity.siteName}، صفحهٔ نخست`}>
            <img src={settings.identity.logoUrl} width="66" height="52" alt="" />
            <span><strong>{settings.identity.siteName}</strong><small>پژوهش، سند و حافظهٔ تاریخی</small></span>
          </a>
          <button className="az-menu-toggle" type="button" aria-controls="public-navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? "بستن ✕" : "فهرست ☰"}</button>
          <nav id="public-navigation" className={menu ? "az-primary-nav is-open" : "az-primary-nav"} aria-label="فهرست اصلی" onKeyDown={(event) => { if (event.key === "Escape") setMenu(false); }}>
            {links.map(([href, label]) => <a key={href} href={href} aria-current={(href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)) ? "page" : undefined} onClick={() => setMenu(false)}>{label}</a>)}
            <a className="az-member-link" href="/login">ورود اعضا ↗</a>
          </nav>
        </div>
      </header>
      <div id="public-content" tabIndex={-1}>{children}</div>
      <footer className="az-site-footer" data-inline-static>
        <div className="az-container az-footer-grid">
          <div><div className="az-footer-name">{settings.identity.siteName}</div><p>{settings.footer.mission}</p><span className="az-footer-motto">درخششی برای روشن‌کردن حافظهٔ تاریخ.</span></div>
          <div><h2>کاوش و مطالعه</h2><a href="/archive">آرشیف و اسناد</a><a href="/publications">نشریات و پژوهش‌ها</a><a href="/standards">معیارهای پژوهش</a></div>
          <div><h2>همراه بنیاد</h2><a href="/contribute">ارسال سند و خاطره</a><a href="/join">عضویت پژوهشی</a><a href="/contact">تماس با بنیاد</a><a href="/privacy">حریم خصوصی</a></div>
          <div><h2>ارتباط مستقیم</h2><a className="az-email" href={`mailto:${settings.contact.email}`} dir="ltr">{settings.contact.email}</a><p>برای هماهنگی پژوهش و اهدای منابع با بنیاد در ارتباط باشید.</p></div>
        </div>
        <div className="az-container az-footer-bottom"><span>{settings.footer.copyright}</span><span>گذشته برای فهم آینده</span></div>
      </footer>
    </div>
  );
}
