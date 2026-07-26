"use client";

import { useEffect, useState } from "react";
import {
  defaultSiteSettings,
  type ArchiveItem,
  type LinkCard,
  type SectionKey,
  type SiteSettings,
} from "../site-settings";

const sectionLabels: Record<SectionKey, string> = {
  mission: "معرفی بنیاد",
  council: "شورای اتفاق",
  timeline: "خط تاریخی",
  leader: "پروندهٔ آیت‌الله بهشتی",
  archive: "آرشیو پژوهش",
  standards: "اعتبار علمی",
  method: "روش تحقیق",
  contribute: "همکاری و ثبت روایت",
};

function newCard(): LinkCard {
  return { id: crypto.randomUUID(), title: "عنوان تازه", text: "توضیح این بخش", href: "#" };
}

function CardEditor({
  title,
  items,
  onChange,
  showHref = true,
}: {
  title: string;
  items: LinkCard[];
  onChange: (items: LinkCard[]) => void;
  showHref?: boolean;
}) {
  function update(index: number, patch: Partial<LinkCard>) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }
  function move(index: number, direction: -1 | 1) {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return (
    <div className="collection-editor studio-wide">
      <div className="collection-heading">
        <strong>{title}</strong>
        <button type="button" onClick={() => onChange([...items, newCard()])}>+ افزودن مورد</button>
      </div>
      {items.map((item, index) => (
        <article className="editable-item" key={item.id}>
          <div className="item-toolbar">
            <span>مورد {index + 1}</span>
            <button type="button" disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
            <button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)}>↓</button>
            <button className="danger-button" type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>حذف</button>
          </div>
          <label>عنوان<input value={item.title} onChange={(event) => update(index, { title: event.target.value })} /></label>
          <label>توضیح<textarea rows={2} value={item.text} onChange={(event) => update(index, { text: event.target.value })} /></label>
          {showHref && <label>پیوند<input dir="ltr" value={item.href} onChange={(event) => update(index, { href: event.target.value })} /></label>}
          {Object.prototype.hasOwnProperty.call(item, "label") && <label>متن دکمه<input value={item.label || ""} onChange={(event) => update(index, { label: event.target.value })} /></label>}
        </article>
      ))}
    </div>
  );
}

function ArchiveEditor({ items, onChange }: { items: ArchiveItem[]; onChange: (items: ArchiveItem[]) => void }) {
  function update(index: number, patch: Partial<ArchiveItem>) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }
  function move(index: number, direction: -1 | 1) {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return (
    <div className="collection-editor studio-wide">
      <div className="collection-heading">
        <strong>پرونده‌های نمایشی صفحهٔ نخست</strong>
        <button type="button" onClick={() => onChange([...items, { id: crypto.randomUUID(), category: "موضوع", title: "پروندهٔ تازه", text: "شرح پرونده", code: `AZ/NEW/${items.length + 1}`, status: "در حال بررسی" }])}>+ افزودن پرونده</button>
      </div>
      {items.map((item, index) => (
        <article className="editable-item" key={item.id}>
          <div className="item-toolbar">
            <span>{item.code}</span>
            <button type="button" disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
            <button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)}>↓</button>
            <button className="danger-button" type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>حذف</button>
          </div>
          <label>عنوان<input value={item.title} onChange={(event) => update(index, { title: event.target.value })} /></label>
          <label>موضوع<input value={item.category} onChange={(event) => update(index, { category: event.target.value })} /></label>
          <label>کد<input dir="ltr" value={item.code} onChange={(event) => update(index, { code: event.target.value })} /></label>
          <label>وضعیت<input value={item.status} onChange={(event) => update(index, { status: event.target.value })} /></label>
          <label>خلاصه<textarea rows={3} value={item.text} onChange={(event) => update(index, { text: event.target.value })} /></label>
        </article>
      ))}
    </div>
  );
}

export default function SiteStudio() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (response) => {
        const data = (await response.json()) as { settings?: SiteSettings; error?: string };
        if (!response.ok || !data.settings) throw new Error(data.error ?? "تنظیمات دریافت نشد.");
        setSettings(data.settings);
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  function setGroup<K extends keyof SiteSettings>(group: K, values: Partial<SiteSettings[K]>) {
    setSettings((current) => ({ ...current, [group]: { ...current[group], ...values } }));
  }

  function setCards(section: "mission" | "council" | "leader" | "timeline" | "standards" | "method" | "contribute", field: string, items: LinkCard[]) {
    setSettings((current) => ({ ...current, [section]: { ...current[section], [field]: items } } as SiteSettings));
  }

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ settings }) });
    const data = (await response.json()) as { settings?: SiteSettings; error?: string };
    if (!response.ok || !data.settings) setMessage(data.error ?? "ذخیرهٔ تنظیمات انجام نشد.");
    else {
      setSettings(data.settings);
      setMessage("همهٔ تغییرات ذخیره و روی سایت اعمال شد.");
      setPreviewKey((key) => key + 1);
    }
    setSaving(false);
  }

  async function uploadImage(file: File, target: "logo" | "leader" | "council") {
    setSaving(true);
    setMessage("تصویر در حال بارگذاری است...");
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) setMessage(data.error ?? "بارگذاری انجام نشد.");
    else {
      if (target === "logo") setGroup("identity", { logoUrl: data.url });
      if (target === "leader") setGroup("media", { leaderImageUrl: data.url });
      if (target === "council") setGroup("media", { councilEmblemUrl: data.url });
      setMessage("تصویر آماده است؛ اکنون «ذخیرهٔ همهٔ تغییرات» را بزنید.");
    }
    setSaving(false);
  }

  function moveSection(index: number, direction: -1 | 1) {
    const next = [...settings.sectionOrder];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSettings((current) => ({ ...current, sectionOrder: next }));
  }

  if (loading) return <p className="studio-loading">تنظیمات سایت در حال دریافت است...</p>;

  return (
    <section className="site-studio">
      <div className="studio-heading">
        <div>
          <p className="section-kicker">کنترل محتوایی و بصری</p>
          <h2>استودیوی کامل بنیاد آذرخش</h2>
          <p>تمام متن‌ها، تصاویر، کارت‌ها، ترتیب بخش‌ها، رنگ، اندازه، فاصله و پیوندها را بدون کدنویسی مدیریت کنید.</p>
        </div>
        <div className="studio-actions">
          <button className="quiet-button" type="button" onClick={() => setPreviewKey((key) => key + 1)}>تازه‌سازی پیش‌نمایش</button>
          <button className="quiet-button" type="button" onClick={() => { if (window.confirm("تمام تنظیمات به نسخهٔ اصلی برگردد؟")) setSettings(defaultSiteSettings); }}>بازگردانی نسخهٔ اصلی</button>
          <button className="button button-dark" disabled={saving} type="button" onClick={() => void saveSettings()}>{saving ? "در حال ذخیره..." : "ذخیرهٔ همهٔ تغییرات"}</button>
        </div>
      </div>
      {message && <p className="admin-message">{message}</p>}

      <details className="studio-preview">
        <summary>پیش‌نمایش زندهٔ سایت</summary>
        <iframe key={previewKey} src="/" title="پیش‌نمایش سایت بنیاد آذرخش" />
      </details>

      <div className="studio-sections">
        <details open>
          <summary>هویت، لوگو و تصاویر تاریخی</summary>
          <div className="studio-fields">
            <label>نام سایت<input value={settings.identity.siteName} onChange={(event) => setGroup("identity", { siteName: event.target.value })} /></label>
            <label>شعار<input value={settings.identity.tagline} onChange={(event) => setGroup("identity", { tagline: event.target.value })} /></label>
            {([
              ["logo", "لوگوی بنیاد", settings.identity.logoUrl],
              ["leader", "تصویر آیت‌الله بهشتی", settings.media.leaderImageUrl],
              ["council", "نشان شورای اتفاق", settings.media.councilEmblemUrl],
            ] as const).map(([target, label, url]) => (
              <div className="media-editor studio-wide" key={target}>
                <img src={url} alt={label} />
                <div>
                  <strong>{label}</strong>
                  <input dir="ltr" value={url} onChange={(event) => target === "logo" ? setGroup("identity", { logoUrl: event.target.value }) : setGroup("media", { [target === "leader" ? "leaderImageUrl" : "councilEmblemUrl"]: event.target.value })} />
                  <label className="upload-button">تعویض تصویر<input accept="image/jpeg,image/png,image/webp,image/gif" type="file" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file, target); }} /></label>
                </div>
              </div>
            ))}
            <label>توضیح تصویر رهبر<input value={settings.media.leaderImageAlt} onChange={(event) => setGroup("media", { leaderImageAlt: event.target.value })} /></label>
            <label>عنوان نشان تاریخی<input value={settings.media.councilEmblemAlt} onChange={(event) => setGroup("media", { councilEmblemAlt: event.target.value })} /></label>
            <label className="studio-wide">شرح سند تصویری<textarea rows={2} value={settings.media.councilEmblemCaption} onChange={(event) => setGroup("media", { councilEmblemCaption: event.target.value })} /></label>
          </div>
        </details>

        <details>
          <summary>منو و صفحهٔ آغازین</summary>
          <div className="studio-fields">
            {(Object.keys(settings.navigation) as Array<keyof SiteSettings["navigation"]>).map((key) => <label key={key}>متن {key}<input value={settings.navigation[key]} onChange={(event) => setGroup("navigation", { [key]: event.target.value })} /></label>)}
            <label>عبارت بالای عنوان<input value={settings.hero.eyebrow} onChange={(event) => setGroup("hero", { eyebrow: event.target.value })} /></label>
            <label>واژهٔ طلایی<input value={settings.hero.highlightedWord} onChange={(event) => setGroup("hero", { highlightedWord: event.target.value })} /></label>
            <label className="studio-wide">عنوان اصلی<textarea rows={2} value={settings.hero.title} onChange={(event) => setGroup("hero", { title: event.target.value })} /></label>
            <label className="studio-wide">متن معرفی<textarea rows={4} value={settings.hero.description} onChange={(event) => setGroup("hero", { description: event.target.value })} /></label>
            <label>دکمهٔ نخست<input value={settings.hero.primaryButton} onChange={(event) => setGroup("hero", { primaryButton: event.target.value })} /></label>
            <label>دکمهٔ دوم<input value={settings.hero.secondaryButton} onChange={(event) => setGroup("hero", { secondaryButton: event.target.value })} /></label>
            <label className="studio-wide">اصل پژوهشی<input value={settings.hero.principle} onChange={(event) => setGroup("hero", { principle: event.target.value })} /></label>
          </div>
        </details>

        <details>
          <summary>معرفی بنیاد و کارت‌های اصلی</summary>
          <div className="studio-fields">
            <label>عبارت کوچک<input value={settings.mission.kicker} onChange={(event) => setGroup("mission", { kicker: event.target.value })} /></label>
            <label className="studio-wide">عنوان<input value={settings.mission.title} onChange={(event) => setGroup("mission", { title: event.target.value })} /></label>
            <label className="studio-wide">متن<textarea rows={3} value={settings.mission.text} onChange={(event) => setGroup("mission", { text: event.target.value })} /></label>
            <CardEditor title="کارت‌های معرفی" items={settings.mission.cards} onChange={(items) => setCards("mission", "cards", items)} />
          </div>
        </details>

        <details>
          <summary>پروندهٔ شورای اتفاق</summary>
          <div className="studio-fields">
            <label>عبارت کوچک<input value={settings.council.kicker} onChange={(event) => setGroup("council", { kicker: event.target.value })} /></label>
            <label className="studio-wide">عنوان<input value={settings.council.title} onChange={(event) => setGroup("council", { title: event.target.value })} /></label>
            <label className="studio-wide">متن<textarea rows={4} value={settings.council.text} onChange={(event) => setGroup("council", { text: event.target.value })} /></label>
            <label>عنوان مرکز نمودار<input value={settings.council.mapTitle} onChange={(event) => setGroup("council", { mapTitle: event.target.value })} /></label>
            <label>وضعیت پرونده<input value={settings.council.mapStatus} onChange={(event) => setGroup("council", { mapStatus: event.target.value })} /></label>
            <CardEditor title="محورهای نمودار — چهار مورد نخست نمایش داده می‌شود" items={settings.council.axes} onChange={(items) => setCards("council", "axes", items)} showHref={false} />
          </div>
        </details>

        <details>
          <summary>خط تاریخی</summary>
          <div className="studio-fields">
            <label>عبارت کوچک<input value={settings.timeline.kicker} onChange={(event) => setGroup("timeline", { kicker: event.target.value })} /></label>
            <label className="studio-wide">عنوان<input value={settings.timeline.title} onChange={(event) => setGroup("timeline", { title: event.target.value })} /></label>
            <label className="studio-wide">توضیح<textarea rows={3} value={settings.timeline.text} onChange={(event) => setGroup("timeline", { text: event.target.value })} /></label>
            <CardEditor title="ایستگاه‌های تاریخی" items={settings.timeline.items} onChange={(items) => setCards("timeline", "items", items)} showHref={false} />
          </div>
        </details>

        <details>
          <summary>آیت‌الله بهشتی: معرفی، محورها و گنجینه</summary>
          <div className="studio-fields">
            <label>عبارت کوچک<input value={settings.leader.kicker} onChange={(event) => setGroup("leader", { kicker: event.target.value })} /></label>
            <label className="studio-wide">عنوان<input value={settings.leader.title} onChange={(event) => setGroup("leader", { title: event.target.value })} /></label>
            <label className="studio-wide">معرفی<textarea rows={3} value={settings.leader.lead} onChange={(event) => setGroup("leader", { lead: event.target.value })} /></label>
            <label className="studio-wide">نقل‌قول<textarea rows={3} value={settings.leader.quote} onChange={(event) => setGroup("leader", { quote: event.target.value })} /></label>
            <label>منبع نقل‌قول<input value={settings.leader.quoteSource} onChange={(event) => setGroup("leader", { quoteSource: event.target.value })} /></label>
            <CardEditor title="محورهای شناخت رهبر" items={settings.leader.inquiries} onChange={(items) => setCards("leader", "inquiries", items)} />
            <CardEditor title="آثار، سخنرانی‌ها، اندیشه‌ها و نگارخانه" items={settings.leader.collections} onChange={(items) => setCards("leader", "collections", items)} />
          </div>
        </details>

        <details>
          <summary>آرشیو و پرونده‌های پژوهشی</summary>
          <div className="studio-fields">
            <label>عبارت کوچک<input value={settings.archive.kicker} onChange={(event) => setGroup("archive", { kicker: event.target.value })} /></label>
            <label>عنوان<input value={settings.archive.title} onChange={(event) => setGroup("archive", { title: event.target.value })} /></label>
            <label>متن جست‌وجو<input value={settings.archive.searchPlaceholder} onChange={(event) => setGroup("archive", { searchPlaceholder: event.target.value })} /></label>
            <ArchiveEditor items={settings.archive.items} onChange={(items) => setGroup("archive", { items })} />
          </div>
        </details>

        {([[
          "standards", "اعتبار علمی و اخلاق انتشار", "items"
        ], ["method", "روش تحقیق", "items"], ["contribute", "همکاری و ثبت روایت", "types"]] as const).map(([group, label, field]) => (
          <details key={group}>
            <summary>{label}</summary>
            <div className="studio-fields">
              <label>عبارت کوچک<input value={settings[group].kicker} onChange={(event) => setGroup(group, { kicker: event.target.value })} /></label>
              <label className="studio-wide">عنوان<input value={settings[group].title} onChange={(event) => setGroup(group, { title: event.target.value })} /></label>
              {group !== "method" && <label className="studio-wide">متن<textarea rows={3} value={settings[group].text} onChange={(event) => setGroup(group, { text: event.target.value })} /></label>}
              {group === "contribute" && <label>متن دکمه<input value={settings.contribute.button} onChange={(event) => setGroup("contribute", { button: event.target.value })} /></label>}
              <CardEditor title={`موارد بخش ${label}`} items={settings[group][field]} onChange={(items) => setCards(group, field, items)} showHref={false} />
            </div>
          </details>
        ))}

        <details>
          <summary>ترتیب و نمایش بخش‌ها</summary>
          <div className="section-order-editor">
            {settings.sectionOrder.map((key, index) => (
              <div key={key}>
                <span>{index + 1}. {sectionLabels[key]}</span>
                <label><input type="checkbox" checked={settings.visibility[key]} onChange={(event) => setGroup("visibility", { [key]: event.target.checked })} /> نمایش</label>
                <button type="button" disabled={index === 0} onClick={() => moveSection(index, -1)}>↑</button>
                <button type="button" disabled={index === settings.sectionOrder.length - 1} onClick={() => moveSection(index, 1)}>↓</button>
              </div>
            ))}
          </div>
        </details>

        <details>
          <summary>طراحی: رنگ، فونت، اندازه و فاصله</summary>
          <div className="studio-fields color-fields">
            {(["primary", "dark", "gold", "paper"] as const).map((key) => <label key={key}>{key}<span className="color-control"><input type="color" value={settings.colors[key]} onChange={(event) => setGroup("colors", { [key]: event.target.value })} /><input dir="ltr" value={settings.colors[key]} onChange={(event) => setGroup("colors", { [key]: event.target.value })} /></span></label>)}
            <label className="studio-wide">فونت<input dir="ltr" value={settings.design.fontFamily} onChange={(event) => setGroup("design", { fontFamily: event.target.value })} /></label>
            <label>چیدمان عنوان<select value={settings.design.heroAlignment} onChange={(event) => setGroup("design", { heroAlignment: event.target.value as SiteSettings["design"]["heroAlignment"] })}><option value="right">راست</option><option value="center">مرکز</option></select></label>
            <label>سبک سربرگ<select value={settings.design.headerStyle} onChange={(event) => setGroup("design", { headerStyle: event.target.value as SiteSettings["design"]["headerStyle"] })}><option value="solid">یک‌دست</option><option value="glass">شیشه‌ای</option></select></label>
            <label>پرداخت تصاویر<select value={settings.design.imageStyle} onChange={(event) => setGroup("design", { imageStyle: event.target.value as SiteSettings["design"]["imageStyle"] })}><option value="archival">آرشیوی</option><option value="natural">طبیعی</option><option value="monochrome">تک‌رنگ تاریخی</option></select></label>
            <label>تراکم<select value={settings.design.density} onChange={(event) => setGroup("design", { density: event.target.value as SiteSettings["design"]["density"] })}><option value="compact">فشرده</option><option value="balanced">متعادل</option><option value="spacious">باز</option></select></label>
            <label>اندازهٔ عنوان‌ها: {settings.design.headingScale.toFixed(2)}<input type="range" min="0.8" max="1.25" step="0.05" value={settings.design.headingScale} onChange={(event) => setGroup("design", { headingScale: Number(event.target.value) })} /></label>
            <label>فاصلهٔ بخش‌ها: {settings.design.sectionSpacing.toFixed(2)}<input type="range" min="0.75" max="1.35" step="0.05" value={settings.design.sectionSpacing} onChange={(event) => setGroup("design", { sectionSpacing: Number(event.target.value) })} /></label>
            <label>عرض سایت: {settings.design.contentWidth}px<input type="range" min="1100" max="1800" step="20" value={settings.design.contentWidth} onChange={(event) => setGroup("design", { contentWidth: Number(event.target.value) })} /></label>
            <label>گردی کارت‌ها: {settings.design.cardRadius}px<input type="range" min="0" max="32" step="2" value={settings.design.cardRadius} onChange={(event) => setGroup("design", { cardRadius: Number(event.target.value) })} /></label>
            <label className="studio-wide">CSS اختصاصی<textarea className="code-editor" dir="ltr" rows={9} value={settings.design.customCss} onChange={(event) => setGroup("design", { customCss: event.target.value })} /></label>
          </div>
        </details>

        <details>
          <summary>پابرگ</summary>
          <div className="studio-fields">
            <label className="studio-wide">معرفی بنیاد<textarea rows={3} value={settings.footer.mission} onChange={(event) => setGroup("footer", { mission: event.target.value })} /></label>
            <label className="studio-wide">حق نشر<input value={settings.footer.copyright} onChange={(event) => setGroup("footer", { copyright: event.target.value })} /></label>
          </div>
        </details>
      </div>
    </section>
  );
}
