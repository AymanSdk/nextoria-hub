import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getCurrentWorkspaceId } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { integrations } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/integrations/google-drive/status
 * Check if Google Drive is connected
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json({ connected: false });
    }

    const integration = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.workspaceId, workspaceId),
          eq(integrations.type, "GOOGLE_DRIVE"),
          eq(integrations.isActive, true)
        )
      )
      .limit(1);

    if (integration.length === 0) {
      return NextResponse.json({
        connected: false,
      });
    }

    const config = JSON.parse(integration[0].config);

    return NextResponse.json({
      connected: true,
      email: config.email,
      connectedAt: integration[0].createdAt,
      lastSyncAt: integration[0].lastSyncAt,
    });
  } catch (error) {
    console.error("Google Drive status error:", error);
    return NextResponse.json(
      { error: "Failed to check Google Drive status" },
      { status: 500 }
    );
  }
}
