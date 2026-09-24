import { ensurePlatformSchema } from "../db/platform";

type RuntimeEnv = { DB?: D1Database };

export async function getQuizDb() {
  const { env } = await import("cloudflare:workers");
  return (env as unknown as RuntimeEnv).DB;
}

export async function ensureQuizResearchTables(_db: D1Database) {
  await ensurePlatformSchema();
}

export function normalizeQuizAnswer(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[ـ‌]/g, " ")
    .replace(/[،,:؛.!؟?()\[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const abusiveTerms = [
  "احمق", "ابله", "کثافت", "لعنت", "حرامزاده", "بی ناموس", "بی‌ناموس",
  "سگ", "خائن", "مزدور", "کافر", "مرتد", "نجس", "نفرت", "بکش", "مرگ بر",
];

export function isAcceptableExplanatoryAnswer(value: string, minimumLength: number) {
  const normalized = normalizeQuizAnswer(value);
  if (normalized.length < minimumLength) return false;
  if (/^(.)\1{7,}$/.test(normalized.replace(/\s/g, ""))) return false;
  return !abusiveTerms.some((term) => normalized.includes(normalizeQuizAnswer(term)));
}
