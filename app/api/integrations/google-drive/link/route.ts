import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getCurrentWorkspaceId } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { driveFiles } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/integrations/google-drive/link
 * Link a Google Drive file to a project, client, or task
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

    const body = await req.json();
    const {
      fileId,
      fileName,
      mimeType,
      webViewLink,
      size,
      linkType,
      entityId,
      description,
      tags,
    } = body;

    // Validate required fields
    if (!fileId || !fileName || !linkType || !entityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate linkType
    if (!["project", "client", "task"].includes(linkType)) {
      return NextResponse.json({ error: "Invalid link type" }, { status: 400 });
    }

    // Create the link record
    const linkData: any = {
      workspaceId,
      driveFileId: fileId,
      fileName,
      mimeType,
      webViewLink,
      size,
      linkType,
      description: description || null,
      tags: tags || null,
      linkedBy: user.id,
    };

    // Set the appropriate entity ID based on linkType
    if (linkType === "project") {
      linkData.projectId = entityId;
    } else if (linkType === "client") {
      linkData.clientId = entityId;
    } else if (linkType === "task") {
      linkData.taskId = entityId;
    }

    const [link] = await db.insert(driveFiles).values(linkData).returning();

    return NextResponse.json({
      success: true,
      link,
    });
  } catch (error) {
    console.error("Google Drive link error:", error);
    return NextResponse.json(
      { error: "Failed to link Google Drive file" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/google-drive/link
 * Get linked Google Drive files for a project, client, or task
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const linkType = searchParams.get("linkType");
    const entityId = searchParams.get("entityId");

    if (!linkType || !entityId) {
      return NextResponse.json(
        { error: "Missing linkType or entityId" },
        { status: 400 }
      );
    }

    let links;

    if (linkType === "project") {
      links = await db
        .select()
        .from(driveFiles)
        .where(eq(driveFiles.projectId, entityId));
    } else if (linkType === "client") {
      links = await db.select().from(driveFiles).where(eq(driveFiles.clientId, entityId));
    } else if (linkType === "task") {
      links = await db.select().from(driveFiles).where(eq(driveFiles.taskId, entityId));
    } else {
      return NextResponse.json({ error: "Invalid link type" }, { status: 400 });
    }

    return NextResponse.json({
      links: links || [],
    });
  } catch (error) {
    console.error("Google Drive get links error:", error);
    return NextResponse.json({ error: "Failed to fetch linked files" }, { status: 500 });
  }
}
