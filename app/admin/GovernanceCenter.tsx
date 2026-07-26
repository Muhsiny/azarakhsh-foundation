"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";

type Overview = {
  content?: { total?: number; published?: number; review?: number; views?: number; downloads?: number };
  members?: { total?: number };
  requests?: { total?: number };
  user?: { role?: string };
};

type Membership = {
  id: number;
  fullName: string;
  email: string;
  organization: string;
  reason: string;
  status: string;
  createdAt: string;
};

type User = {
  id: number;
  email: string;
  display_name: string;
  role: string;
  status: string;
};

export default function GovernanceCenter() {
  const [overview, setOverview] = useState<Overview>({});
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [newUser, setNewUser] = useState({
    displayName: "",
    email: "",
    password: "",
    role: "editor",
  });

  const load = useCallback(async () => {
    const overviewResponse = await fetch("/api/admin/overview");
    const overviewData = (await overviewResponse.json()) as Overview;
    setOverview(overviewData);
    if (overviewData.user?.role === "owner" || overviewData.user?.role === "admin") {
      const membershipResponse = await fetch("/api/admin/memberships");
      if (membershipResponse.ok) {
        const data = (await membershipResponse.json()) as { requests?: Membership[] };
        setMemberships(data.requests ?? []);
      }
    }
    if (overviewData.user?.role === "owner") {
      const userResponse = await fetch("/api/admin/users");
      if (userResponse.ok) {
        const data = (await userResponse.json()) as { users?: User[] };
        setUsers(data.users ?? []);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(id: number, decision: "approved" | "rejected") {
    setTemporaryPassword("");
    const response = await fetch("/api/admin/memberships", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    const data = (await response.json()) as { error?: string; temporaryPassword?: string };
    setMessage(response.ok ? "درخواست عضویت بررسی شد." : data.error ?? "عملیات انجام نشد.");
    if (data.temporaryPassword) setTemporaryPassword(data.temporaryPassword);
    if (response.ok) await load();
  }

  async function toggleUser(user: User) {
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        status: user.status === "active" ? "disabled" : "active",
      }),
    });
    setMessage(response.ok ? "وضعیت کاربر تغییر کرد." : "تغییر وضعیت انجام نشد.");
    if (response.ok) await load();
  }

  async function createUser(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const data = (await response.json()) as { error?: string };
    setMessage(response.ok ? "حساب همکار ساخته شد." : data.error ?? "ساخت حساب انجام نشد.");
    if (response.ok) {
      setNewUser({ displayName: "", email: "", password: "", role: "editor" });
      await load();
    }
  }

  async function changeRole(user: User, role: string) {
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: user.id, role }),
    });
    setMessage(response.ok ? "نقش کاربر تغییر کرد." : "تغییر نقش انجام نشد.");
    if (response.ok) await load();
  }

  const stats = [
    ["کل محتوا", overview.content?.total ?? 0],
    ["منتشرشده", overview.content?.published ?? 0],
    ["در انتظار بررسی", overview.content?.review ?? 0],
    ["بازدید", overview.content?.views ?? 0],
    ["دانلود", overview.content?.downloads ?? 0],
    ["اعضای فعال", overview.members?.total ?? 0],
    ["درخواست عضویت", overview.requests?.total ?? 0],
  ];

  return (
    <section className="governance-center">
      <div className="studio-heading">
        <div>
          <p className="section-kicker">فرماندهی مدیریتی</p>
          <h2>آمار، عضویت و سطح دسترسی</h2>
        </div>
        <span className="role-badge">{overview.user?.role ?? "staff"}</span>
      </div>
      <div className="governance-stats">
        {stats.map(([label, value]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
      {message && <p className="admin-message">{message}</p>}
      {temporaryPassword && (
        <div className="credential-notice">
          رمز موقت عضو—فقط همین‌بار نمایش داده می‌شود:
          <code dir="ltr">{temporaryPassword}</code>
        </div>
      )}
      {memberships.length > 0 && (
        <details>
          <summary>درخواست‌های عضویت</summary>
          <div className="governance-list">
            {memberships.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.fullName}</strong>
                  <small>{item.email} · {item.organization || "بدون سازمان"}</small>
                  <p>{item.reason || "بدون توضیح"}</p>
                </div>
                <span>{item.status}</span>
                {item.status === "pending" && (
                  <div>
                    <button type="button" onClick={() => void decide(item.id, "approved")}>تأیید</button>
                    <button type="button" onClick={() => void decide(item.id, "rejected")}>رد</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </details>
      )}
      {overview.user?.role === "owner" && (
        <details>
          <summary>کاربران و نقش‌ها</summary>
          <form className="user-create-form" onSubmit={createUser}>
            <input
              onChange={(event) => setNewUser({ ...newUser, displayName: event.target.value })}
              placeholder="نام همکار"
              required
              value={newUser.displayName}
            />
            <input
              dir="ltr"
              onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
              placeholder="email@example.com"
              required
              type="email"
              value={newUser.email}
            />
            <select
              onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}
              value={newUser.role}
            >
              <option value="admin">مدیر</option>
              <option value="reviewer">بازبین</option>
              <option value="editor">ویراستار</option>
              <option value="member">عضو</option>
            </select>
            <input
              dir="ltr"
              minLength={12}
              onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
              placeholder="رمز حداقل ۱۲ نویسه"
              required
              type="password"
              value={newUser.password}
            />
            <button type="submit">ساخت حساب</button>
          </form>
          <div className="governance-list">
            {users.map((user) => (
              <article key={user.id}>
                <div>
                  <strong>{user.display_name || user.email}</strong>
                  <small>{user.email}</small>
                </div>
                <select
                  aria-label={`نقش ${user.display_name || user.email}`}
                  onChange={(event) => void changeRole(user, event.target.value)}
                  value={user.role}
                >
                  <option value="admin">مدیر</option>
                  <option value="reviewer">بازبین</option>
                  <option value="editor">ویراستار</option>
                  <option value="member">عضو</option>
                </select>
                <button type="button" onClick={() => void toggleUser(user)}>
                  {user.status === "active" ? "غیرفعال‌سازی" : "فعال‌سازی"}
                </button>
              </article>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
