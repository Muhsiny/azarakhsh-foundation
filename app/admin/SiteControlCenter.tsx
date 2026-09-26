"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "../site-settings";

type Path =
  | "identity.logoUrl"
  | "media.bismillahUrl"
  | "media.leaderImageUrl"
  | "media.councilEmblemUrl"
  | "media.heroFlagUrl";

export default function SiteControlCenter() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("در حال دریافت تنظیمات...");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-settings", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as { settings?: SiteSettings; error?: string };
        if (!response.ok || !data.settings) throw new Error(data.error || "تنظیمات دریافت نشد.");
        setSettings(data.settings);
        setRaw(JSON.stringify(data.settings, null, 2));
        setMessage("");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "تنظیمات دریافت نشد."));
  }, []);

  function sync(next: SiteSettings) {
    setSettings(next);
    setRaw(JSON.stringify(next, null, 2));
  }

  async function upload(path: Path, file: File) {
    const form = new FormData();
    form.append("file", file);
    setMessage("فایل در حال بارگذاری است...");
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await response.json() as { url?: string; error?: string };
    if (!response.ok || !data.url || !settings) {
      setMessage(data.error || "بارگذاری انجام نشد.");
      return;
    }
    const next = structuredClone(settings);
    const [group, key] = path.split(".") as [keyof SiteSettings, string];
    (next[group] as unknown as Record<string, unknown>)[key] = data.url;
    sync(next);
    setMessage("فایل آماده شد؛ برای اعمال نهایی «ذخیره تنظیمات» را بزنید.");
  }

  async function save(next = settings) {
    if (!next) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ settings: next }),
    });
    const data = await response.json() as { settings?: SiteSettings; error?: string };
    if (!response.ok || !data.settings) {
      setMessage(data.error || "ذخیره انجام نشد.");
    } else {
      sync(data.settings);
      setMessage("تنظیمات سایت ذخیره شد.");
    }
    setSaving(false);
  }

  function applyRaw() {
    try {
      const next = JSON.parse(raw) as SiteSettings;
      sync(next);
      void save(next);
    } catch {
      setMessage("JSON معتبر نیست.");
    }
  }

  if (!settings) {
    return <section className="site-studio"><p>{message}</p></section>;
  }

  return (
    <section className="site-studio">
      <div className="studio-heading">
        <div>
          <p className="section-kicker">کنترل کامل مالک</p>
          <h2>هویت، ظاهر و متن‌های کلیدی سایت</h2>
          <p>تغییرات این بخش مستقیم در D1 ذخیره می‌شود و برای تغییرهای عادی نیازی به GitHub یا Deploy دستی نیست.</p>
        </div>
        <button className="button button-dark" disabled={saving} onClick={() => void save()} type="button">
          {saving ? "در حال ذخیره..." : "ذخیرهٔ تنظیمات"}
        </button>
      </div>

      {message && <p className="admin-message">{message}</p>}

      <div className="admin-grid">
        <div className="editor-card">
          <h3>هویت و ارتباط</h3>
          <label>نام بنیاد<input value={settings.identity.siteName} onChange={(e) => sync({ ...settings, identity: { ...settings.identity, siteName: e.target.value } })} /></label>
          <label>زیرعنوان هدر<input value={settings.identity.tagline} onChange={(e) => sync({ ...settings, identity: { ...settings.identity, tagline: e.target.value } })} /></label>
          <label>ایمیل<input dir="ltr" value={settings.contact.email} onChange={(e) => sync({ ...settings, contact: { email: e.target.value } })} /></label>
          <label>متن مأموریت فوتر<textarea rows={3} value={settings.footer.mission} onChange={(e) => sync({ ...settings, footer: { ...settings.footer, mission: e.target.value } })} /></label>
          <label>عنوان شعار فوتر<input value={settings.footer.mottoTitle} onChange={(e) => sync({ ...settings, footer: { ...settings.footer, mottoTitle: e.target.value } })} /></label>
          <label>متن شعار فوتر<textarea rows={3} value={settings.footer.mottoText} onChange={(e) => sync({ ...settings, footer: { ...settings.footer, mottoText: e.target.value } })} /></label>
          <label>حقوق نشر<input value={settings.footer.copyright} onChange={(e) => sync({ ...settings, footer: { ...settings.footer, copyright: e.target.value } })} /></label>
        </div>

        <div className="editor-card">
          <h3>رنگ و چیدمان</h3>
          {(["primary","dark","gold","paper"] as const).map((key) => (
            <label key={key}>{key}<input dir="ltr" type="text" value={settings.colors[key]} onChange={(e) => sync({ ...settings, colors: { ...settings.colors, [key]: e.target.value } })} /></label>
          ))}
          <label>عرض محتوای دسکتاپ
            <input type="number" min="760" max="1600" value={settings.design.contentWidth} onChange={(e) => sync({ ...settings, design: { contentWidth: Number(e.target.value) || 1180 } })} />
          </label>
        </div>
      </div>

      <div className="admin-grid">
        <div className="editor-card">
          <h3>تصاویر اصلی</h3>
          {([
            ["identity.logoUrl", "لوگوی بنیاد", settings.identity.logoUrl],
            ["media.bismillahUrl", "بسم‌الله", settings.media.bismillahUrl],
            ["media.leaderImageUrl", "تصویر آیت‌الله بهشتی", settings.media.leaderImageUrl],
            ["media.councilEmblemUrl", "نشان شورای اتفاق", settings.media.councilEmblemUrl],
            ["media.heroFlagUrl", "تصویر/پرچم کاور صفحهٔ نخست", settings.media.heroFlagUrl],
          ] as Array<[Path,string,string]>).map(([path,label,value]) => (
            <div className="cover-control" key={path}>
              <label>{label}<input dir="ltr" value={value} onChange={(e) => {
                const next = structuredClone(settings);
                const [group,key] = path.split(".") as [keyof SiteSettings,string];
                (next[group] as unknown as Record<string,unknown>)[key] = e.target.value;
                sync(next);
              }} /></label>
              <label className="upload-button">بارگذاری فایل
                <input type="file" accept="image/*" onChange={(e) => { const file=e.target.files?.[0]; if(file) void upload(path,file); }} />
              </label>
            </div>
          ))}
        </div>

        <div className="editor-card">
          <h3>صفحهٔ نخست</h3>
          <label>بالانویس<input value={settings.home.eyebrow} onChange={(e) => sync({ ...settings, home: { ...settings.home, eyebrow: e.target.value } })} /></label>
          <label>عنوان اصلی<input value={settings.home.title} onChange={(e) => sync({ ...settings, home: { ...settings.home, title: e.target.value } })} /></label>
          <label>تأکید عنوان<input value={settings.home.emphasis} onChange={(e) => sync({ ...settings, home: { ...settings.home, emphasis: e.target.value } })} /></label>
          <label>توضیح اصلی<textarea rows={4} value={settings.home.description} onChange={(e) => sync({ ...settings, home: { ...settings.home, description: e.target.value } })} /></label>
          <label>عنوان پروندهٔ رهبر<input value={settings.home.leaderTitle} onChange={(e) => sync({ ...settings, home: { ...settings.home, leaderTitle: e.target.value } })} /></label>
          <label>متن پروندهٔ رهبر<input value={settings.home.leaderText} onChange={(e) => sync({ ...settings, home: { ...settings.home, leaderText: e.target.value } })} /></label>
          <label>عنوان پروندهٔ شورا<input value={settings.home.councilTitle} onChange={(e) => sync({ ...settings, home: { ...settings.home, councilTitle: e.target.value } })} /></label>
          <label>متن پروندهٔ شورا<input value={settings.home.councilText} onChange={(e) => sync({ ...settings, home: { ...settings.home, councilText: e.target.value } })} /></label>
        </div>
      </div>

      <details className="editor-card">
        <summary>کنترل پیشرفتهٔ JSON — تمام تنظیمات</summary>
        <p>برای تغییر فیلدهایی که هنوز در فرم بالا نمایش داده نشده‌اند. خطای JSON ذخیره نمی‌شود.</p>
        <textarea className="content-editor" dir="ltr" rows={28} value={raw} onChange={(e) => setRaw(e.target.value)} />
        <button className="button button-dark" type="button" onClick={applyRaw}>اعمال و ذخیرهٔ JSON</button>
      </details>
    </section>
  );
}
