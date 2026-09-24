import { ensurePlatformSchema } from "../db/platform";

type RuntimeEnv = { SESSION_SECRET?: string; DB?: D1Database };

type PermitPayload = {
  postId: number;
  exp: number;
  nonce: string;
  subjectHash: string;
};

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

async function runtimeEnv() {
  const { env } = await import("cloudflare:workers");
  return env as unknown as RuntimeEnv;
}

async function secret() {
  const value = (await runtimeEnv()).SESSION_SECRET?.trim();
  if (!value) throw new Error("تنظیم امنیتی دانلود فعال نیست.");
  return value;
}

async function hmac(value: string, keyValue: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyValue),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

export async function createDownloadPermit(postId: number, subject: string) {
  const env = await runtimeEnv();
  if (!env.DB) throw new Error("پایگاه دادهٔ دانلود فعال نیست.");
  await ensurePlatformSchema();

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 10 * 60;
  const nonce = crypto.randomUUID();
  const subjectHash = await sha256(subject.trim().toLowerCase());

  await env.DB.prepare(
    `INSERT INTO download_permits
      (nonce, post_id, subject_hash, expires_at, used_at, created_at)
     VALUES (?, ?, ?, ?, NULL, ?)`,
  ).bind(nonce, postId, subjectHash, exp, now).run();

  await env.DB.prepare(
    "DELETE FROM download_permits WHERE expires_at < ? OR (used_at IS NOT NULL AND used_at < ?)",
  ).bind(now - 86400, now - 86400).run();

  const payload: PermitPayload = { postId, exp, nonce, subjectHash };
  const encoded = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = bytesToBase64Url(await hmac(`download:${encoded}`, await secret()));
  return `${encoded}.${signature}`;
}

export async function verifyAndConsumeDownloadPermit(token: string, postId: number) {
  const env = await runtimeEnv();
  if (!env.DB) return false;
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return false;

  let actualSignature: Uint8Array;
  try {
    actualSignature = base64UrlToBytes(signature);
  } catch {
    return false;
  }
  const expected = await hmac(`download:${encoded}`, await secret());
  if (!equalBytes(expected, actualSignature)) return false;

  let payload: PermitPayload;
  try {
    payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(encoded)),
    ) as PermitPayload;
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    payload.postId !== postId ||
    payload.exp < now ||
    !payload.nonce ||
    !payload.subjectHash
  ) {
    return false;
  }

  await ensurePlatformSchema();
  const consumed = await env.DB.prepare(
    `UPDATE download_permits
     SET used_at = ?
     WHERE nonce = ? AND post_id = ? AND subject_hash = ?
       AND expires_at >= ? AND used_at IS NULL
     RETURNING nonce`,
  ).bind(now, payload.nonce, postId, payload.subjectHash, now).first<{ nonce: string }>();

  return Boolean(consumed?.nonce);
}
