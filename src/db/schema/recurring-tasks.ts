import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { projects } from "./projects";
import { taskStatusEnum, taskPriorityEnum } from "./tasks";

/**
 * Recurrence Frequency Enum
 */
export const recurrenceFrequencyEnum = pgEnum("recurrence_frequency", [
  "DAILY",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
]);

/**
 * Recurring Tasks Table
 * Templates for automatically generating tasks
 */
export const recurringTasks = pgTable("recurring_tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Template details
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),

  // Project relationship
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  // Default assignment
  defaultAssigneeId: text("default_assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),

  // Default values
  defaultStatus: taskStatusEnum("default_status").default("TODO"),
  defaultPriority: taskPriorityEnum("default_priority").default("MEDIUM"),

  // Labels
  labels: text("labels"),

  // Recurrence pattern
  frequency: recurrenceFrequencyEnum("frequency").notNull(),

  // Day of week (for weekly, 0=Sunday, 6=Saturday)
  dayOfWeek: integer("day_of_week"),

  // Day of month (for monthly, 1-31)
  dayOfMonth: integer("day_of_month"),

  // Time offset (days before/after due date)
  daysOffset: integer("days_offset").default(0),

  // Active period
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }),

  // Last generation
  lastGeneratedAt: timestamp("last_generated_at", { mode: "date" }),
  nextGenerationAt: timestamp("next_generation_at", { mode: "date" }),

  // Status
  isActive: boolean("is_active").default(true).notNull(),

  // Creator
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type RecurringTask = typeof recurringTasks.$inferSelect;
export type NewRecurringTask = typeof recurringTasks.$inferInsert;
