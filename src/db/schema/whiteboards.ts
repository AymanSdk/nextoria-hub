import { pgTable, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { workspaces } from "./workspaces";

/**
 * Whiteboards Table
 * Saved collaborative whiteboards with tldraw data
 */
export const whiteboards = pgTable("whiteboards", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Identity
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Content
  data: jsonb("data").notNull(), // tldraw store data
  thumbnail: text("thumbnail"), // Base64 or URL to preview image

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
