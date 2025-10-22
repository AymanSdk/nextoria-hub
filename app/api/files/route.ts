import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { files, clients, projects } from "@/src/db/schema";
import { eq, desc, isNull, and, or, inArray } from "drizzle-orm";

/**
 * GET /api/files
 * List all files with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isClient = user.role === "CLIENT";
    let allFiles;

    if (isClient) {
      // For clients, only show files related to them or their projects
      // First, find the client record
      const [clientRecord] = await db
        .select()
        .from(clients)
        .where(eq(clients.email, user.email || ""))
        .limit(1);

      if (!clientRecord) {
        // Client record not found, return empty
        return NextResponse.json({
          files: [],
          stats: {
            total: 0,
            byType: { projects: 0, clients: 0, tasks: 0, general: 0 },
            totalSize: 0,
          },
        });
      }

      // Get all projects belonging to this client
      const clientProjects = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.clientId, clientRecord.id));

      const clientProjectIds = clientProjects.map((p) => p.id);

      // Fetch files that are either:
      // 1. Directly assigned to the client (clientId matches)
      // 2. Assigned to one of the client's projects
      if (clientProjectIds.length > 0) {
        allFiles = await db.query.files.findMany({
          where: and(
            eq(files.isArchived, false),
            or(
              eq(files.clientId, clientRecord.id),
              inArray(files.projectId, clientProjectIds)
            )
          ),
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
      } else {
        // No projects, only show files directly assigned to client
        allFiles = await db.query.files.findMany({
          where: and(eq(files.isArchived, false), eq(files.clientId, clientRecord.id)),
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
      }
    } else {
      // For non-client users (team members), fetch all files
      allFiles = await db.query.files.findMany({
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
    }

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
