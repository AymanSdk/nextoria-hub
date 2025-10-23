/**
 * Google Drive Integration
 * Access and manage files from Google Drive
 */

import { db } from "@/src/db";
import { integrations } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  iconLink?: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
  shared?: boolean;
}

export interface DriveIntegrationConfig {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
  email: string;
}

/**
 * Refresh access token if needed
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
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

export class GoogleDriveIntegration {
  private integrationId: string;
  private config: DriveIntegrationConfig;

  constructor(integrationId: string, config: DriveIntegrationConfig) {
    this.integrationId = integrationId;
    this.config = config;
  }

  /**
   * Get valid access token (refresh if needed)
   */
  private async getValidAccessToken(): Promise<string> {
    const now = Date.now();

    // If token is still valid (with 5 minute buffer), return it
    if (this.config.expires_at && this.config.expires_at > now + 5 * 60 * 1000) {
      return this.config.access_token;
    }

    // Refresh the token
    if (!this.config.refresh_token) {
      throw new Error("No refresh token available");
    }

    const newTokens = await refreshAccessToken(this.config.refresh_token);

    // Update the config with new tokens
    this.config = {
      ...this.config,
      access_token: newTokens.access_token,
      expires_at: Date.now() + newTokens.expires_in * 1000,
    };

    // Save updated config to database
    await db
      .update(integrations)
      .set({
        config: JSON.stringify(this.config),
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, this.integrationId));

    return newTokens.access_token;
  }

  /**
   * List files from a folder
   */
  async listFiles(
    folderId?: string,
    pageSize: number = 100,
    pageToken?: string
  ): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
    try {
      const accessToken = await this.getValidAccessToken();

      let query = "trashed=false";
      if (folderId) {
        query += ` and '${folderId}' in parents`;
      }

      const params = new URLSearchParams({
        q: query,
        pageSize: pageSize.toString(),
        fields:
          "nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink, iconLink, createdTime, modifiedTime, size, owners, shared)",
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
        throw new Error(`Google Drive API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        files: data.files || [],
        nextPageToken: data.nextPageToken,
      };
    } catch (error) {
      console.error("Google Drive list error:", error);
      return { files: [] };
    }
  }

  /**
   * Search files
   */
  async searchFiles(searchQuery: string, pageSize: number = 50): Promise<DriveFile[]> {
    try {
      const accessToken = await this.getValidAccessToken();

      const query = `trashed=false and name contains '${searchQuery}'`;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
          query
        )}&pageSize=${pageSize}&fields=files(id,name,mimeType,webViewLink,thumbnailLink,iconLink,createdTime,modifiedTime,size,owners,shared)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error("Google Drive search error:", error);
      return [];
    }
  }

  /**
   * Get file metadata
   */
  async getFile(fileId: string): Promise<DriveFile | null> {
    try {
      const accessToken = await this.getValidAccessToken();

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink,thumbnailLink,iconLink,createdTime,modifiedTime,size,owners,shared`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get file: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Google Drive get file error:", error);
      return null;
    }
  }

  /**
   * Create a folder
   */
  async createFolder(name: string, parentId?: string): Promise<string | null> {
    try {
      const accessToken = await this.getValidAccessToken();

      const metadata: any = {
        name,
        mimeType: "application/vnd.google-apps.folder",
      };

      if (parentId) {
        metadata.parents = [parentId];
      }

      const response = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.statusText}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Google Drive create folder error:", error);
      return null;
    }
  }

  /**
   * Get folder tree
   */
  async getFolders(): Promise<DriveFile[]> {
    try {
      const accessToken = await this.getValidAccessToken();

      const query = "mimeType='application/vnd.google-apps.folder' and trashed=false";

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
          query
        )}&pageSize=100&fields=files(id,name,mimeType)&orderBy=name`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error("Google Drive get folders error:", error);
      return [];
    }
  }
}

/**
 * Initialize Google Drive integration for a workspace
 */
export async function initGoogleDriveIntegration(
  workspaceId: string
): Promise<GoogleDriveIntegration | null> {
  try {
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
      return null;
    }

    const config: DriveIntegrationConfig = JSON.parse(integration[0].config);

    return new GoogleDriveIntegration(integration[0].id, config);
  } catch (error) {
    console.error("Failed to initialize Google Drive integration:", error);
    return null;
  }
}

/**
 * Check if Google Drive is connected for a workspace
 */
export async function isGoogleDriveConnected(workspaceId: string): Promise<boolean> {
  try {
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

    return integration.length > 0;
  } catch (error) {
    return false;
  }
}
