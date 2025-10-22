import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { files } from "@/src/db/schema";
import { eq, desc, isNull, and, or } from "drizzle-orm";

/**
 * GET /api/files
 * List all files with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Fetch all files (filtering is done in the frontend)
    const allFiles = await db.query.files.findMany({
      where: eq(files.isArchived, false),
      orderBy: [desc(files.createdAt)],
      with: {
        uploadedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        project: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
        task: {
          columns: {
            id: true,
            title: true,
          },
        },
        client: {
          columns: {
            id: true,
            name: true,
            companyName: true,
          },
        },
      },
    });

    // Calculate stats
    const stats = {
      total: allFiles.length,
      byType: {
        projects: allFiles.filter((f) => f.projectId).length,
        // Only count files directly uploaded to clients (not through projects)
        clients: allFiles.filter((f) => f.clientId && !f.projectId).length,
        tasks: allFiles.filter((f) => f.taskId).length,
        general: allFiles.filter((f) => !f.projectId && !f.clientId && !f.taskId).length,
      },
      totalSize: allFiles.reduce((acc, f) => acc + f.size, 0),
    };

    return NextResponse.json({ files: allFiles, stats });
  } catch (error) {
    console.error("Get files error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
