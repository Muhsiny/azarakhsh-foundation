CREATE TABLE IF NOT EXISTS admin_users (
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
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS membership_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS public_contributions (
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
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS quiz_responses (
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
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS quiz_attempt_locks (
  post_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  locked_until TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, email)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS security_rate_limits (
  bucket TEXT PRIMARY KEY NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS download_permits (
  nonce TEXT PRIMARY KEY NOT NULL,
  post_id INTEGER NOT NULL,
  subject_hash TEXT NOT NULL DEFAULT '',
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_schema (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  version INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS posts_publication_idx ON posts(status, visibility, published_at DESC);
CREATE INDEX IF NOT EXISTS posts_content_type_idx ON posts(content_type, status);
CREATE INDEX IF NOT EXISTS membership_status_idx ON membership_requests(status, id DESC);
CREATE INDEX IF NOT EXISTS contribution_status_idx ON public_contributions(status, id DESC);
CREATE INDEX IF NOT EXISTS quiz_responses_post_idx ON quiz_responses(post_id, id DESC);
CREATE INDEX IF NOT EXISTS download_permits_expiry_idx ON download_permits(expires_at, used_at);
CREATE INDEX IF NOT EXISTS security_rate_reset_idx ON security_rate_limits(reset_at);
