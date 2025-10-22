import { NextRequest } from "next/server";
import { db } from "@/src/db";
import { expenses } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  requireAuth,
  requirePermission,
  apiSuccess,
  apiError,
  getClientIp,
} from "@/src/lib/api/middleware";
import { logUpdate, logDelete } from "@/src/lib/audit/logger";
import { canApproveExpenses } from "@/src/lib/auth/rbac";

/**
 * GET /api/expenses/[id]
 * Get single expense
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "expenses", "read");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const { id } = await params;
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));

    if (!expense) {
      return apiError("Expense not found", 404);
    }

    return apiSuccess(expense);
  } catch (error) {
    console.error("Failed to fetch expense:", error);
    return apiError("Failed to fetch expense", 500);
  }
}

/**
 * PATCH /api/expenses/[id]
 * Update expense
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, approvedBy, notes } = body;

    const [existing] = await db.select().from(expenses).where(eq(expenses.id, id));

    if (!existing) {
      return apiError("Expense not found", 404);
    }

    // Check if approving and user has permission
    if (status === "APPROVED" && !canApproveExpenses(auth.user.role)) {
      return apiError("You don't have permission to approve expenses", 403);
    }

    const updateData: any = {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      updatedAt: new Date(),
    };

    if (status === "APPROVED") {
      updateData.approvedBy = auth.user.id;
      updateData.approvedAt = new Date();
    }

    const [updated] = await db
      .update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();

    // Audit log
    await logUpdate({
      workspaceId: existing.workspaceId,
      userId: auth.user.id,
      userEmail: auth.user.email || "",
      userRole: auth.user.role,
      entityType: "PROJECT",
      entityId: updated.id,
      entityName: updated.description,
      ipAddress: getClientIp(request),
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("Failed to update expense:", error);
    return apiError("Failed to update expense", 500);
  }
}

/**
 * DELETE /api/expenses/[id]
 * Delete expense
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "expenses", "delete");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const { id } = await params;
    const [existing] = await db.select().from(expenses).where(eq(expenses.id, id));

    if (!existing) {
      return apiError("Expense not found", 404);
    }

    await db.delete(expenses).where(eq(expenses.id, id));

    // Audit log
    await logDelete({
      workspaceId: existing.workspaceId,
      userId: auth.user.id,
      userEmail: auth.user.email || "",
      userRole: auth.user.role,
      entityType: "PROJECT",
      entityId: id,
      entityName: existing.description,
      ipAddress: getClientIp(request),
    });

    return apiSuccess({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return apiError("Failed to delete expense", 500);
  }
}
