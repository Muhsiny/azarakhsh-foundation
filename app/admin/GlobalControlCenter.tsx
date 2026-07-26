"use client";

import { useEffect, useState } from "react";
import { defaultSiteSettings, type SiteSettings } from "../site-settings";

const bodyFonts = [
  { label: "نسخ فارسی خوانا", value: "var(--font-naskh), 'Noto Naskh Arabic', Tahoma, sans-serif" },
  { label: "بی‌نازنین", value: "'B Nazanin', BNazanin, Nazanin, var(--font-naskh), Tahoma, sans-serif" },
  { label: "Tahoma فارسی", value: "Tahoma, Arial, sans-serif" },
];

const titleFonts = [
  { label: "نستعلیق", value: "var(--font-nastaliq), 'Noto Nastaliq Urdu', serif" },
  { label: "نسخ رسمی", value: "var(--font-naskh), 'Noto Naskh Arabic', serif" },
  { label: "بی‌نازنین", value: "'B Nazanin', BNazanin, Nazanin, var(--font-naskh), serif" },
];

function readTitleFont(css: string) {
  const match = css.match(/--managed-title-font:\s*([^;]+);/);
  return match?.[1]?.trim() || titleFonts[0].value;
}

function writeTitleFont(css: string, value: string) {
  const rule = `:root { --managed-title-font: ${value}; }`;
  const cleaned = css
    .replace(/\/\* AZARAKHSH_FONT_START \*\/[\s\S]*?\/\* AZARAKHSH_FONT_END \*\//g, "")
    .trim();
  return `${cleaned}${cleaned ? "\n\n" : ""}/* AZARAKHSH_FONT_START */\n${rule}\n/* AZARAKHSH_FONT_END */`;
}

export default function GlobalControlCenter() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [titleFont, setTitleFont] = useState(titleFonts[0].value);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (response) => {
        const data = (await response.json()) as { settings?: SiteSettings; error?: string };
        if (!response.ok || !data.settings) throw new Error(data.error || "تنظیمات دریافت نشد.");
        setSettings(data.settings);
        setTitleFont(readTitleFont(data.settings.design.customCss));
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  function group<K extends keyof SiteSettings>(key: K, patch: Partial<SiteSettings[K]>) {
    setSettings((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const next = {
      ...settings,
      design: {
        ...settings.design,
        customCss: writeTitleFont(settings.design.customCss, titleFont),
      },
    };
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ settings: next }),
    });
    const data = (await response.json()) as { settings?: SiteSettings; error?: string };
    if (!response.ok || !data.settings) setMessage(data.error || "ذخیره انجام نشد.");
    else {
      setSettings(data.settings);
      setMessage("هیدر، فوتر و فونت‌ها ذخیره و روی سایت اعمال شد.");
    }
    setSaving(false);
  }

  if (loading) return <p className="studio-loading">کنترل‌های عمومی در حال بارگذاری است...</p>;

  return (
    <section className="site-studio global-control-center">
      <div className="studio-heading">
        <div>
          <p className="section-kicker">دسترسی مستقیم مالک</p>
          <h2>مدیریت هیدر، فوتر و فونت</h2>
          <p>این بخش برای تغییر مستقیم هویت، منو، رنگ سبز، نوشته‌های پابرگ و فونت ساخته شده است.</p>
        </div>
        <button className="button button-dark" disabled={saving} onClick={() => void save()} type="button">
          {saving ? "در حال ذخیره..." : "ذخیره و انتشار"}
        </button>
      </div>
      {message && <p className="admin-message">{message}</p>}

      <div className="studio-sections">
        <details open>
          <summary>هویت و هیدر</summary>
          <div className="studio-fields">
            <label>نام سایت<input value={settings.identity.siteName} onChange={(e) => group("identity", { siteName: e.target.value })} /></label>
            <label>شعار<input value={settings.identity.tagline} onChange={(e) => group("identity", { tagline: e.target.value })} /></label>
            <label className="studio-wide">نشانی لوگو<input dir="ltr" value={settings.identity.logoUrl} onChange={(e) => group("identity", { logoUrl: e.target.value })} /></label>
            {(Object.keys(settings.navigation) as Array<keyof SiteSettings["navigation"]>).map((key) => (
              <label key={key}>متن منو: {key}<input value={settings.navigation[key]} onChange={(e) => group("navigation", { [key]: e.target.value })} /></label>
            ))}
            <label>سبز اصلی<span className="color-control"><input type="color" value={settings.colors.primary} onChange={(e) => group("colors", { primary: e.target.value })} /><input dir="ltr" value={settings.colors.primary} onChange={(e) => group("colors", { primary: e.target.value })} /></span></label>
            <label>سبز تیره هیدر و فوتر<span className="color-control"><input type="color" value={settings.colors.dark} onChange={(e) => group("colors", { dark: e.target.value })} /><input dir="ltr" value={settings.colors.dark} onChange={(e) => group("colors", { dark: e.target.value })} /></span></label>
          </div>
        </details>

        <details open>
          <summary>فونت‌های سایت</summary>
          <div className="studio-fields">
            <label>فونت متن‌ها<select value={settings.design.fontFamily} onChange={(e) => group("design", { fontFamily: e.target.value })}>{bodyFonts.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}</select></label>
            <label>فونت عنوان‌ها<select value={titleFont} onChange={(e) => setTitleFont(e.target.value)}>{titleFonts.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}</select></label>
            <p className="studio-wide">نستعلیق برای عنوان‌ها و نسخ/بی‌نازنین برای متن‌های طولانی تنظیم می‌شود تا ظاهر طبیعی و خوانا بماند.</p>
          </div>
        </details>

        <details open>
          <summary>فوتر و اطلاعات تماس</summary>
          <div className="studio-fields">
            <label className="studio-wide">متن معرفی فوتر<textarea rows={3} value={settings.footer.mission} onChange={(e) => group("footer", { mission: e.target.value })} /></label>
            <label className="studio-wide">متن حق نشر<input value={settings.footer.copyright} onChange={(e) => group("footer", { copyright: e.target.value })} /></label>
            <label>ایمیل<input dir="ltr" value={settings.contact.email} onChange={(e) => group("contact", { email: e.target.value })} /></label>
            <label>تلفن<input dir="ltr" value={settings.contact.phone} onChange={(e) => group("contact", { phone: e.target.value })} /></label>
            <label>نشانی<input value={settings.contact.address} onChange={(e) => group("contact", { address: e.target.value })} /></label>
            <label>شبکه یا سایت رسمی<input dir="ltr" value={settings.contact.website} onChange={(e) => group("contact", { website: e.target.value })} /></label>
          </div>
        </details>
      </div>
    </section>
  );
}
