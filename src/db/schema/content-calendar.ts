import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { projects } from "./projects";
import { campaigns } from "./campaigns";
import { workspaces } from "./workspaces";

/**
 * Content Type Enum
 */
export const contentTypeEnum = pgEnum("content_type", [
  "BLOG_POST",
  "SOCIAL_POST",
  "EMAIL",
  "VIDEO",
  "INFOGRAPHIC",
  "PODCAST",
  "EBOOK",
  "WEBINAR",
  "OTHER",
]);

/**
 * Content Status Enum
 */
export const contentStatusEnum = pgEnum("content_status", [
  "IDEA",
  "PLANNING",
  "WRITING",
  "REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
]);

/**
 * Social Platform Enum
 */
export const socialPlatformEnum = pgEnum("social_platform", [
  "FACEBOOK",
  "INSTAGRAM",
  "TWITTER",
  "LINKEDIN",
  "TIKTOK",
  "YOUTUBE",
  "PINTEREST",
  "OTHER",
]);

/**
 * Content Calendar Table
 * Plan and schedule content deliverables
 */
export const contentCalendar = pgTable("content_calendar", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Identity
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  // Relationships
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),

  campaignId: text("campaign_id").references(() => campaigns.id, {
    onDelete: "set null",
  }),

  // Content details
  type: contentTypeEnum("type").notNull(),
  status: contentStatusEnum("status").default("IDEA").notNull(),

  // Platform (for social posts)
  platform: socialPlatformEnum("platform"),

  // Dates
  publishDate: timestamp("publish_date", { mode: "date" }),
  publishedAt: timestamp("published_at", { mode: "date" }),

  // Ownership
  assignedTo: text("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),

  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Content
  contentBody: text("content_body"), // Draft content
  contentUrl: text("content_url"), // Published URL

  // Metadata
  tags: text("tags"), // Comma-separated
  keywords: text("keywords"), // SEO keywords

  // Analytics
  views: text("views").default("0"),
  engagement: text("engagement").default("0"), // Likes, shares, comments

  // Flags
  isRecurring: boolean("is_recurring").default(false),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type ContentCalendarItem = typeof contentCalendar.$inferSelect;
export type NewContentCalendarItem = typeof contentCalendar.$inferInsert;
