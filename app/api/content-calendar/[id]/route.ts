import { NextRequest } from "next/server";
import { db } from "@/src/db";
import { contentCalendar } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  requirePermission,
  apiSuccess,
  apiError,
  getClientIp,
} from "@/src/lib/api/middleware";
import { logUpdate, logDelete } from "@/src/lib/audit/logger";

/**
 * GET /api/content-calendar/[id]
 * Get a single content calendar item
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission(request, "content", "read");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const [item] = await db
      .select()
      .from(contentCalendar)
      .where(eq(contentCalendar.id, params.id))
      .limit(1);

    if (!item) {
      return apiError("Content not found", 404);
    }

    return apiSuccess(item);
  } catch (error) {
    console.error("Failed to fetch content calendar item:", error);
    return apiError("Failed to fetch content calendar item", 500);
  }
}

/**
 * PATCH /api/content-calendar/[id]
 * Update a content calendar item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePermission(request, "content", "update");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const body = await request.json();
    const {
      title,
      description,
      type,
      status,
      platform,
      publishDate,
      assignedTo,
      contentBody,
      tags,
      keywords,
      isRecurring,
    } = body;

    // Get existing item for audit log
    const [existingItem] = await db
      .select()
      .from(contentCalendar)
      .where(eq(contentCalendar.id, params.id))
      .limit(1);

    if (!existingItem) {
      return apiError("Content not found", 404);
    }

    const [updatedItem] = await db
      .update(contentCalendar)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(platform !== undefined && { platform }),
        ...(publishDate !== undefined && {
          publishDate: publishDate ? new Date(publishDate) : null,
        }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(contentBody !== undefined && { contentBody }),
        ...(tags !== undefined && { tags }),
        ...(keywords !== undefined && { keywords }),
        ...(isRecurring !== undefined && { isRecurring }),
        updatedAt: new Date(),
      })
      .where(eq(contentCalendar.id, params.id))
      .returning();

    // Audit log (non-blocking)
    try {
      await logUpdate({
        workspaceId: existingItem.workspaceId,
        userId: auth.user.id,
        userEmail: auth.user.email || "",
        userRole: auth.user.role,
        entityType: "CONTENT",
        entityId: updatedItem.id,
        entityName: updatedItem.title,
        changes: body,
        ipAddress: getClientIp(request),
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
    }

    return apiSuccess(updatedItem);
  } catch (error) {
    console.error("Failed to update content calendar item:", error);
    return apiError("Failed to update content calendar item", 500);
  }
}

/**
 * DELETE /api/content-calendar/[id]
 * Delete a content calendar item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePermission(request, "content", "delete");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    // Get existing item for audit log
    const [existingItem] = await db
      .select()
      .from(contentCalendar)
      .where(eq(contentCalendar.id, params.id))
      .limit(1);

    if (!existingItem) {
      return apiError("Content not found", 404);
    }

    await db.delete(contentCalendar).where(eq(contentCalendar.id, params.id));

    // Audit log (non-blocking)
    try {
      await logDelete({
        workspaceId: existingItem.workspaceId,
        userId: auth.user.id,
        userEmail: auth.user.email || "",
        userRole: auth.user.role,
        entityType: "CONTENT",
        entityId: existingItem.id,
        entityName: existingItem.title,
        ipAddress: getClientIp(request),
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
    }

    return apiSuccess({ message: "Content deleted successfully" });
  } catch (error) {
    console.error("Failed to delete content calendar item:", error);
    return apiError("Failed to delete content calendar item", 500);
  }
}
