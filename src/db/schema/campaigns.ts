import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { projects } from "./projects";
import { workspaces } from "./workspaces";

/**
 * Campaign Status Enum
 */
export const campaignStatusEnum = pgEnum("campaign_status", [
  "PLANNING",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
]);

/**
 * Campaign Type Enum
 */
export const campaignTypeEnum = pgEnum("campaign_type", [
  "SOCIAL_MEDIA",
  "EMAIL",
  "SEO",
  "PPC",
  "CONTENT",
  "INFLUENCER",
  "OTHER",
]);

/**
 * Campaigns Table
 * Marketing campaign management
 */
export const campaigns = pgTable("campaigns", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Identity
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Relationships
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),

  // Campaign details
  type: campaignTypeEnum("type").notNull(),
  status: campaignStatusEnum("status").default("PLANNING").notNull(),

  // Budget
  budgetAmount: integer("budget_amount"), // In cents
  spentAmount: integer("spent_amount").default(0),
  currency: varchar("currency", { length: 3 }).default("USD"),

  // Dates
  startDate: timestamp("start_date", { mode: "date" }),
  endDate: timestamp("end_date", { mode: "date" }),

  // Ownership
  managerId: text("manager_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Metrics (updated manually or via API)
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),

  // Goals
  targetReach: integer("target_reach"),
  targetConversions: integer("target_conversions"),

  // Tags
  tags: text("tags"), // Comma-separated

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Campaign Updates Table
 * Track campaign progress and notes
 */
export const campaignUpdates = pgTable("campaign_updates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),

  // Metrics snapshot
  metrics: text("metrics"), // JSON

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type CampaignUpdate = typeof campaignUpdates.$inferSelect;
