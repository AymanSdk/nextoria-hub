import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { integrations } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { isAdmin } from "@/src/lib/auth/rbac";

/**
 * GET /api/integrations/google-drive/status
 * Check if Google Drive is connected and return integration details
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's workspace with role
    const workspace = await getCurrentWorkspace(user.id);
    if (!workspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    // Get active Google Drive integration
    const integration = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.workspaceId, workspace.id),
          eq(integrations.type, "GOOGLE_DRIVE"),
          eq(integrations.isActive, true)
        )
      )
      .limit(1);

    if (integration.length === 0) {
      return NextResponse.json({
        connected: false,
        isAdmin: isAdmin(workspace.role),
      });
    }

    const config = JSON.parse(integration[0].config);

    return NextResponse.json({
      connected: true,
      email: config.email,
      lastSyncAt: integration[0].lastSyncAt,
      allowedFolderIds: config.allowedFolderIds || [],
      isAdmin: isAdmin(workspace.role), // Include admin status
    });
  } catch (error) {
    console.error("Google Drive status error:", error);
    return NextResponse.json(
      { error: "Failed to get Google Drive status" },
      { status: 500 }
    );
  }
}
