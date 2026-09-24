let ready: Promise<void> | null = null;

type RuntimeEnv = { DB?: D1Database };

async function runtimeDb() {
  const { env } = await import("cloudflare:workers");
  const db = (env as unknown as RuntimeEnv).DB;
  if (!db) throw new Error("Cloudflare D1 is unavailable.");
  return db;
}

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

async function ensureCoreTables(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'مقالات',
    content_type TEXT NOT NULL DEFAULT 'article',
    language TEXT NOT NULL DEFAULT 'fa',
    visibility TEXT NOT NULL DEFAULT 'public',
    author_name TEXT NOT NULL DEFAULT '',
    cover_image TEXT,
    file_url TEXT,
    file_name TEXT,
    source_note TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    downloads INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'editor',
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    must_change_password INTEGER NOT NULL DEFAULT 0,
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

  await db.prepare(`CREATE TABLE IF NOT EXISTS download_permits (
    nonce TEXT PRIMARY KEY NOT NULL,
    post_id INTEGER NOT NULL,
    email_hash TEXT NOT NULL DEFAULT '',
    expires_at INTEGER NOT NULL,
    consumed_at INTEGER,
    created_at INTEGER NOT NULL
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS security_rate_limits (
    bucket TEXT PRIMARY KEY NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    reset_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS platform_schema_meta (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    version INTEGER NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

async function ensurePostColumns(db: D1Database) {
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
}

async function ensureUserColumns(db: D1Database) {
  await addMissingColumn(
    db,
    "admin_users",
    "must_change_password",
    "INTEGER NOT NULL DEFAULT 0",
  );
}

async function ensureIndexes(db: D1Database) {
  const statements = [
    "CREATE INDEX IF NOT EXISTS idx_posts_publication ON posts(status, visibility, published_at DESC, id DESC)",
    "CREATE INDEX IF NOT EXISTS idx_posts_type_status ON posts(content_type, status, id DESC)",
    "CREATE INDEX IF NOT EXISTS idx_membership_status ON membership_requests(status, id DESC)",
    "CREATE INDEX IF NOT EXISTS idx_membership_email ON membership_requests(email)",
    "CREATE INDEX IF NOT EXISTS idx_contributions_status ON public_contributions(status, id DESC)",
    "CREATE INDEX IF NOT EXISTS idx_quiz_responses_post ON quiz_responses(post_id, id DESC)",
    "CREATE INDEX IF NOT EXISTS idx_quiz_responses_email ON quiz_responses(email, id DESC)",
    "CREATE INDEX IF NOT EXISTS idx_download_permits_expiry ON download_permits(expires_at)",
    "CREATE INDEX IF NOT EXISTS idx_rate_limits_expiry ON security_rate_limits(reset_at)",
  ];
  for (const statement of statements) await db.prepare(statement).run();
}

export async function ensurePlatformSchema() {
  if (ready) return ready;
  ready = (async () => {
    const db = await runtimeDb();
    await ensureCoreTables(db);
    await ensurePostColumns(db);
    await ensureUserColumns(db);
    await ensureIndexes(db);
    await db.prepare(`
      INSERT INTO platform_schema_meta (id, version, updated_at)
      VALUES (1, 3, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET version=excluded.version, updated_at=CURRENT_TIMESTAMP
    `).run();
  })().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}

export async function getPlatformDbBinding() {
  await ensurePlatformSchema();
  return runtimeDb();
}

export async function cleanupEphemeralPlatformData() {
  const db = await getPlatformDbBinding();
  const now = Math.floor(Date.now() / 1000);
  const nowIso = new Date().toISOString();
  await Promise.all([
    db.prepare("DELETE FROM security_rate_limits WHERE reset_at < ?")
      .bind(now - 86400)
      .run(),
    db.prepare("DELETE FROM download_permits WHERE expires_at < ? OR consumed_at IS NOT NULL")
      .bind(now - 86400)
      .run(),
    db.prepare("DELETE FROM quiz_attempt_locks WHERE locked_until < ?")
      .bind(nowIso)
      .run(),
  ]);
}
