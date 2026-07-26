import { cookies } from "next/headers";

export type AdminRole = "owner" | "admin" | "editor";

export type AdminUser = {
  id: number | null;
  email: string;
  displayName: string;
  role: AdminRole;
};

type RuntimeEnv = {
  DB?: D1Database;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
};

type StoredAdmin = {
  id: number;
  email: string;
  display_name: string;
  role: "admin" | "editor";
  password_hash: string;
  password_salt: string;
  status: string;
};

const COOKIE_NAME = "azarakhsh_admin";
const SESSION_SECONDS = 60 * 60 * 12;

async function runtimeEnv() {
  const { env } = await import("cloudflare:workers");
  return env as unknown as RuntimeEnv;
}

async function ensureUsersTable(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL DEFAULT '',
        role TEXT NOT NULL DEFAULT 'editor',
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    )
    .run();
}

function bytesToBase64Url(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
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
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
  );
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function equalSecret(left: string, right: string, secret: string) {
  const [leftHash, rightHash] = await Promise.all([
    hmac(`compare:${left}`, secret),
    hmac(`compare:${right}`, secret),
  ]);
  return equalBytes(leftHash, rightHash);
}

async function createSessionToken(user: AdminUser, secret: string) {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
      }),
    ),
  );
  const signature = bytesToBase64Url(await hmac(payload, secret));
  return `${payload}.${signature}`;
}

async function readSessionToken(token: string, secret: string) {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = await hmac(payload, secret);
  if (!equalBytes(expected, base64UrlToBytes(signature))) return null;

  try {
    const data = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload)),
    ) as { email?: string; exp?: number };
    if (!data.email || !data.exp || data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return data.email.trim().toLowerCase();
  } catch {
    return null;
  }
}

export function sessionCookie(token: string) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function expiredSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function authenticateAdmin(emailValue: string, password: string) {
  const env = await runtimeEnv();
  const email = emailValue.trim().toLowerCase();
  const normalizedPassword = password.normalize("NFKC").trim();
  const ownerEmail = env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const secret = env.SESSION_SECRET ?? "";

  if (!email || !normalizedPassword || !secret) return null;

  if (
    email === ownerEmail &&
    env.ADMIN_PASSWORD &&
    (await equalSecret(
      normalizedPassword,
      env.ADMIN_PASSWORD.normalize("NFKC").trim(),
      secret,
    ))
  ) {
    const user: AdminUser = {
      id: null,
      email,
      displayName: "مالک بنیاد",
      role: "owner",
    };
    return { user, token: await createSessionToken(user, secret) };
  }

  if (!env.DB) return null;
  await ensureUsersTable(env.DB);
  const stored = await env.DB.prepare(
    "SELECT id, email, display_name, role, password_hash, password_salt, status FROM admin_users WHERE email = ? LIMIT 1",
  )
    .bind(email)
    .first<StoredAdmin>();

  if (!stored || stored.status !== "active") return null;
  const passwordHash = bytesToBase64Url(
    await hmac(`password:${stored.password_salt}:${normalizedPassword}`, secret),
  );
  if (!(await equalSecret(passwordHash, stored.password_hash, secret))) return null;

  const user: AdminUser = {
    id: stored.id,
    email: stored.email,
    displayName: stored.display_name || stored.email,
    role: stored.role,
  };
  return { user, token: await createSessionToken(user, secret) };
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const env = await runtimeEnv();
  const secret = env.SESSION_SECRET ?? "";
  if (!secret) return null;

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const email = await readSessionToken(token, secret);
  if (!email) return null;

  const ownerEmail = env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  if (email === ownerEmail) {
    return {
      id: null,
      email,
      displayName: "مالک بنیاد",
      role: "owner",
    };
  }

  if (!env.DB) return null;
  await ensureUsersTable(env.DB);
  const stored = await env.DB.prepare(
    "SELECT id, email, display_name, role, password_hash, password_salt, status FROM admin_users WHERE email = ? LIMIT 1",
  )
    .bind(email)
    .first<StoredAdmin>();

  if (!stored || stored.status !== "active") return null;
  return {
    id: stored.id,
    email: stored.email,
    displayName: stored.display_name || stored.email,
    role: stored.role,
  };
}

export async function isAdminRequest() {
  return Boolean(await getAdminUser());
}

export async function isOwnerRequest() {
  return (await getAdminUser())?.role === "owner";
}

export async function requireAdminPage() {
  const user = await getAdminUser();
  return {
    user: user ?? {
      id: null,
      email: "",
      displayName: "مدیر بنیاد",
      role: "editor" as const,
    },
    authorized: Boolean(user),
  };
}

export async function listAdminUsers() {
  const env = await runtimeEnv();
  if (!env.DB) return [];
  await ensureUsersTable(env.DB);
  const result = await env.DB.prepare(
    "SELECT id, email, display_name, role, status, created_at, updated_at FROM admin_users ORDER BY id DESC",
  ).all();
  return result.results;
}

export async function createAdminUser(input: {
  email: string;
  displayName: string;
  role: "admin" | "editor";
  password: string;
}) {
  const env = await runtimeEnv();
  if (!env.DB || !env.SESSION_SECRET) throw new Error("تنظیمات امنیتی کامل نیست.");
  await ensureUsersTable(env.DB);

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("ایمیل معتبر نیست.");
  if (input.password.length < 12) {
    throw new Error("رمز همکار باید حداقل ۱۲ نویسه داشته باشد.");
  }
  const ownerEmail = env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  if (email === ownerEmail) throw new Error("ایمیل مالک قابل افزودن نیست.");

  const salt = crypto.randomUUID();
  const passwordHash = bytesToBase64Url(
    await hmac(`password:${salt}:${input.password}`, env.SESSION_SECRET),
  );
  await env.DB.prepare(
    `INSERT INTO admin_users
      (email, display_name, role, password_hash, password_salt, status, updated_at)
      VALUES (?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
  )
    .bind(
      email,
      input.displayName.trim() || email,
      input.role,
      passwordHash,
      salt,
    )
    .run();
}

export async function updateAdminUser(
  id: number,
  input: {
    displayName?: string;
    role?: "admin" | "editor";
    status?: "active" | "disabled";
    password?: string;
  },
) {
  const env = await runtimeEnv();
  if (!env.DB || !env.SESSION_SECRET) throw new Error("تنظیمات امنیتی کامل نیست.");
  await ensureUsersTable(env.DB);

  if (input.password) {
    if (input.password.length < 12) {
      throw new Error("رمز همکار باید حداقل ۱۲ نویسه داشته باشد.");
    }
    const salt = crypto.randomUUID();
    const passwordHash = bytesToBase64Url(
      await hmac(`password:${salt}:${input.password}`, env.SESSION_SECRET),
    );
    await env.DB.prepare(
      `UPDATE admin_users
       SET display_name = COALESCE(?, display_name),
           role = COALESCE(?, role),
           status = COALESCE(?, status),
           password_hash = ?,
           password_salt = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
      .bind(
        input.displayName?.trim() || null,
        input.role ?? null,
        input.status ?? null,
        passwordHash,
        salt,
        id,
      )
      .run();
    return;
  }

  await env.DB.prepare(
    `UPDATE admin_users
     SET display_name = COALESCE(?, display_name),
         role = COALESCE(?, role),
         status = COALESCE(?, status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(
      input.displayName?.trim() || null,
      input.role ?? null,
      input.status ?? null,
      id,
    )
    .run();
}

export async function deleteAdminUser(id: number) {
  const env = await runtimeEnv();
  if (!env.DB) throw new Error("پایگاه داده فعال نیست.");
  await ensureUsersTable(env.DB);
  await env.DB.prepare("DELETE FROM admin_users WHERE id = ?").bind(id).run();
}
