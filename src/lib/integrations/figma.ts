/**
 * Figma Integration
 * Access Figma files and projects
 */

export interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

export interface FigmaProject {
  id: string;
  name: string;
}

export class FigmaIntegration {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get team projects
   */
  async getTeamProjects(teamId: string): Promise<FigmaProject[]> {
    try {
      const response = await fetch(
        `https://api.figma.com/v1/teams/${teamId}/projects`,
        {
          headers: {
            "X-Figma-Token": this.accessToken,
          },
        }
      );

      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.error("Figma get projects error:", error);
      return [];
    }
  }

  /**
   * Get project files
   */
  async getProjectFiles(projectId: string): Promise<FigmaFile[]> {
    try {
      const response = await fetch(
        `https://api.figma.com/v1/projects/${projectId}/files`,
        {
          headers: {
            "X-Figma-Token": this.accessToken,
          },
        }
      );

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error("Figma get files error:", error);
      return [];
    }
  }

  /**
   * Get file details
   */
  async getFile(fileKey: string): Promise<any> {
    try {
      const response = await fetch(
        `https://api.figma.com/v1/files/${fileKey}`,
        {
          headers: {
            "X-Figma-Token": this.accessToken,
          },
        }
      );

      return await response.json();
    } catch (error) {
      console.error("Figma get file error:", error);
      return null;
    }
  }

  /**
   * Get file images/thumbnails
   */
  async getFileImages(fileKey: string, nodeIds: string[]): Promise<Record<string, string>> {
    try {
      const response = await fetch(
        `https://api.figma.com/v1/images/${fileKey}?ids=${nodeIds.join(",")}`,
        {
          headers: {
            "X-Figma-Token": this.accessToken,
          },
        }
      );

      const data = await response.json();
      return data.images || {};
    } catch (error) {
      console.error("Figma get images error:", error);
      return {};
    }
  }
}

/**
 * Initialize Figma integration
 */
export async function initFigmaIntegration(
  workspaceId: string
): Promise<FigmaIntegration | null> {
  // In production, fetch from database
  const accessToken = process.env.FIGMA_ACCESS_TOKEN;

  if (!accessToken) {
    return null;
  }

  return new FigmaIntegration(accessToken);
}

