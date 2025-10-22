import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { workspaces, workspaceMembers } from "@/src/db/schema/workspaces";
import { users } from "@/src/db/schema/users";
import { getCurrentUser } from "@/src/lib/auth/session";
import { eq, notExists } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * POST /api/admin/setup-workspaces
 * Create a default workspace for all users who don't have one
 * This is a one-time setup endpoint
 */
export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    // Only admins can run this
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find all users without workspace memberships
    const usersWithoutWorkspace = await db
      .select()
      .from(users)
      .where(
        notExists(
          db.select().from(workspaceMembers).where(eq(workspaceMembers.userId, users.id))
        )
      );

    if (usersWithoutWorkspace.length === 0) {
      return NextResponse.json({
        message: "All users already have workspaces",
        count: 0,
      });
    }

    // Create or get the default Nextoria workspace
    let [defaultWorkspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, "nextoria"))
      .limit(1);

    if (!defaultWorkspace) {
      // Create the default workspace
      [defaultWorkspace] = await db
        .insert(workspaces)
        .values({
          id: nanoid(),
          name: "Nextoria",
          slug: "nextoria",
          description: "Default Nextoria workspace",
          createdBy: currentUser.id,
        })
        .returning();
    }

    // Add all users without workspaces to the default workspace
    const membershipsToCreate = usersWithoutWorkspace.map((user) => ({
      id: nanoid(),
      workspaceId: defaultWorkspace.id,
      userId: user.id,
      role: user.role,
    }));

    await db.insert(workspaceMembers).values(membershipsToCreate);

    return NextResponse.json({
      message: "Successfully added users to workspace",
      workspace: defaultWorkspace.name,
      usersAdded: usersWithoutWorkspace.length,
      users: usersWithoutWorkspace.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
      })),
    });
  } catch (error: any) {
    console.error("Error setting up workspaces:", error);
    return NextResponse.json(
      { error: error.message || "Failed to setup workspaces" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/setup-workspaces
 * Check which users don't have workspaces
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    // Only admins can run this
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find all users without workspace memberships
    const usersWithoutWorkspace = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(
        notExists(
          db.select().from(workspaceMembers).where(eq(workspaceMembers.userId, users.id))
        )
      );

    return NextResponse.json({
      count: usersWithoutWorkspace.length,
      users: usersWithoutWorkspace,
    });
  } catch (error: any) {
    console.error("Error checking workspaces:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check workspaces" },
      { status: 500 }
    );
  }
}
