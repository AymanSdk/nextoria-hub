import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getRecentActivities } from "@/src/lib/notifications/activity-logger";
import { db } from "@/src/db";
import { workspaceMembers } from "@/src/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/activity
 * Get recent activities for the workspace
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's workspace
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id))
      .limit(1);

    if (!membership) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const entityType = searchParams.get("entityType") || undefined;

    const activities = await getRecentActivities({
      workspaceId: membership.workspaceId,
      limit,
      entityType,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
