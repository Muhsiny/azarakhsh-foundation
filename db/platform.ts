import { canonicalPosts } from "./canonical-posts";

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

async function bootstrapTables(db: D1Database) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS posts (
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
    )`,
    `CREATE TABLE IF NOT EXISTS admin_users (
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
    )`,
    `CREATE TABLE IF NOT EXISTS membership_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      organization TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL DEFAULT '',
      details TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS public_contributions (
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
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_responses (
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
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_attempt_locks (
      post_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      locked_until TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id, email)
    )`,
    `CREATE TABLE IF NOT EXISTS security_rate_limits (
      bucket TEXT PRIMARY KEY NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      reset_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS download_permits (
      nonce TEXT PRIMARY KEY NOT NULL,
      post_id INTEGER NOT NULL,
      subject_hash TEXT NOT NULL DEFAULT '',
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS platform_schema (
      id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
      version INTEGER NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const statement of statements) {
    await db.prepare(statement).run();
  }
}

async function applyCompatibilityMigrations(db: D1Database) {
  const postColumns: Array<[string, string]> = [
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
  for (const [name, definition] of postColumns) {
    await addMissingColumn(db, "posts", name, definition);
  }

  await addMissingColumn(
    db,
    "admin_users",
    "must_change_password",
    "INTEGER NOT NULL DEFAULT 0",
  );

  const indexes = [
    "CREATE INDEX IF NOT EXISTS posts_publication_idx ON posts(status, visibility, published_at DESC)",
    "CREATE INDEX IF NOT EXISTS posts_content_type_idx ON posts(content_type, status)",
    "CREATE INDEX IF NOT EXISTS membership_status_idx ON membership_requests(status, id DESC)",
    "CREATE INDEX IF NOT EXISTS contribution_status_idx ON public_contributions(status, id DESC)",
    "CREATE INDEX IF NOT EXISTS quiz_responses_post_idx ON quiz_responses(post_id, id DESC)",
    "CREATE INDEX IF NOT EXISTS download_permits_expiry_idx ON download_permits(expires_at, used_at)",
    "CREATE INDEX IF NOT EXISTS security_rate_reset_idx ON security_rate_limits(reset_at)",
  ];
  for (const statement of indexes) {
    await db.prepare(statement).run();
  }

  await db.prepare(`
    INSERT INTO platform_schema (id, version, updated_at)
    VALUES (1, 3, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET version = excluded.version, updated_at = CURRENT_TIMESTAMP
  `).run();
}

async function seedCanonicalPosts(db: D1Database) {
  for (const post of canonicalPosts) {
    await db.prepare(`
      INSERT OR IGNORE INTO posts (
        slug, title, excerpt, content, category, content_type, language,
        visibility, author_name, cover_image, source_note, tags, featured,
        status, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      post.slug,
      post.title,
      post.excerpt,
      post.content,
      post.category,
      post.contentType,
      post.language,
      post.visibility,
      post.authorName,
      post.coverImage,
      post.sourceNote,
      post.tags,
      post.featured,
      post.status,
    ).run();
  }
}

export async function ensurePlatformSchema() {
  if (ready) return ready;
  ready = (async () => {
    const db = await runtimeDb();
    await bootstrapTables(db);
    await applyCompatibilityMigrations(db);
    await seedCanonicalPosts(db);
  })().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}
