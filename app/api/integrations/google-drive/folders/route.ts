import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { integrations } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { isAdmin } from "@/src/lib/auth/rbac";

/**
 * Refresh access token if needed
 */
async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return await response.json();
}

/**
 * Get valid access token (refresh if needed)
 */
async function getValidAccessToken(integration: any) {
  const config = JSON.parse(integration.config);
  const now = Date.now();

  // If token is still valid (with 5 minute buffer), return it
  if (config.expires_at && config.expires_at > now + 5 * 60 * 1000) {
    return config.access_token;
  }

  // Refresh the token
  if (!config.refresh_token) {
    throw new Error("No refresh token available");
  }

  const newTokens = await refreshAccessToken(config.refresh_token);

  // Update the config with new tokens
  const updatedConfig = {
    ...config,
    access_token: newTokens.access_token,
    expires_at: Date.now() + newTokens.expires_in * 1000,
  };

  // Save updated config to database
  await db
    .update(integrations)
    .set({
      config: JSON.stringify(updatedConfig),
      updatedAt: new Date(),
    })
    .where(eq(integrations.id, integration.id));

  return newTokens.access_token;
}

/**
 * GET /api/integrations/google-drive/folders
 * List folders from Google Drive
 */
export async function GET(req: NextRequest) {
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

    // 🔒 SECURITY: Only admins can view folders for selection
    if (!isAdmin(workspace.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can manage folder access" },
        { status: 403 }
      );
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

    // Get valid access token (refresh if needed)
    const accessToken = await getValidAccessToken(integration[0]);

    // Query to get only folders
    const driveQuery = "mimeType='application/vnd.google-apps.folder' and trashed=false";

    // Fetch folders from Google Drive
    const params = new URLSearchParams({
      q: driveQuery,
      pageSize: "100",
      fields: "files(id, name, shared)",
      orderBy: "name",
    });

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Google Drive API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch folders from Google Drive" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      folders: data.files || [],
    });
  } catch (error) {
    console.error("Google Drive folders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google Drive folders" },
      { status: 500 }
    );
  }
}
