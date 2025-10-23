import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getCurrentWorkspaceId } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { integrations } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

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
 * GET /api/integrations/google-drive/files
 * List files from Google Drive
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const pageToken = searchParams.get("pageToken");
    const query = searchParams.get("query");

    // Get active Google Drive integration
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
      return NextResponse.json({ error: "Google Drive not connected" }, { status: 404 });
    }

    // Get valid access token (refresh if needed)
    const accessToken = await getValidAccessToken(integration[0]);

    // Build query for Google Drive API
    let driveQuery = "trashed=false";
    if (folderId) {
      driveQuery += ` and '${folderId}' in parents`;
    }
    if (query) {
      driveQuery += ` and name contains '${query}'`;
    }

    // Fetch files from Google Drive
    const params = new URLSearchParams({
      q: driveQuery,
      pageSize: pageSize.toString(),
      fields:
        "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, iconLink, owners, shared)",
      orderBy: "modifiedTime desc",
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

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
        { error: "Failed to fetch files from Google Drive" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Update last sync time
    await db
      .update(integrations)
      .set({
        lastSyncAt: new Date(),
      })
      .where(eq(integrations.id, integration[0].id));

    return NextResponse.json({
      files: data.files || [],
      nextPageToken: data.nextPageToken,
    });
  } catch (error) {
    console.error("Google Drive files error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google Drive files" },
      { status: 500 }
    );
  }
}
