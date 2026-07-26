"use client";

import { useEffect, useState } from "react";
import {
  defaultSiteSettings,
  type SiteSettings,
} from "../site-settings";

const visibilityLabels: Record<keyof SiteSettings["visibility"], string> = {
  mission: "معرفی بنیاد",
  council: "شورای اتفاق",
  timeline: "خط پژوهش",
  leader: "پروندهٔ آیت‌الله بهشتی",
  archive: "آرشیو پژوهش",
  method: "روش تحقیق",
  contribute: "همکاری و ثبت روایت",
};

export default function SiteStudio() {
  const [settings, setSettings] =
    useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (response) => {
        const data = (await response.json()) as {
          settings?: SiteSettings;
          error?: string;
        };
        if (!response.ok || !data.settings) {
          throw new Error(data.error ?? "تنظیمات دریافت نشد.");
        }
        setSettings(data.settings);
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  function setGroup<K extends keyof SiteSettings>(
    group: K,
    values: Partial<SiteSettings[K]>,
  ) {
    setSettings((current) => ({
      ...current,
      [group]: { ...current[group], ...values },
    }));
  }

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = (await response.json()) as {
      settings?: SiteSettings;
      error?: string;
    };
    if (!response.ok || !data.settings) {
      setMessage(data.error ?? "ذخیرهٔ تنظیمات انجام نشد.");
    } else {
      setSettings(data.settings);
      setMessage("همهٔ تنظیمات سایت ذخیره و فوراً اعمال شد.");
    }
    setSaving(false);
  }

  async function uploadLogo(file: File) {
    setSaving(true);
    setMessage("لوگو در حال بارگذاری است...");
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      setMessage(data.error ?? "بارگذاری لوگو انجام نشد.");
    } else {
      setGroup("identity", { logoUrl: data.url });
      setMessage("لوگو آماده است؛ دکمهٔ «ذخیرهٔ همهٔ تغییرات» را بزنید.");
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="studio-loading">تنظیمات سایت در حال دریافت است...</p>;
  }

  return (
    <section className="site-studio">
      <div className="studio-heading">
        <div>
          <p className="section-kicker">کنترل صفر تا صد</p>
          <h2>استودیوی کامل سایت</h2>
          <p>
            هویت، متن‌ها، منو، رنگ، چیدمان، لوگو، نمایش بخش‌ها و حتی CSS اختصاصی
            را از همین‌جا تغییر دهید.
          </p>
        </div>
        <div className="studio-actions">
          <button
            className="quiet-button"
            onClick={() => {
              if (window.confirm("همهٔ تنظیمات به حالت اصلی برگردد؟")) {
                setSettings(defaultSiteSettings);
                setMessage("حالت اصلی آماده است؛ برای اعمال، ذخیره کنید.");
              }
            }}
            type="button"
          >
            بازگردانی حالت اصلی
          </button>
          <button
            className="button button-dark"
            disabled={saving}
            onClick={() => void saveSettings()}
            type="button"
          >
            {saving ? "در حال ذخیره..." : "ذخیرهٔ همهٔ تغییرات"}
          </button>
        </div>
      </div>

      {message && <p className="admin-message">{message}</p>}

      <div className="studio-sections">
        <details open>
          <summary>هویت و لوگو</summary>
          <div className="studio-fields">
            <label>
              نام سایت
              <input
                value={settings.identity.siteName}
                onChange={(event) =>
                  setGroup("identity", { siteName: event.target.value })
                }
              />
            </label>
            <label>
              شعار کوتاه
              <input
                value={settings.identity.tagline}
                onChange={(event) =>
                  setGroup("identity", { tagline: event.target.value })
                }
              />
            </label>
            <label className="studio-wide">
              آدرس فایل لوگو
              <input
                dir="ltr"
                value={settings.identity.logoUrl}
                onChange={(event) =>
                  setGroup("identity", { logoUrl: event.target.value })
                }
              />
            </label>
            <div className="logo-editor studio-wide">
              <img src={settings.identity.logoUrl} alt="پیش‌نمایش لوگو" />
              <label className="upload-button">
                بارگذاری لوگوی تازه
                <input
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadLogo(file);
                  }}
                  type="file"
                />
              </label>
            </div>
          </div>
        </details>

        <details>
          <summary>منو و دکمهٔ بالای سایت</summary>
          <div className="studio-fields">
            {(Object.keys(settings.navigation) as Array<
              keyof SiteSettings["navigation"]
            >).map((key) => (
              <label key={key}>
                {key === "about"
                  ? "دربارهٔ بنیاد"
                  : key === "council"
                    ? "شورای اتفاق"
                    : key === "leader"
                      ? "آیت‌الله بهشتی"
                      : key === "archive"
                        ? "آرشیو"
                        : key === "publications"
                          ? "نشرها"
                          : key === "contribute"
                            ? "همکاری پژوهشی"
                            : "دکمهٔ نشرها"}
                <input
                  value={settings.navigation[key]}
                  onChange={(event) =>
                    setGroup("navigation", { [key]: event.target.value })
                  }
                />
              </label>
            ))}
          </div>
        </details>

        <details>
          <summary>صفحهٔ آغازین</summary>
          <div className="studio-fields">
            <label>
              عبارت بالای عنوان
              <input
                value={settings.hero.eyebrow}
                onChange={(event) =>
                  setGroup("hero", { eyebrow: event.target.value })
                }
              />
            </label>
            <label>
              واژهٔ طلایی
              <input
                value={settings.hero.highlightedWord}
                onChange={(event) =>
                  setGroup("hero", { highlightedWord: event.target.value })
                }
              />
            </label>
            <label className="studio-wide">
              عنوان اصلی
              <textarea
                rows={2}
                value={settings.hero.title}
                onChange={(event) =>
                  setGroup("hero", { title: event.target.value })
                }
              />
            </label>
            <label className="studio-wide">
              معرفی
              <textarea
                rows={4}
                value={settings.hero.description}
                onChange={(event) =>
                  setGroup("hero", { description: event.target.value })
                }
              />
            </label>
            <label>
              دکمهٔ نخست
              <input
                value={settings.hero.primaryButton}
                onChange={(event) =>
                  setGroup("hero", { primaryButton: event.target.value })
                }
              />
            </label>
            <label>
              دکمهٔ دوم
              <input
                value={settings.hero.secondaryButton}
                onChange={(event) =>
                  setGroup("hero", { secondaryButton: event.target.value })
                }
              />
            </label>
          </div>
        </details>

        {(
          [
            ["mission", "معرفی بنیاد"],
            ["council", "شورای اتفاق"],
            ["leader", "پروندهٔ آیت‌الله بهشتی"],
          ] as const
        ).map(([group, label]) => (
          <details key={group}>
            <summary>{label}</summary>
            <div className="studio-fields">
              <label>
                عبارت کوچک
                <input
                  value={settings[group].kicker}
                  onChange={(event) =>
                    setGroup(group, { kicker: event.target.value })
                  }
                />
              </label>
              <label className="studio-wide">
                عنوان
                <textarea
                  rows={2}
                  value={settings[group].title}
                  onChange={(event) =>
                    setGroup(group, { title: event.target.value })
                  }
                />
              </label>
              <label className="studio-wide">
                {group === "leader" ? "متن معرفی" : "متن اصلی"}
                <textarea
                  rows={4}
                  value={
                    group === "leader"
                      ? settings.leader.lead
                      : settings[group].text
                  }
                  onChange={(event) =>
                    group === "leader"
                      ? setGroup("leader", { lead: event.target.value })
                      : setGroup(group, { text: event.target.value })
                  }
                />
              </label>
              {group === "leader" && (
                <label className="studio-wide">
                  نقل‌قول
                  <textarea
                    rows={3}
                    value={settings.leader.quote}
                    onChange={(event) =>
                      setGroup("leader", { quote: event.target.value })
                    }
                  />
                </label>
              )}
            </div>
          </details>
        ))}

        <details>
          <summary>رنگ، فونت و چیدمان</summary>
          <div className="studio-fields color-fields">
            {(
              [
                ["primary", "سبز اصلی"],
                ["dark", "سبز تیره"],
                ["gold", "طلایی"],
                ["paper", "رنگ زمینه"],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                {label}
                <span className="color-control">
                  <input
                    type="color"
                    value={settings.colors[key]}
                    onChange={(event) =>
                      setGroup("colors", { [key]: event.target.value })
                    }
                  />
                  <input
                    dir="ltr"
                    value={settings.colors[key]}
                    onChange={(event) =>
                      setGroup("colors", { [key]: event.target.value })
                    }
                  />
                </span>
              </label>
            ))}
            <label className="studio-wide">
              خانوادهٔ فونت
              <input
                dir="ltr"
                value={settings.design.fontFamily}
                onChange={(event) =>
                  setGroup("design", { fontFamily: event.target.value })
                }
              />
            </label>
            <label>
              جای متن صفحهٔ آغازین
              <select
                value={settings.design.heroAlignment}
                onChange={(event) =>
                  setGroup("design", {
                    heroAlignment: event.target
                      .value as SiteSettings["design"]["heroAlignment"],
                  })
                }
              >
                <option value="right">راست</option>
                <option value="center">وسط</option>
              </select>
            </label>
            <label>
              فاصلهٔ بخش‌ها
              <select
                value={settings.design.density}
                onChange={(event) =>
                  setGroup("design", {
                    density: event.target
                      .value as SiteSettings["design"]["density"],
                  })
                }
              >
                <option value="compact">فشرده</option>
                <option value="balanced">متعادل</option>
                <option value="spacious">باز</option>
              </select>
            </label>
          </div>
        </details>

        <details>
          <summary>نمایش یا پنهان‌کردن بخش‌ها</summary>
          <div className="visibility-grid">
            {(Object.keys(settings.visibility) as Array<
              keyof SiteSettings["visibility"]
            >).map((key) => (
              <label key={key}>
                <input
                  checked={settings.visibility[key]}
                  onChange={(event) =>
                    setGroup("visibility", { [key]: event.target.checked })
                  }
                  type="checkbox"
                />
                {visibilityLabels[key]}
              </label>
            ))}
          </div>
        </details>

        <details>
          <summary>پابرگ و کد CSS اختصاصی</summary>
          <div className="studio-fields">
            <label className="studio-wide">
              معرفی کوتاه پابرگ
              <textarea
                rows={3}
                value={settings.footer.mission}
                onChange={(event) =>
                  setGroup("footer", { mission: event.target.value })
                }
              />
            </label>
            <label className="studio-wide">
              حق نشر
              <input
                value={settings.footer.copyright}
                onChange={(event) =>
                  setGroup("footer", { copyright: event.target.value })
                }
              />
            </label>
            <label className="studio-wide">
              CSS اختصاصی
              <textarea
                className="code-editor"
                dir="ltr"
                placeholder=".hero { min-height: 650px; }"
                rows={8}
                value={settings.design.customCss}
                onChange={(event) =>
                  setGroup("design", { customCss: event.target.value })
                }
              />
            </label>
          </div>
        </details>
      </div>
    </section>
  );
}
