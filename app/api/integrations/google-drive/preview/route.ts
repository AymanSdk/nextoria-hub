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
 * GET /api/integrations/google-drive/preview
 * Proxy for downloading/previewing Google Drive files with authentication
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
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

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

    // Fetch file content from Google Drive
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Google Drive API error:", await response.text());
      return NextResponse.json(
        { error: "Failed to fetch file from Google Drive" },
        { status: response.status }
      );
    }

    // Get file metadata for content type
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const metadata = await metadataResponse.json();
    const contentType = metadata.mimeType || "application/octet-stream";

    // Stream the file content
    const fileBuffer = await response.arrayBuffer();

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Google Drive preview error:", error);
    return NextResponse.json({ error: "Failed to preview file" }, { status: 500 });
  }
}
