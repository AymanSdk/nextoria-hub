import { NextRequest } from "next/server";
import { db } from "@/src/db";
import { expenses } from "@/src/db/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  requireAuth,
  requirePermission,
  apiSuccess,
  apiError,
  getClientIp,
} from "@/src/lib/api/middleware";
import { logCreate } from "@/src/lib/audit/logger";

/**
 * GET /api/expenses
 * List all expenses for workspace
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "expenses", "read");
  if ("error" in auth) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");

  if (!workspaceId) {
    return apiError("workspaceId is required", 400);
  }

  try {
    let conditions = [eq(expenses.workspaceId, workspaceId)];

    if (projectId) {
      conditions.push(eq(expenses.projectId, projectId));
    }

    if (status) {
      conditions.push(eq(expenses.status, status as any));
    }

    const result = await db
      .select()
      .from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.expenseDate));

    return apiSuccess(result);
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return apiError("Failed to fetch expenses", 500);
  }
}

/**
 * POST /api/expenses
 * Create a new expense
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "expenses", "create");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const body = await request.json();
    const {
      workspaceId,
      projectId,
      description,
      category,
      amount,
      currency,
      expenseDate,
      vendor,
      receiptUrl,
      isReimbursable,
      notes,
    } = body;

    if (!workspaceId || !description || !category || !amount || !expenseDate) {
      return apiError(
        "Missing required fields: workspaceId, description, category, amount, expenseDate",
        400
      );
    }

    const [expense] = await db
      .insert(expenses)
      .values({
        workspaceId,
        projectId,
        description,
        category,
        status: "DRAFT",
        amount,
        currency: currency || "USD",
        expenseDate: new Date(expenseDate),
        vendor,
        receiptUrl,
        submittedBy: auth.user.id,
        isReimbursable: isReimbursable || false,
        notes,
      })
      .returning();

    // Audit log
    await logCreate({
      workspaceId,
      userId: auth.user.id,
      userEmail: auth.user.email || "",
      userRole: auth.user.role,
      entityType: "PROJECT",
      entityId: expense.id,
      entityName: expense.description,
      ipAddress: getClientIp(request),
    });

    return apiSuccess(expense, 201);
  } catch (error) {
    console.error("Failed to create expense:", error);
    return apiError("Failed to create expense", 500);
  }
}
