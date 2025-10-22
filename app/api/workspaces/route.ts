import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { workspaces, workspaceMembers } from "@/src/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/workspaces
 * Get all workspaces for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Get all workspaces where the user is a member
    const userWorkspaces = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        slug: workspaces.slug,
        description: workspaces.description,
        logo: workspaces.logo,
        ownerId: workspaces.ownerId,
        isActive: workspaces.isActive,
      })
      .from(workspaces)
      .innerJoin(
        workspaceMembers,
        eq(workspaceMembers.workspaceId, workspaces.id)
      )
      .where(eq(workspaceMembers.userId, user.id));

    return NextResponse.json({ workspaces: userWorkspaces });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

