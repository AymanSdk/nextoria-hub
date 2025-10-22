import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { projectRequests } from "@/src/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/project-requests/stats
 * Get stats about project requests (e.g., pending count for notifications)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only team members can see stats (for badge notifications)
    if (user.role === "CLIENT") {
      return NextResponse.json({ pendingCount: 0 });
    }

    // Count pending project requests
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projectRequests)
      .where(eq(projectRequests.status, "PENDING"));

    return NextResponse.json({
      pendingCount: result?.count || 0,
    });
  } catch (error) {
    console.error("Error fetching project request stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
