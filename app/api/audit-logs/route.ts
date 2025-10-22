import { NextRequest } from "next/server";
import { db } from "@/src/db";
import { auditLogs } from "@/src/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, apiSuccess, apiError } from "@/src/lib/api/middleware";
import { isAdmin } from "@/src/lib/auth/rbac";

/**
 * GET /api/audit-logs
 * List audit logs (admin only)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return apiError(auth.error, auth.status);

  // Only admins can view audit logs
  if (!isAdmin(auth.user.role)) {
    return apiError("Forbidden: Admin access required", 403);
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const userId = searchParams.get("userId");
  const entityType = searchParams.get("entityType");
  const action = searchParams.get("action");
  const limit = parseInt(searchParams.get("limit") || "100");

  try {
    let conditions: any[] = [];

    if (workspaceId) {
      conditions.push(eq(auditLogs.workspaceId, workspaceId));
    }

    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }

    if (entityType) {
      conditions.push(eq(auditLogs.entityType, entityType as any));
    }

    if (action) {
      conditions.push(eq(auditLogs.action, action as any));
    }

    const result = await db
      .select()
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    return apiSuccess(result);
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return apiError("Failed to fetch audit logs", 500);
  }
}
