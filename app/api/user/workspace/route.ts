import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { workspaceMembers, workspaces } from "@/src/db/schema/workspaces";
import { getCurrentUser } from "@/src/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * GET /api/user/workspace
 * Get the current user's default workspace
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    // Get user's first workspace (primary workspace)
    const [membership] = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        workspaceName: workspaces.name,
        workspaceSlug: workspaces.slug,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, user.id))
      .limit(1);

    if (!membership) {
      return NextResponse.json(
        { error: "No workspace found. Please contact your administrator." },
        { status: 404 }
      );
    }

    return NextResponse.json(membership);
  } catch (error) {
    console.error("Error fetching user workspace:", error);
    return NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 });
  }
}
