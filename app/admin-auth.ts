import { cookies } from "next/headers";
import {
  ensurePlatformSchema,
  getPlatformDbBinding,
} from "../db/platform";

export type AdminRole = "owner" | "admin" | "reviewer" | "editor" | "member";

export type AdminUser = {
  id: number | null;
  email: string;
  displayName: string;
  role: AdminRole;
  mustChangePassword: boolean;
};

type RuntimeEnv = {
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
};

type StoredAdmin = {
  id: number;
  email: string;
  display_name: string;
  role: AdminRole;
  password_hash: string;
  password_salt: string;
  status: string;
  must_change_password: number;
};

const COOKIE_NAME = "__Host-azarakhsh_admin";
const LEGACY_COOKIE_NAME = "azarakhsh_admin";
const SESSION_SECONDS = 60 * 60 * 8;
const PBKDF2_ITERATIONS = 210_000;

async function runtimeEnv() {
  const { env } = await import("cloudflare:workers");
  return env as unknown as RuntimeEnv;
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

async function derivePasswordHash(
  password: string,
  salt: string,
  secret: string,
  iterations = PBKDF2_ITERATIONS,
) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`${secret}:${password}`),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new TextEncoder().encode(salt),
      iterations,
    },
    keyMaterial,
    256,
  );
  return `pbkdf2$${iterations}$${bytesToBase64Url(new Uint8Array(bits))}`;
}

async function verifyStoredPassword(
  password: string,
  stored: StoredAdmin,
  secret: string,
) {
  if (stored.password_hash.startsWith("pbkdf2$")) {
    const [, iterationsValue, expected] = stored.password_hash.split("$");
    const iterations = Number(iterationsValue);
    if (!expected || !Number.isInteger(iterations) || iterations < 100_000) {
      return { valid: false, needsUpgrade: false };
    }
    const actual = await derivePasswordHash(
      password,
      stored.password_salt,
      secret,
      iterations,
    );
    return {
      valid: await equalSecret(actual, stored.password_hash, secret),
      needsUpgrade: iterations < PBKDF2_ITERATIONS,
    };
  }

  const legacyHash = bytesToBase64Url(
    await hmac(`password:${stored.password_salt}:${password}`, secret),
  );
  return {
    valid: await equalSecret(legacyHash, stored.password_hash, secret),
    needsUpgrade: true,
  };
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
  let actual: Uint8Array;
  try {
    actual = base64UrlToBytes(signature);
  } catch {
    return null;
  }
  const expected = await hmac(payload, secret);
  if (!equalBytes(expected, actual)) return null;

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

async function storedUserByEmail(email: string) {
  await ensurePlatformSchema();
  const db = await getPlatformDbBinding();
  return db
    .prepare(
      `SELECT id, email, display_name, role, password_hash, password_salt,
              status, must_change_password
       FROM admin_users
       WHERE email = ?
       LIMIT 1`,
    )
    .bind(email)
    .first<StoredAdmin>();
}

function publicUser(stored: StoredAdmin): AdminUser {
  return {
    id: stored.id,
    email: stored.email,
    displayName: stored.display_name || stored.email,
    role: stored.role,
    mustChangePassword: stored.must_change_password === 1,
  };
}

export function sessionCookie(token: string) {
  return `${COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}; Priority=High`;
}

export function expiredSessionCookies() {
  return [
    `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Priority=High`,
    `${LEGACY_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Priority=High`,
  ];
}

export function expiredSessionCookie() {
  return expiredSessionCookies()[0];
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
      mustChangePassword: false,
    };
    return { user, token: await createSessionToken(user, secret) };
  }

  const stored = await storedUserByEmail(email);
  if (!stored || stored.status !== "active") return null;

  const passwordCheck = await verifyStoredPassword(
    normalizedPassword,
    stored,
    secret,
  );
  if (!passwordCheck.valid) return null;

  if (passwordCheck.needsUpgrade) {
    const db = await getPlatformDbBinding();
    const upgraded = await derivePasswordHash(
      normalizedPassword,
      stored.password_salt,
      secret,
    );
    await db
      .prepare(
        "UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      )
      .bind(upgraded, stored.id)
      .run();
  }

  const user = publicUser(stored);
  return { user, token: await createSessionToken(user, secret) };
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const env = await runtimeEnv();
  const secret = env.SESSION_SECRET ?? "";
  if (!secret) return null;

  const cookieStore = await cookies();
  const token =
    cookieStore.get(COOKIE_NAME)?.value ||
    cookieStore.get(LEGACY_COOKIE_NAME)?.value;
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
      mustChangePassword: false,
    };
  }

  const stored = await storedUserByEmail(email);
  if (!stored || stored.status !== "active") return null;
  return publicUser(stored);
}

export async function isAdminRequest() {
  const role = (await getAdminUser())?.role;
  return role === "owner" || role === "admin" || role === "reviewer" || role === "editor";
}

export async function isOwnerRequest() {
  return (await getAdminUser())?.role === "owner";
}

export async function canManageSiteRequest() {
  const role = (await getAdminUser())?.role;
  return role === "owner" || role === "admin";
}

export async function canPublishRequest() {
  const role = (await getAdminUser())?.role;
  return role === "owner" || role === "admin" || role === "reviewer";
}

export async function requireAdminPage() {
  const user = await getAdminUser();
  const authorized =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.role === "reviewer" ||
    user?.role === "editor";
  return {
    user:
      user ??
      ({
        id: null,
        email: "",
        displayName: "مدیر بنیاد",
        role: "editor",
        mustChangePassword: false,
      } satisfies AdminUser),
    authorized,
  };
}

export async function listAdminUsers() {
  const db = await getPlatformDbBinding();
  const result = await db
    .prepare(
      `SELECT id, email, display_name, role, status, must_change_password,
              created_at, updated_at
       FROM admin_users
       ORDER BY id DESC`,
    )
    .all();
  return result.results;
}

async function writeUserPassword(
  id: number,
  password: string,
  mustChangePassword: boolean,
) {
  const env = await runtimeEnv();
  if (!env.SESSION_SECRET) throw new Error("تنظیمات امنیتی کامل نیست.");
  if (password.length < 12) {
    throw new Error("رمز حساب باید حداقل ۱۲ نویسه داشته باشد.");
  }
  const salt = crypto.randomUUID();
  const passwordHash = await derivePasswordHash(
    password.normalize("NFKC"),
    salt,
    env.SESSION_SECRET,
  );
  const db = await getPlatformDbBinding();
  await db
    .prepare(
      `UPDATE admin_users
       SET password_hash = ?, password_salt = ?, must_change_password = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
    .bind(passwordHash, salt, mustChangePassword ? 1 : 0, id)
    .run();
}

export async function createAdminUser(input: {
  email: string;
  displayName: string;
  role: Exclude<AdminRole, "owner">;
  password: string;
  mustChangePassword?: boolean;
}) {
  const env = await runtimeEnv();
  if (!env.SESSION_SECRET) throw new Error("تنظیمات امنیتی کامل نیست.");
  await ensurePlatformSchema();

  const email = input.email.trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("ایمیل معتبر نیست.");
  }
  if (input.password.length < 12) {
    throw new Error("رمز حساب باید حداقل ۱۲ نویسه داشته باشد.");
  }
  const ownerEmail = env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  if (email === ownerEmail) throw new Error("ایمیل مالک قابل افزودن نیست.");

  const salt = crypto.randomUUID();
  const passwordHash = await derivePasswordHash(
    input.password.normalize("NFKC"),
    salt,
    env.SESSION_SECRET,
  );
  const db = await getPlatformDbBinding();
  await db
    .prepare(
      `INSERT INTO admin_users
        (email, display_name, role, password_hash, password_salt, status,
         must_change_password, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, CURRENT_TIMESTAMP)`,
    )
    .bind(
      email,
      input.displayName.trim() || email,
      input.role,
      passwordHash,
      salt,
      input.mustChangePassword ? 1 : 0,
    )
    .run();
}

export async function createOrResetMemberUser(input: {
  email: string;
  displayName: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await storedUserByEmail(email);

  if (existing && existing.role !== "member") {
    throw new Error("این ایمیل پیش‌تر برای یک حساب مدیریتی استفاده شده است.");
  }

  if (!existing) {
    await createAdminUser({
      email,
      displayName: input.displayName,
      role: "member",
      password: input.password,
      mustChangePassword: true,
    });
    return;
  }

  const db = await getPlatformDbBinding();
  await db
    .prepare(
      `UPDATE admin_users
       SET display_name = ?, status = 'active', role = 'member',
           must_change_password = 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
    .bind(input.displayName.trim() || email, existing.id)
    .run();
  await writeUserPassword(existing.id, input.password, true);
}

export async function setMemberAccountStatus(
  emailValue: string,
  status: "active" | "disabled",
) {
  const email = emailValue.trim().toLowerCase();
  const db = await getPlatformDbBinding();
  await db
    .prepare(
      `UPDATE admin_users
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE email = ? AND role = 'member'`,
    )
    .bind(status, email)
    .run();
}

export async function changeCurrentUserPassword(
  currentPassword: string,
  nextPassword: string,
) {
  const user = await getAdminUser();
  if (!user || user.role === "owner" || user.id === null) {
    throw new Error("حساب قابل تغییر نیست.");
  }
  if (nextPassword.length < 12) {
    throw new Error("رمز جدید باید حداقل ۱۲ نویسه داشته باشد.");
  }

  const verified = await authenticateAdmin(user.email, currentPassword);
  if (!verified) throw new Error("رمز فعلی درست نیست.");

  await writeUserPassword(user.id, nextPassword, false);
}

export async function updateAdminUser(
  id: number,
  input: {
    displayName?: string;
    role?: Exclude<AdminRole, "owner">;
    status?: "active" | "disabled";
    password?: string;
  },
) {
  const db = await getPlatformDbBinding();

  await db
    .prepare(
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

  if (input.password) {
    await writeUserPassword(id, input.password, false);
  }
}

export async function deleteAdminUser(id: number) {
  const db = await getPlatformDbBinding();
  await db.prepare("DELETE FROM admin_users WHERE id = ?").bind(id).run();
}
