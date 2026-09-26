import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  articleNo: integer("article_no"),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  category: text("category").notNull().default("مقالات"),
  contentType: text("content_type").notNull().default("article"),
  language: text("language").notNull().default("fa"),
  visibility: text("visibility").notNull().default("public"),
  authorName: text("author_name").notNull().default(""),
  coverImage: text("cover_image"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  sourceNote: text("source_note").notNull().default(""),
  tags: text("tags").notNull().default(""),
  featured: integer("featured").notNull().default(0),
  views: integer("views").notNull().default(0),
  downloads: integer("downloads").notNull().default(0),
  quizEnabled: integer("quiz_enabled").notNull().default(1),
  quizConfig: text("quiz_config").notNull().default(""),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull().default(""),
  role: text("role").notNull().default("editor"),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  status: text("status").notNull().default("active"),
  mustChangePassword: integer("must_change_password").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const membershipRequests = sqliteTable("membership_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  organization: text("organization").notNull().default(""),
  reason: text("reason").notNull().default(""),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  reviewedAt: text("reviewed_at"),
});

export const publicContributions = sqliteTable("public_contributions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  relationToStory: text("relation_to_story").notNull().default(""),
  contributionType: text("contribution_type").notNull().default("memory"),
  title: text("title").notNull(),
  narrative: text("narrative").notNull(),
  eventDate: text("event_date").notNull().default(""),
  eventPlace: text("event_place").notNull().default(""),
  peoplePresent: text("people_present").notNull().default(""),
  sourceNote: text("source_note").notNull().default(""),
  namingPreference: text("naming_preference").notNull().default("full-name"),
  publicationConsent: integer("publication_consent").notNull().default(0),
  attachmentKey: text("attachment_key").notNull().default(""),
  attachmentName: text("attachment_name").notNull().default(""),
  attachmentType: text("attachment_type").notNull().default(""),
  attachmentSize: integer("attachment_size").notNull().default(0),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  reviewedAt: text("reviewed_at"),
});

export const quizResponses = sqliteTable("quiz_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  occupation: text("occupation").notNull(),
  answersJson: text("answers_json").notNull(),
  analyticalAnswer: text("analytical_answer").notNull(),
  historicalScore: integer("historical_score").notNull(),
  consent: integer("consent").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const quizAttemptLocks = sqliteTable(
  "quiz_attempt_locks",
  {
    postId: integer("post_id").notNull(),
    email: text("email").notNull(),
    lockedUntil: text("locked_until").notNull(),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [primaryKey({ columns: [table.postId, table.email] })],
);

export const securityRateLimits = sqliteTable("security_rate_limits", {
  bucket: text("bucket").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: integer("reset_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const downloadPermits = sqliteTable("download_permits", {
  nonce: text("nonce").primaryKey(),
  postId: integer("post_id").notNull(),
  subjectHash: text("subject_hash").notNull().default(""),
  expiresAt: integer("expires_at").notNull(),
  usedAt: integer("used_at"),
  createdAt: integer("created_at").notNull(),
});

export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull().default(""),
  details: text("details").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});


export const siteSettingsStore = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default("{}"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
