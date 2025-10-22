import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getSignedFileUrl } from "@/src/lib/storage/s3";
import { db } from "@/src/db";
import { files, fileAccessLog, clients, projects } from "@/src/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/deliverables/[fileId]/download
 * Get presigned URL to download a deliverable
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;

    // Get file record with relationships
    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId),
      with: {
        project: true,
        client: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Authorization check for clients
    if (user.role === "CLIENT") {
      // Find the client record
      const [clientRecord] = await db
        .select()
        .from(clients)
        .where(eq(clients.email, user.email || ""))
        .limit(1);

      if (!clientRecord) {
        return NextResponse.json({ error: "Client record not found" }, { status: 403 });
      }

      // Check if file belongs to this client
      const hasDirectAccess = file.clientId === clientRecord.id;

      // Check if file belongs to client's project
      let hasProjectAccess = false;
      if (file.projectId) {
        const project = await db.query.projects.findFirst({
          where: eq(projects.id, file.projectId),
        });
        hasProjectAccess = project?.clientId === clientRecord.id;
      }

      if (!hasDirectAccess && !hasProjectAccess) {
        return NextResponse.json(
          {
            error: "You don't have permission to access this file",
          },
          { status: 403 }
        );
      }
    }
    // For non-client users (team members), allow access to all files

    // Generate presigned download URL (valid for 1 hour)
    const downloadUrl = await getSignedFileUrl(file.storageKey, 3600);

    // Log access
    await db.insert(fileAccessLog).values({
      fileId: file.id,
      userId: user.id,
      action: "download",
      ipAddress: req.headers.get("x-forwarded-for") || req.ip || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      downloadUrl,
      fileName: file.name,
      mimeType: file.mimeType,
      size: file.size,
    });
  } catch (error) {
    console.error("Download deliverable error:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
