"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicChromeSettings } from "./public-chrome-types";



export default function PublicHeader({
  settings,
  extraPages = [],
}: {
  settings: PublicChromeSettings;
  extraPages?: Array<{ slug: string; title: string }>;
}) {
  const pathname = usePathname() || "/";
  const [menu, setMenu] = useState(false);

  useEffect(() => setMenu(false), [pathname]);

  if (pathname.startsWith("/admin")) return null;

  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(href + "/") ? "page" : undefined;

  return (
    <>
      <a className="az-skip" href="#public-content">رفتن به محتوای صفحه</a>
      <header className="az2-header">
        <div className="az2-header-main az-container">
          <a className="az2-brand" href="/" aria-label={settings.identity.siteName + "، صفحهٔ نخست"}>
            <img src={settings.identity.logoUrl} width="48" height="48" alt="" />
            <span>
              <strong>{settings.identity.siteName}</strong>
              <small>{settings.identity.tagline}</small>
            </span>
          </a>

          <a href="/" className="az2-basmala" aria-label="صفحهٔ نخست">
            <img src={settings.media.bismillahUrl} alt="بسم الله الرحمن الرحیم" width="854" height="1000" />
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
            {settings.navigation.primary.filter((item) => item.enabled).map((item) => (
              <a href={item.href} aria-current={item.href === "/" ? (pathname === "/" ? "page" : undefined) : isCurrent(item.href)} key={item.href}>
                {item.label}
              </a>
            ))}
            <details className="az2-more">
              <summary>بیشتر</summary>
              <div>
                {settings.navigation.more.filter((item) => item.enabled).map((item) => (
                  <a href={item.href} aria-current={isCurrent(item.href)} key={item.href}>{item.label}</a>
                ))}
                {extraPages.slice(0, 6).map((page) => (
                  <a href={"/pages/" + page.slug} aria-current={isCurrent("/pages/" + page.slug)} key={page.slug}>
                    {page.title}
                  </a>
                ))}
              </div>
            </details>
          </nav>
        </div>
      </header>
    </>
  );
}
