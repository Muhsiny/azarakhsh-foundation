let ready: Promise<void> | null = null;

type RuntimeEnv = { DB?: D1Database };

async function addMissingColumn(
  db: D1Database,
  table: string,
  name: string,
  definition: string,
) {
  const info = await db.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  if (!info.results.some((column) => column.name === name)) {
    await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`).run();
  }
}

export async function ensurePlatformSchema() {
  if (ready) return ready;
  ready = (async () => {
    const { env } = await import("cloudflare:workers");
    const db = (env as unknown as RuntimeEnv).DB;
    if (!db) throw new Error("Cloudflare D1 is unavailable.");

    await db.prepare(`CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor',
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS membership_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      organization TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TEXT
    )`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL DEFAULT '',
      details TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();

    const columns: Array<[string, string]> = [
      ["content_type", "TEXT NOT NULL DEFAULT 'article'"],
      ["language", "TEXT NOT NULL DEFAULT 'fa'"],
      ["visibility", "TEXT NOT NULL DEFAULT 'public'"],
      ["author_name", "TEXT NOT NULL DEFAULT ''"],
      ["file_url", "TEXT"],
      ["file_name", "TEXT"],
      ["source_note", "TEXT NOT NULL DEFAULT ''"],
      ["tags", "TEXT NOT NULL DEFAULT ''"],
      ["featured", "INTEGER NOT NULL DEFAULT 0"],
      ["views", "INTEGER NOT NULL DEFAULT 0"],
      ["downloads", "INTEGER NOT NULL DEFAULT 0"],
    ];
    for (const [name, definition] of columns) {
      await addMissingColumn(db, "posts", name, definition);
    }
  })().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}
