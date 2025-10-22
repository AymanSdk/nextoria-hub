/**
 * Google Drive Integration
 * Access and manage files from Google Drive
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
}

export class GoogleDriveIntegration {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * List files from a folder
   */
  async listFiles(folderId?: string, pageSize: number = 100): Promise<DriveFile[]> {
    try {
      const query = folderId 
        ? `'${folderId}' in parents and trashed=false`
        : "trashed=false";

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=${pageSize}&fields=files(id,name,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime,size)`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error("Google Drive list error:", error);
      return [];
    }
  }

  /**
   * Get file metadata
   */
  async getFile(fileId: string): Promise<DriveFile | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime,size`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

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
      const metadata: any = {
        name,
        mimeType: "application/vnd.google-apps.folder",
      };

      if (parentId) {
        metadata.parents = [parentId];
      }

      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadata),
        }
      );

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Google Drive create folder error:", error);
      return null;
    }
  }
}

/**
 * Initialize Google Drive integration
 */
export async function initGoogleDriveIntegration(
  userId: string
): Promise<GoogleDriveIntegration | null> {
  // In production, fetch access token from database
  // This would be stored when user connects their Google account
  const accessToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;

  if (!accessToken) {
    return null;
  }

  return new GoogleDriveIntegration(accessToken);
}

