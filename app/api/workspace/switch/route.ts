import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { workspaceMembers } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { setCurrentWorkspaceId } from "@/src/lib/workspace/context";

/**
 * POST /api/workspace/switch
 * Switch the user's current workspace
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    // Verify user has access to this workspace
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, user.id),
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.isActive, true)
        )
      )
      .limit(1);

    if (!membership) {
      return NextResponse.json(
        { error: "You don't have access to this workspace" },
        { status: 403 }
      );
    }

    // Set the workspace ID in cookie
    await setCurrentWorkspaceId(workspaceId);

    return NextResponse.json({ success: true, workspaceId });
  } catch (error: any) {
    console.error("Error switching workspace:", error);
    return NextResponse.json(
      { error: error.message || "Failed to switch workspace" },
      { status: 500 }
    );
  }
}

