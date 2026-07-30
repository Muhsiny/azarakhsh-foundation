"use client";

import { useEffect, useState } from "react";

type Health = {
  ok: boolean;
  checks: {
    owner: boolean;
    database: boolean;
    posts: boolean;
    settings: boolean;
    media: boolean;
  };
  errors: string[];
};

const labels: Record<keyof Health["checks"], string> = {
  owner: "دسترسی مالک",
  database: "پایگاه داده D1",
  posts: "ذخیره مطالب",
  settings: "ذخیره تنظیمات",
  media: "آپلود تصویر و فایل",
};

export default function PublishingHealth() {
  const [health, setHealth] = useState<Health | null>(null);
  const [message, setMessage] = useState("در حال بررسی زیرساخت نشر...");

  async function check() {
    setMessage("در حال بررسی زیرساخت نشر...");
    try {
      const response = await fetch("/api/admin/health", { cache: "no-store" });
      const text = await response.text();
      const data = text ? (JSON.parse(text) as Health & { error?: string }) : null;
      if (!response.ok || !data) {
        throw new Error(data?.error || `خطای سرور با کد ${response.status}`);
      }
      setHealth(data);
      setMessage(data.ok ? "تمام اتصال‌های لازم برای نشر فعال است." : "یک یا چند اتصال نشر نیاز به بررسی دارد.");
    } catch (error) {
      setHealth(null);
      setMessage(error instanceof Error ? error.message : "بررسی زیرساخت انجام نشد.");
    }
  }

  useEffect(() => {
    void check();
  }, []);

  return (
    <section className="site-studio">
      <div className="studio-heading">
        <div>
          <p className="section-kicker">آمادگی نشر</p>
          <h2>وضعیت واقعی پنل و زیرساخت</h2>
          <p>{message}</p>
        </div>
        <button className="quiet-button" type="button" onClick={() => void check()}>
          بررسی دوباره
        </button>
      </div>
      {health && (
        <div className="governance-stats">
          {(Object.keys(health.checks) as Array<keyof Health["checks"]>).map((key) => (
            <article key={key}>
              <strong>{health.checks[key] ? "فعال" : "خطا"}</strong>
              <span>{labels[key]}</span>
            </article>
          ))}
        </div>
      )}
      {health?.errors?.length ? (
        <p className="admin-message">{health.errors.join(" — ")}</p>
      ) : null}
    </section>
  );
}
