type RuntimeEnv = { SESSION_SECRET?: string };

type PermitPayload = { postId: number; exp: number; nonce: string };

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

async function secret() {
  const { env } = await import("cloudflare:workers");
  const value = (env as unknown as RuntimeEnv).SESSION_SECRET?.trim();
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

export async function createDownloadPermit(postId: number) {
  const payload: PermitPayload = {
    postId,
    exp: Math.floor(Date.now() / 1000) + 10 * 60,
    nonce: crypto.randomUUID(),
  };
  const encoded = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = bytesToBase64Url(await hmac(`download:${encoded}`, await secret()));
  return `${encoded}.${signature}`;
}

export async function verifyDownloadPermit(token: string, postId: number) {
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return false;
  const expected = await hmac(`download:${encoded}`, await secret());
  if (!equalBytes(expected, base64UrlToBytes(signature))) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encoded))) as PermitPayload;
    return payload.postId === postId && payload.exp >= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
