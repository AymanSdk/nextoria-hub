import { NextRequest } from "next/server";
import { db } from "@/src/db";
import { approvals } from "@/src/db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import {
  requireAuth,
  requirePermission,
  apiSuccess,
  apiError,
  getClientIp,
} from "@/src/lib/api/middleware";
import { logCreate } from "@/src/lib/audit/logger";

/**
 * GET /api/approvals
 * List approvals (filtered by user role)
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "approvals", "read");
  if ("error" in auth) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");

  try {
    let conditions: any[] = [];

    // Clients can only see approvals they're assigned to approve
    if (auth.user.role === "CLIENT") {
      conditions.push(eq(approvals.approverId, auth.user.id));
    }

    if (projectId) {
      conditions.push(eq(approvals.projectId, projectId));
    }

    if (status) {
      conditions.push(eq(approvals.status, status as any));
    }

    const result = await db
      .select()
      .from(approvals)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(approvals.createdAt));

    return apiSuccess(result);
  } catch (error) {
    console.error("Failed to fetch approvals:", error);
    return apiError("Failed to fetch approvals", 500);
  }
}

/**
 * POST /api/approvals
 * Create a new approval request
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "approvals", "create");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const body = await request.json();
    const { title, description, type, projectId, taskId, approverId, dueDate } =
      body;

    if (!title || !type || !projectId || !approverId) {
      return apiError(
        "Missing required fields: title, type, projectId, approverId",
        400
      );
    }

    const [approval] = await db
      .insert(approvals)
      .values({
        title,
        description,
        type,
        status: "PENDING",
        projectId,
        taskId,
        requestedBy: auth.user.id,
        approverId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      })
      .returning();

    // TODO: Send notification to approver

    return apiSuccess(approval, 201);
  } catch (error) {
    console.error("Failed to create approval:", error);
    return apiError("Failed to create approval", 500);
  }
}
