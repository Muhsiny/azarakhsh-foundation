import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
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
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
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

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  data: text("data").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
