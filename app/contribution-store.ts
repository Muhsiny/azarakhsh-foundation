type RuntimeEnv = { DB?: D1Database; MEDIA?: KVNamespace };

export type ContributionRecord = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  relation_to_story: string;
  contribution_type: string;
  title: string;
  narrative: string;
  event_date: string;
  event_place: string;
  people_present: string;
  source_note: string;
  naming_preference: string;
  publication_consent: number;
  attachment_key: string;
  attachment_name: string;
  attachment_type: string;
  attachment_size: number;
  status: string;
  created_at: string;
  reviewed_at: string | null;
};

async function runtimeEnv() {
  const { env } = await import("cloudflare:workers");
  return env as unknown as RuntimeEnv;
}

async function ensureTable(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS public_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    relation_to_story TEXT NOT NULL DEFAULT '',
    contribution_type TEXT NOT NULL DEFAULT 'memory',
    title TEXT NOT NULL,
    narrative TEXT NOT NULL,
    event_date TEXT NOT NULL DEFAULT '',
    event_place TEXT NOT NULL DEFAULT '',
    people_present TEXT NOT NULL DEFAULT '',
    source_note TEXT NOT NULL DEFAULT '',
    naming_preference TEXT NOT NULL DEFAULT 'full-name',
    publication_consent INTEGER NOT NULL DEFAULT 0,
    attachment_key TEXT NOT NULL DEFAULT '',
    attachment_name TEXT NOT NULL DEFAULT '',
    attachment_type TEXT NOT NULL DEFAULT '',
    attachment_size INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TEXT
  )`).run();
}

export async function saveContribution(input: Omit<ContributionRecord, "id" | "status" | "created_at" | "reviewed_at">) {
  const env = await runtimeEnv();
  if (!env.DB) throw new Error("پایگاه دادهٔ سایت در دسترس نیست.");
  await ensureTable(env.DB);
  await env.DB.prepare(`INSERT INTO public_contributions (
    full_name,email,phone,relation_to_story,contribution_type,title,narrative,event_date,event_place,
    people_present,source_note,naming_preference,publication_consent,attachment_key,attachment_name,
    attachment_type,attachment_size,status
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')`)
    .bind(
      input.full_name, input.email, input.phone, input.relation_to_story, input.contribution_type,
      input.title, input.narrative, input.event_date, input.event_place, input.people_present,
      input.source_note, input.naming_preference, input.publication_consent, input.attachment_key,
      input.attachment_name, input.attachment_type, input.attachment_size,
    ).run();
}

export async function storeContributionFile(file: File) {
  const env = await runtimeEnv();
  if (!env.MEDIA) throw new Error("فضای ذخیره‌سازی فایل به سایت متصل نیست.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const key = `public-contributions/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await env.MEDIA.put(key, await file.arrayBuffer(), {
    metadata: { contentType: file.type, fileName: file.name },
  });
  return key;
}

export async function listContributions() {
  const env = await runtimeEnv();
  if (!env.DB) return [] as ContributionRecord[];
  await ensureTable(env.DB);
  const result = await env.DB.prepare("SELECT * FROM public_contributions ORDER BY id DESC LIMIT 1000").all<ContributionRecord>();
  return result.results;
}

export async function getContribution(id: number) {
  const env = await runtimeEnv();
  if (!env.DB) return null;
  await ensureTable(env.DB);
  return env.DB.prepare("SELECT * FROM public_contributions WHERE id=? LIMIT 1").bind(id).first<ContributionRecord>();
}

export async function updateContributionStatus(id: number, status: "pending" | "reviewed" | "accepted" | "rejected") {
  const env = await runtimeEnv();
  if (!env.DB) throw new Error("پایگاه داده در دسترس نیست.");
  await ensureTable(env.DB);
  await env.DB.prepare("UPDATE public_contributions SET status=?, reviewed_at=CURRENT_TIMESTAMP WHERE id=?")
    .bind(status, id).run();
}

export async function readContributionFile(key: string) {
  const env = await runtimeEnv();
  if (!env.MEDIA) return null;
  return env.MEDIA.getWithMetadata<{ contentType?: string; fileName?: string }>(key, "arrayBuffer");
}
