import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { integrations } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { isAdmin } from "@/src/lib/auth/rbac";

/**
 * POST /api/integrations/google-drive/disconnect
 * Disconnect Google Drive integration
 * 🔒 ADMIN ONLY - Only workspace admins can disconnect integrations
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔒 SECURITY: Get user's workspace with role
    const workspace = await getCurrentWorkspace(user.id);
    if (!workspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    // 🔒 SECURITY: Only admins can disconnect integrations
    if (!isAdmin(workspace.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only workspace admins can disconnect integrations" },
        { status: 403 }
      );
    }

    // Deactivate the integration
    await db
      .update(integrations)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(integrations.workspaceId, workspace.id),
          eq(integrations.type, "GOOGLE_DRIVE")
        )
      );

    return NextResponse.json({
      success: true,
      message: "Google Drive disconnected successfully",
    });
  } catch (error) {
    console.error("Google Drive disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google Drive" },
      { status: 500 }
    );
  }
}
