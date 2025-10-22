/**
 * Database Seed Script
 *
 * Clears all data from the database for a fresh start
 * Run with: npm run db:seed
 *
 * WARNING: This will delete ALL data in your database!
 */

import { db } from "./index";
import {
  users,
  workspaces,
  workspaceMembers,
  projects,
  projectMembers,
  milestones,
  tasks,
  comments,
  invoices,
  invoiceLineItems,
  payments,
  notifications,
  chatChannels,
  chatMessages,
  chatChannelMembers,
} from "./schema";

async function seed() {
  console.log("🗑️  Clearing database...");
  console.log("⚠️  WARNING: This will delete ALL data!");

  // Clear existing data (in correct order to avoid foreign key constraints)
  await db.delete(chatMessages);
  await db.delete(chatChannelMembers);
  await db.delete(chatChannels);
  await db.delete(notifications);
  await db.delete(comments);
  await db.delete(tasks);
  await db.delete(milestones);
  await db.delete(projectMembers);
  await db.delete(projects);
  await db.delete(payments);
  await db.delete(invoiceLineItems);
  await db.delete(invoices);
  await db.delete(workspaceMembers);
  await db.delete(workspaces);
  await db.delete(users);

  console.log("✅ Database cleared successfully!");
  console.log("\n📝 Database is now empty and ready for real data.");
  console.log("\n💡 Next steps:");
  console.log(
    "  1. Visit http://localhost:3000/auth/signup to create your account"
  );
  console.log("  2. Create your workspace");
  console.log("  3. Start adding real projects, tasks, and team members");
  console.log("\n🚀 Happy building!");
}

seed()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
