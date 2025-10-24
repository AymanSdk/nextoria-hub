import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { users, workspaceMembers } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/users
 * Get users in current workspace (with optional role filter)
 */
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");

    // 🔒 SECURITY: Get user's workspace
    const workspace = await getCurrentWorkspace(currentUser.id);
    if (!workspace) {
      return NextResponse.json({ error: "No workspace access" }, { status: 403 });
    }

    // Build query - only fetch users in the same workspace
    const conditions = [
      eq(workspaceMembers.workspaceId, workspace.id),
      eq(workspaceMembers.isActive, true),
    ];

    if (roleFilter) {
      conditions.push(eq(users.role, roleFilter as any));
    }

    // Fetch users from workspace
    const workspaceUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(workspaceMembers, eq(users.id, workspaceMembers.userId))
      .where(and(...conditions))
      .orderBy(users.name);

    return NextResponse.json({ users: workspaceUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
