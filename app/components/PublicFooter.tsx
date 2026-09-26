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
              <span>{settings.identity.tagline}</span>
            </div>
          </div>
          <p>{settings.footer.mission}</p>
          <a className="az2-footer-email" href={"mailto:" + settings.contact.email} dir="ltr">
            {settings.contact.email}
          </a>
        </div>

        <nav className="az2-footer-links" aria-label="پیوندهای پایانی">
          {settings.navigation.footer.filter((item) => item.enabled).map((item) => (
            <a href={item.href} key={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="az2-footer-motto">
          <span>{settings.footer.mottoKicker}</span>
          <strong>{settings.footer.mottoTitle}</strong>
          <p>{settings.footer.mottoText}</p>
        </div>
      </div>

      <div className="az-container az2-footer-bottom">
        <span>{settings.footer.copyright}</span>
        <span>{settings.identity.siteName}</span>
      </div>
    </footer>
  );
}
