type RuntimeEnv = { DB?: D1Database };

export async function getQuizDb() {
  const { env } = await import("cloudflare:workers");
  return (env as unknown as RuntimeEnv).DB;
}

export async function ensureQuizResearchTables(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS quiz_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    post_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    occupation TEXT NOT NULL,
    answers_json TEXT NOT NULL,
    analytical_answer TEXT NOT NULL,
    historical_score INTEGER NOT NULL,
    consent INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS quiz_attempt_locks (
    post_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    locked_until TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, email)
  )`).run();
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
