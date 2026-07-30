import { cookies } from "next/headers";

const VISITOR_COOKIE = "azarakhsh_visitor";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

type RuntimeEnv = {
  DB?: D1Database;
  SESSION_SECRET?: string;
  RESEND_API_KEY?: string;
  VISITOR_FROM_EMAIL?: string;
};

async function runtimeEnv() {
  const { env } = await import("cloudflare:workers");
  return env as unknown as RuntimeEnv;
}

function base64Url(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - (normalized.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

async function ensureTables(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS visitor_codes (
    email TEXT PRIMARY KEY NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS visitor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    job TEXT NOT NULL,
    visit_purpose TEXT NOT NULL,
    purpose_other TEXT NOT NULL DEFAULT '',
    answers_json TEXT NOT NULL,
    verified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_path TEXT NOT NULL DEFAULT '/',
    visit_count INTEGER NOT NULL DEFAULT 1,
    consent INTEGER NOT NULL DEFAULT 1
  )`).run();
}

export async function requestVisitorCode(emailValue: string) {
  const env = await runtimeEnv();
  if (!env.DB || !env.SESSION_SECRET) throw new Error("سامانهٔ ثبت‌نام هنوز کامل تنظیم نشده است.");
  const email = emailValue.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("ایمیل معتبر نیست.");
  await ensureTables(env.DB);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = base64Url(await hmac(`visitor-code:${email}:${code}`, env.SESSION_SECRET));
  await env.DB.prepare(`INSERT INTO visitor_codes (email, code_hash, expires_at, attempts, created_at)
    VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash, expires_at=excluded.expires_at, attempts=0, created_at=CURRENT_TIMESTAMP`)
    .bind(email, codeHash, Math.floor(Date.now() / 1000) + 600).run();

  if (!env.RESEND_API_KEY || !env.VISITOR_FROM_EMAIL) {
    throw new Error("سرویس ارسال ایمیل هنوز به سایت متصل نشده است.");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.VISITOR_FROM_EMAIL,
      to: [email],
      subject: "کد ورود به بنیاد آذرخش",
      html: `<div dir="rtl" style="font-family:serif"><h2>بنیاد آذرخش</h2><p>کد تأیید شما:</p><p style="font-size:28px;font-weight:bold;letter-spacing:5px">${code}</p><p>این کد ده دقیقه اعتبار دارد.</p></div>`,
    }),
  });
  if (!response.ok) throw new Error("ارسال کد ایمیل انجام نشد.");
}

export async function verifyVisitor(input: {
  fullName: string;
  email: string;
  job: string;
  purpose: string;
  purposeOther?: string;
  code: string;
  answers: string[];
}) {
  const env = await runtimeEnv();
  if (!env.DB || !env.SESSION_SECRET) throw new Error("سامانهٔ ثبت‌نام هنوز کامل تنظیم نشده است.");
  await ensureTables(env.DB);
  const email = input.email.trim().toLowerCase();
  if (input.fullName.trim().length < 3 || input.job.trim().length < 2) throw new Error("نام کامل و شغل را دقیق بنویسید.");
  if (!input.purpose.trim()) throw new Error("هدف بازدید را انتخاب کنید.");
  if (!Array.isArray(input.answers) || input.answers.length !== 8 || input.answers.some((answer) => answer.trim().length < 3)) {
    throw new Error("به هر هشت پرسش پاسخ دهید.");
  }
  const row = await env.DB.prepare("SELECT code_hash, expires_at, attempts FROM visitor_codes WHERE email = ? LIMIT 1")
    .bind(email).first<{ code_hash: string; expires_at: number; attempts: number }>();
  if (!row || row.expires_at < Math.floor(Date.now() / 1000)) throw new Error("کد منقضی شده است؛ کد تازه بگیرید.");
  if (row.attempts >= 5) throw new Error("تلاش‌های ناموفق زیاد بود؛ کد تازه بگیرید.");
  const candidate = base64Url(await hmac(`visitor-code:${email}:${input.code.trim()}`, env.SESSION_SECRET));
  if (candidate !== row.code_hash) {
    await env.DB.prepare("UPDATE visitor_codes SET attempts = attempts + 1 WHERE email = ?").bind(email).run();
    throw new Error("کد تأیید نادرست است.");
  }
  await env.DB.prepare(`INSERT INTO visitor_profiles
    (full_name,email,job,visit_purpose,purpose_other,answers_json,last_path,consent)
    VALUES (?,?,?,?,?,?,?,1)
    ON CONFLICT(email) DO UPDATE SET full_name=excluded.full_name, job=excluded.job,
      visit_purpose=excluded.visit_purpose, purpose_other=excluded.purpose_other,
      answers_json=excluded.answers_json, verified_at=CURRENT_TIMESTAMP,
      last_seen_at=CURRENT_TIMESTAMP, last_path=excluded.last_path, visit_count=visitor_profiles.visit_count+1`)
    .bind(input.fullName.trim(), email, input.job.trim(), input.purpose, input.purposeOther?.trim() || "", JSON.stringify(input.answers), "/").run();
  await env.DB.prepare("DELETE FROM visitor_codes WHERE email = ?").bind(email).run();
  const payload = base64Url(new TextEncoder().encode(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })));
  const signature = base64Url(await hmac(payload, env.SESSION_SECRET));
  return `${payload}.${signature}`;
}

export function visitorCookie(token: string) {
  return `${VISITOR_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_SECONDS}`;
}

export async function getVisitorEmail() {
  const env = await runtimeEnv();
  if (!env.SESSION_SECRET) return null;
  const token = (await cookies()).get(VISITOR_COOKIE)?.value;
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = base64Url(await hmac(payload, env.SESSION_SECRET));
  if (signature !== expected) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))) as { email?: string; exp?: number };
    if (!data.email || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.email;
  } catch { return null; }
}

export async function recordVisitorPath(email: string, path: string) {
  const env = await runtimeEnv();
  if (!env.DB) return;
  await ensureTables(env.DB);
  await env.DB.prepare("UPDATE visitor_profiles SET last_seen_at=CURRENT_TIMESTAMP, last_path=?, visit_count=visit_count+1 WHERE email=?")
    .bind(path.slice(0, 500), email).run();
}

export async function listVisitors() {
  const env = await runtimeEnv();
  if (!env.DB) return [];
  await ensureTables(env.DB);
  const result = await env.DB.prepare("SELECT id,full_name,email,job,visit_purpose,purpose_other,answers_json,verified_at,last_seen_at,last_path,visit_count FROM visitor_profiles ORDER BY last_seen_at DESC LIMIT 1000").all();
  return result.results;
}
