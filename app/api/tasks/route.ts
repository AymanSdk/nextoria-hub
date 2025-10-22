import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { tasks } from "@/src/db/schema";
import { desc } from "drizzle-orm";

/**
 * GET /api/tasks
 * List all tasks
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    const allTasks = await db.query.tasks.findMany({
      orderBy: [desc(tasks.createdAt)],
      with: {
        project: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      limit: 100, // Limit to recent 100 tasks
    });

    return NextResponse.json({ tasks: allTasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
