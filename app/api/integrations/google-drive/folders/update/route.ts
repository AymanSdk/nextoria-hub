import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { integrations } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { isAdmin } from "@/src/lib/auth/rbac";

/**
 * POST /api/integrations/google-drive/folders/update
 * Update allowed folder IDs for Google Drive integration
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

    // 🔒 SECURITY: Only admins can update folder permissions
    if (!isAdmin(workspace.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can update folder permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { folderIds } = body;

    if (!Array.isArray(folderIds)) {
      return NextResponse.json({ error: "folderIds must be an array" }, { status: 400 });
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
      return NextResponse.json({ error: "Google Drive not connected" }, { status: 404 });
    }

    // Parse existing config
    const config = JSON.parse(integration[0].config);

    // Update config with allowed folders
    const updatedConfig = {
      ...config,
      allowedFolderIds: folderIds,
    };

    // Save updated config to database
    await db
      .update(integrations)
      .set({
        config: JSON.stringify(updatedConfig),
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, integration[0].id));

    return NextResponse.json({
      success: true,
      allowedFolderIds: folderIds,
    });
  } catch (error) {
    console.error("Google Drive folder update error:", error);
    return NextResponse.json(
      { error: "Failed to update folder permissions" },
      { status: 500 }
    );
  }
}
