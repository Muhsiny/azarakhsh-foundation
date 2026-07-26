"use client";

import { useEffect, useState } from "react";
import { defaultSiteSettings, type SiteSettings } from "../site-settings";

const lotusFont = "'B Lotus', 'BLotus', 'Lotus', var(--font-lotus-fallback), var(--font-naskh), Tahoma, serif";
const mitraFont = "'B Mitra', 'BMitra', 'Mitra', var(--font-naskh), Tahoma, serif";

const bodyFonts = [
  { label: "لوتوس", value: lotusFont },
  { label: "میترا", value: mitraFont },
  { label: "نسخ فارسی خوانا", value: "var(--font-naskh), 'Noto Naskh Arabic', Tahoma, sans-serif" },
  { label: "بی‌نازنین", value: "'B Nazanin', BNazanin, Nazanin, var(--font-naskh), Tahoma, sans-serif" },
  { label: "Tahoma فارسی", value: "Tahoma, Arial, sans-serif" },
];

const titleFonts = [
  { label: "لوتوس", value: lotusFont },
  { label: "میترا", value: mitraFont },
  { label: "نستعلیق", value: "var(--font-nastaliq), 'Noto Nastaliq Urdu', serif" },
  { label: "نسخ رسمی", value: "var(--font-naskh), 'Noto Naskh Arabic', serif" },
  { label: "بی‌نازنین", value: "'B Nazanin', BNazanin, Nazanin, var(--font-naskh), serif" },
];

function readManagedFont(css: string, variable: "body" | "title", fallback: string) {
  const pattern = new RegExp(`--managed-${variable}-font:\\s*([^;]+);`);
  return css.match(pattern)?.[1]?.trim() || fallback;
}

function writeManagedFonts(css: string, bodyFont: string, titleFont: string) {
  const rule = `:root {\n  --managed-body-font: ${bodyFont};\n  --managed-title-font: ${titleFont};\n}`;
  const cleaned = css
    .replace(/\/\* AZARAKHSH_FONT_START \*\/[\s\S]*?\/\* AZARAKHSH_FONT_END \*\//g, "")
    .trim();
  return `${cleaned}${cleaned ? "\n\n" : ""}/* AZARAKHSH_FONT_START */\n${rule}\n/* AZARAKHSH_FONT_END */`;
}

export default function GlobalControlCenter() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [bodyFont, setBodyFont] = useState(lotusFont);
  const [titleFont, setTitleFont] = useState(lotusFont);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (response) => {
        const data = (await response.json()) as { settings?: SiteSettings; error?: string };
        if (!response.ok || !data.settings) throw new Error(data.error || "تنظیمات دریافت نشد.");
        setSettings(data.settings);
        setBodyFont(readManagedFont(data.settings.design.customCss, "body", lotusFont));
        setTitleFont(readManagedFont(data.settings.design.customCss, "title", lotusFont));
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
        fontFamily: bodyFont,
        customCss: writeManagedFonts(settings.design.customCss, bodyFont, titleFont),
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
      setMessage("فونت لوتوس/میترا و تنظیمات عمومی ذخیره و روی سایت اعمال شد.");
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
            <label>فونت متن‌ها<select value={bodyFont} onChange={(e) => setBodyFont(e.target.value)}>{bodyFonts.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}</select></label>
            <label>فونت عنوان‌ها<select value={titleFont} onChange={(e) => setTitleFont(e.target.value)}>{titleFonts.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}</select></label>
            <p className="studio-wide">لوتوس اکنون انتخاب نخست است. در دستگاهی که نسخهٔ اصلی لوتوس نصب نباشد، فونت فارسی نزدیک و سازگار به‌صورت خودکار نمایش داده می‌شود.</p>
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
