import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getCurrentWorkspaceId } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { integrations } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/integrations/google-drive/disconnect
 * Disconnect Google Drive integration
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
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
          eq(integrations.workspaceId, workspaceId),
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
