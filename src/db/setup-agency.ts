/**
 * Agency Setup Script
 *
 * Creates the main Nextoria Agency workspace and admin user
 * Run with: bun run src/db/setup-agency.ts
 */

import { db } from "./index";
import { users, workspaces, workspaceMembers } from "./schema";
import { hashPassword } from "@/src/lib/auth/password";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

async function setupAgency() {
  console.log("🏢 Setting up Nextoria Agency...\n");

  // Get admin credentials from environment or prompt
  const adminEmail = process.env.ADMIN_EMAIL || "aymane-sadiki@nextoria.studio";
  const adminName = process.env.ADMIN_NAME || "Aymane Sadiki";
  const adminPassword = process.env.ADMIN_PASSWORD || "Bingo1998@";

  try {
    // Check if admin user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    let adminUser;

    if (existingUser) {
      console.log(`✓ Admin user already exists: ${adminEmail}`);
      adminUser = existingUser;
    } else {
      // Create admin user
      console.log(`Creating admin user: ${adminEmail}`);
      const hashedPassword = await hashPassword(adminPassword);

      [adminUser] = await db
        .insert(users)
        .values({
          id: nanoid(),
          email: adminEmail,
          name: adminName,
          password: hashedPassword,
          role: "ADMIN",
          isActive: true,
          emailVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      console.log(`✓ Admin user created: ${adminEmail}`);
    }

    // Check if workspace already exists
    const [existingWorkspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, "nextoria-agency"))
      .limit(1);

    let workspace;

    if (existingWorkspace) {
      console.log(`✓ Workspace already exists: Nextoria Agency`);
      workspace = existingWorkspace;
    } else {
      // Create agency workspace
      console.log(`Creating workspace: Nextoria Agency`);
      [workspace] = await db
        .insert(workspaces)
        .values({
          id: nanoid(),
          name: "Nextoria Agency",
          slug: "nextoria-agency",
          description: "Your digital agency operations hub",
          ownerId: adminUser.id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      console.log(`✓ Workspace created: Nextoria Agency`);
    }

    // Check if admin is already a workspace member
    const [existingMembership] = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspace.id))
      .limit(1);

    if (!existingMembership) {
      // Add admin as workspace member
      await db.insert(workspaceMembers).values({
        id: nanoid(),
        workspaceId: workspace.id,
        userId: adminUser.id,
        role: "ADMIN",
        isActive: true,
        joinedAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✓ Admin added as workspace member`);
    } else {
      console.log(`✓ Admin already a workspace member`);
    }

    console.log("\n✅ Nextoria Agency setup complete!\n");
    console.log("📋 Your Details:");
    console.log(`   Email:     ${adminEmail}`);
    console.log(`   Password:  ${adminPassword}`);
    console.log(`   Workspace: Nextoria Agency`);
    console.log("\n🚀 Next steps:");
    console.log("   1. Start the dev server: bun run dev");
    console.log("   2. Sign in at: http://localhost:3000/auth/signin");
    console.log("   3. Invite team members to join your workspace");
    console.log(
      "\n💡 Team members can sign up and will be added to the workspace.\n"
    );
  } catch (error) {
    console.error("❌ Setup failed:", error);
    throw error;
  }
}

setupAgency()
  .catch((error) => {
    console.error("Setup error:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
