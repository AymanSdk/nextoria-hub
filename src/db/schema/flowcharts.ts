import { pgTable, text, timestamp, varchar, jsonb, boolean } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { workspaces } from "./workspaces";

/**
 * Flowcharts Table
 * Saved collaborative flowcharts with React Flow data
 */
export const flowcharts = pgTable("flowcharts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Identity
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Content - React Flow data structure
  data: jsonb("data").notNull(), // { nodes: [], edges: [], viewport: {} }
  thumbnail: text("thumbnail"), // Base64 or URL to preview image

  // Template info
  isTemplate: boolean("is_template").default(false),
  templateCategory: varchar("template_category", { length: 100 }), // e.g., "software", "business", "database"

  // Sharing
  isPublic: boolean("is_public").default(false),
  shareToken: text("share_token"), // For shareable links

  // Ownership
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export type Flowchart = typeof flowcharts.$inferSelect;
export type NewFlowchart = typeof flowcharts.$inferInsert;

