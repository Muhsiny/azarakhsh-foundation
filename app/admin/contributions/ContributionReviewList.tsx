"use client";

import { useState } from "react";
import type { ContributionRecord } from "../../contribution-store";

const statusLabels: Record<string, string> = {
  pending: "در انتظار بررسی",
  reviewed: "بررسی‌شده",
  accepted: "پذیرفته‌شده",
  rejected: "ردشده",
};

export default function ContributionReviewList({ initialItems }: { initialItems: ContributionRecord[] }) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");

  async function deleteItem(id: number) {
    if (!window.confirm("این منبع و ضمیمهٔ آن برای همیشه حذف شود؟")) return;
    setMessage("");
    const response = await fetch(`/api/admin/contributions/${id}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setMessage(data.error || "حذف انجام نشد.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    setMessage("منبع و ضمیمهٔ آن حذف شد.");
  }

  async function changeStatus(id: number, status: string) {
    setMessage("");
    const response = await fetch(`/api/admin/contributions/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setMessage(data.error || "تغییر وضعیت انجام نشد.");
      return;
    }
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    setMessage("وضعیت ثبت شد.");
  }

  return (
    <>
      {message && <p className="admin-message" role="status">{message}</p>}
      <div style={{ display: "grid", gap: 18, marginTop: 20 }}>
        {items.length === 0 && <p>هنوز خاطره یا منبعی ثبت نشده است.</p>}
        {items.map((item) => (
          <article key={item.id} style={{ border: "1px solid #d7c28a", borderRadius: 12, padding: 17, background: "#fffdf8" }}>
            <p className="section-kicker">{statusLabels[item.status] || item.status} · شماره {item.id}</p>
            <h2 style={{ marginTop: 4 }}>{item.title}</h2>
            <p><strong>راوی/فرستنده:</strong> {item.full_name}</p>
            <p><strong>ایمیل:</strong> {item.email} {item.phone ? `· ${item.phone}` : ""}</p>
            <p><strong>نسبت با منبع:</strong> {item.relation_to_story || "ذکر نشده"}</p>
            <p><strong>نوع:</strong> {item.contribution_type}</p>
            <p><strong>زمان و مکان:</strong> {item.event_date || "نامشخص"} · {item.event_place || "نامشخص"}</p>
            <p><strong>اشخاص حاضر:</strong> {item.people_present || "ذکر نشده"}</p>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 2 }}><strong>روایت:</strong><br />{item.narrative}</p>
            {item.source_note && <p style={{ whiteSpace: "pre-wrap" }}><strong>توضیح اصالت:</strong><br />{item.source_note}</p>}
            <p><strong>شیوهٔ ذکر نام:</strong> {item.naming_preference}</p>
            <p><strong>تاریخ ثبت:</strong> {item.created_at}</p>
            {item.attachment_key && (
              <p><a className="button button-dark" href={`/api/admin/contributions/${item.id}/file`}>دریافت ضمیمه: {item.attachment_name}</a></p>
            )}
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 14 }}>
              <button type="button" onClick={() => void changeStatus(item.id, "reviewed")}>بررسی شد</button>
              <button type="button" onClick={() => void changeStatus(item.id, "accepted")}>پذیرفتن</button>
              <button type="button" onClick={() => void changeStatus(item.id, "rejected")}>رد کردن</button>
              <button type="button" onClick={() => void changeStatus(item.id, "pending")}>بازگشت به انتظار</button>
              <button type="button" className="admin-danger-button" onClick={() => void deleteItem(item.id)}>حذف کامل</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
