import { pgTable, text, timestamp, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { workspaces } from "./workspaces";
import { users } from "./users";

/**
 * Integration Type Enum
 */
export const integrationTypeEnum = pgEnum("integration_type", [
  "SLACK",
  "GOOGLE_DRIVE",
  "GOOGLE_CALENDAR",
  "FIGMA",
  "GITHUB",
  "CUSTOM_WEBHOOK",
]);

/**
 * Integrations Table
 * Third-party integrations per workspace
 */
export const integrations = pgTable("integrations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  
  type: integrationTypeEnum("type").notNull(),
  
  // Integration details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Configuration (JSON string)
  config: text("config").notNull(), // Encrypted credentials/tokens
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  
  // Connected by
  connectedBy: text("connected_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Last sync
  lastSyncAt: timestamp("last_sync_at", { mode: "date" }),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Webhooks Table
 * Custom webhook endpoints
 */
export const webhooks = pgTable("webhooks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  
  // Events to trigger on
  events: text("events").notNull(), // Comma-separated event types
  
  // Secret for signing
  secret: text("secret").notNull(),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  
  // Metadata
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Webhook Delivery Log
 * Track webhook delivery attempts
 */
export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  webhookId: text("webhook_id")
    .notNull()
    .references(() => webhooks.id, { onDelete: "cascade" }),
  
  event: varchar("event", { length: 100 }).notNull(),
  payload: text("payload").notNull(), // JSON
  
  // Response
  statusCode: varchar("status_code", { length: 10 }),
  response: text("response"),
  
  isSuccessful: boolean("is_successful").default(false).notNull(),
  
  // Retry
  attempts: varchar("attempts", { length: 10 }).default("1"),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
export type Webhook = typeof webhooks.$inferSelect;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;

