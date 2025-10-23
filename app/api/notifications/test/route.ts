import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { createNotification } from "@/src/lib/notifications/service";
import { logActivity } from "@/src/lib/notifications/activity-logger";
import { db } from "@/src/db";
import { workspaceMembers } from "@/src/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/notifications/test
 * Create test notifications to verify the system is working
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's workspace
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id))
      .limit(1);

    if (!membership) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Create test notifications
    const notifications = [];

    // Test notification 1: Task assigned
    const notif1 = await createNotification({
      userId: user.id,
      type: "TASK_ASSIGNED",
      title: "Test Task Assigned",
      message: 'You have been assigned to the task "Complete notifications system"',
      actionUrl: "/tasks",
      metadata: { test: true },
    });
    notifications.push(notif1);

    // Test notification 2: Project invitation
    const notif2 = await createNotification({
      userId: user.id,
      type: "PROJECT_INVITATION",
      title: "Test Project Invitation",
      message: "You have been invited to join the Test Project",
      actionUrl: "/projects",
      metadata: { test: true },
    });
    notifications.push(notif2);

    // Test notification 3: Invoice sent
    const notif3 = await createNotification({
      userId: user.id,
      type: "INVOICE_SENT",
      title: "Test Invoice Sent",
      message: "Invoice #TEST-001 has been sent to the client",
      actionUrl: "/invoices",
      metadata: { test: true },
    });
    notifications.push(notif3);

    // Create test activities
    const activities = [];

    // Test activity 1: Task created
    const activity1 = await logActivity({
      workspaceId: membership.workspaceId,
      userId: user.id,
      activityType: "TASK_CREATED",
      entityType: "task",
      entityId: "test-task-1",
      title: 'created task "Test Task"',
      description: "in Test Project",
      metadata: { test: true },
    });
    activities.push(activity1);

    // Test activity 2: Project created
    const activity2 = await logActivity({
      workspaceId: membership.workspaceId,
      userId: user.id,
      activityType: "PROJECT_CREATED",
      entityType: "project",
      entityId: "test-project-1",
      title: 'created project "Test Project"',
      metadata: { test: true },
    });
    activities.push(activity2);

    // Test activity 3: File uploaded
    const activity3 = await logActivity({
      workspaceId: membership.workspaceId,
      userId: user.id,
      activityType: "FILE_UPLOADED",
      entityType: "file",
      entityId: "test-file-1",
      title: 'uploaded "test-document.pdf"',
      description: "to Test Project",
      metadata: { test: true },
    });
    activities.push(activity3);

    return NextResponse.json({
      success: true,
      message: "Test notifications and activities created successfully",
      notifications: notifications.length,
      activities: activities.length,
    });
  } catch (error) {
    console.error("Error creating test notifications:", error);
    return NextResponse.json(
      { error: "Failed to create test notifications", details: (error as Error).message },
      { status: 500 }
    );
  }
}
