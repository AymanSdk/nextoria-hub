# Notification Integration Example

This document shows practical examples of how to integrate the notification system into your existing API routes.

## Example 1: Task Creation with Notifications

Let's say you have a task creation API route at `app/api/tasks/route.ts`. Here's how to add notifications:

### Before (without notifications):

```typescript
// app/api/tasks/route.ts
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const body = await req.json();

  const [task] = await db
    .insert(tasks)
    .values({
      title: body.title,
      description: body.description,
      projectId: body.projectId,
      assigneeId: body.assigneeId,
      reporterId: user.id,
      status: "TODO",
    })
    .returning();

  return NextResponse.json({ task }, { status: 201 });
}
```

### After (with notifications):

```typescript
// app/api/tasks/route.ts
import { notifyTaskAssigned } from "@/src/lib/notifications/service";
import { logTaskCreated } from "@/src/lib/notifications/activity-logger";
import { projects } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const body = await req.json();

  const [task] = await db
    .insert(tasks)
    .values({
      title: body.title,
      description: body.description,
      projectId: body.projectId,
      assigneeId: body.assigneeId,
      reporterId: user.id,
      status: "TODO",
    })
    .returning();

  // Get project name for notification context
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, body.projectId));

  // Get user's workspace ID
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, user.id));

  // Log activity for the activity feed
  if (membership) {
    await logTaskCreated({
      workspaceId: membership.workspaceId,
      userId: user.id,
      taskId: task.id,
      taskTitle: task.title,
      projectName: project?.name,
    });
  }

  // Send notification to assignee
  if (body.assigneeId && body.assigneeId !== user.id) {
    await notifyTaskAssigned({
      taskId: task.id,
      taskTitle: task.title,
      assigneeId: body.assigneeId,
      assignedBy: user.id,
      projectName: project?.name || "Unknown Project",
    });
  }

  return NextResponse.json({ task }, { status: 201 });
}
```

## Example 2: Task Status Update

### Before:

```typescript
// app/api/tasks/[id]/route.ts
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const body = await req.json();

  const [task] = await db
    .update(tasks)
    .set({ status: body.status })
    .where(eq(tasks.id, params.id))
    .returning();

  return NextResponse.json({ task });
}
```

### After:

```typescript
// app/api/tasks/[id]/route.ts
import { notifyTaskStatusChanged } from "@/src/lib/notifications/service";
import { logTaskStatusChanged } from "@/src/lib/notifications/activity-logger";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const body = await req.json();

  // Get current task to know old status
  const [currentTask] = await db.select().from(tasks).where(eq(tasks.id, params.id));

  if (!currentTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const oldStatus = currentTask.status;

  // Update task
  const [task] = await db
    .update(tasks)
    .set({ status: body.status })
    .where(eq(tasks.id, params.id))
    .returning();

  // Get user's workspace
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, user.id));

  // Log activity
  if (membership && oldStatus !== body.status) {
    await logTaskStatusChanged({
      workspaceId: membership.workspaceId,
      userId: user.id,
      taskId: task.id,
      taskTitle: task.title,
      oldStatus,
      newStatus: body.status,
    });
  }

  // Notify assignee if status changed and not the current user
  if (task.assigneeId && task.assigneeId !== user.id && oldStatus !== body.status) {
    await notifyTaskStatusChanged({
      taskId: task.id,
      taskTitle: task.title,
      notifyUserId: task.assigneeId,
      oldStatus,
      newStatus: body.status,
      changedBy: user.id,
    });
  }

  return NextResponse.json({ task });
}
```

## Example 3: Invoice Payment

### Before:

```typescript
// app/api/invoices/[id]/pay/route.ts
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const [invoice] = await db
    .update(invoices)
    .set({
      status: "PAID",
      paidAt: new Date(),
    })
    .where(eq(invoices.id, params.id))
    .returning();

  return NextResponse.json({ invoice });
}
```

### After:

```typescript
// app/api/invoices/[id]/pay/route.ts
import { notifyInvoicePaid } from "@/src/lib/notifications/service";
import { users } from "@/src/db/schema";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const [invoice] = await db
    .update(invoices)
    .set({
      status: "PAID",
      paidAt: new Date(),
    })
    .where(eq(invoices.id, params.id))
    .returning();

  // Notify the invoice creator
  if (invoice.createdBy) {
    await notifyInvoicePaid({
      userId: invoice.createdBy,
      invoiceNumber: invoice.number,
      amount: invoice.total,
      currency: invoice.currency,
    });
  }

  // Also notify all admins
  const admins = await db.select().from(users).where(eq(users.role, "ADMIN"));

  for (const admin of admins) {
    if (admin.id !== invoice.createdBy) {
      await notifyInvoicePaid({
        userId: admin.id,
        invoiceNumber: invoice.number,
        amount: invoice.total,
        currency: invoice.currency,
      });
    }
  }

  return NextResponse.json({ invoice });
}
```

## Example 4: File Upload

### Before:

```typescript
// app/api/files/route.ts
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const projectId = formData.get("projectId") as string;

  // Upload file to storage
  const fileUrl = await uploadToStorage(file);

  const [uploadedFile] = await db
    .insert(files)
    .values({
      name: file.name,
      url: fileUrl,
      size: file.size,
      mimeType: file.type,
      uploadedBy: user.id,
      projectId,
    })
    .returning();

  return NextResponse.json({ file: uploadedFile });
}
```

### After:

```typescript
// app/api/files/route.ts
import { notifyFileUploaded } from "@/src/lib/notifications/service";
import { logFileUploaded } from "@/src/lib/notifications/activity-logger";
import { projectMembers, projects } from "@/src/db/schema";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const projectId = formData.get("projectId") as string;

  // Upload file to storage
  const fileUrl = await uploadToStorage(file);

  const [uploadedFile] = await db
    .insert(files)
    .values({
      name: file.name,
      url: fileUrl,
      size: file.size,
      mimeType: file.type,
      uploadedBy: user.id,
      projectId,
    })
    .returning();

  // Get project details and members
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));

  const members = await db
    .select({ userId: projectMembers.userId })
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId));

  // Get user's workspace
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, user.id));

  // Log activity
  if (membership) {
    await logFileUploaded({
      workspaceId: membership.workspaceId,
      userId: user.id,
      fileId: uploadedFile.id,
      fileName: uploadedFile.name,
      entityType: "project",
      entityName: project?.name,
    });
  }

  // Notify all project members (except uploader)
  const memberIds = members.map((m) => m.userId).filter((id) => id !== user.id);

  if (memberIds.length > 0) {
    await notifyFileUploaded({
      fileId: uploadedFile.id,
      fileName: uploadedFile.name,
      uploadedBy: user.id,
      notifyUserIds: memberIds,
      entityType: "project",
      entityName: project?.name || "Project",
      actionUrl: `/projects/${project?.slug}/files`,
    });
  }

  return NextResponse.json({ file: uploadedFile });
}
```

## Example 5: Project Member Addition

```typescript
// app/api/projects/[slug]/members/route.ts
import { notifyProjectMemberAdded } from "@/src/lib/notifications/service";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  const { userId: newMemberId } = await req.json();

  // Get project
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, params.slug));

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Add member
  await db.insert(projectMembers).values({
    projectId: project.id,
    userId: newMemberId,
    canEdit: true,
    addedAt: new Date(),
  });

  // Notify new member
  await notifyProjectMemberAdded({
    projectId: project.id,
    projectName: project.name,
    projectSlug: project.slug,
    newMemberId,
    addedBy: user.id,
  });

  return NextResponse.json({ success: true });
}
```

## Common Patterns

### 1. Always Get Workspace Context

```typescript
const [membership] = await db
  .select()
  .from(workspaceMembers)
  .where(eq(workspaceMembers.userId, user.id));

if (membership) {
  // Log activity with workspace context
}
```

### 2. Don't Notify the Actor

```typescript
// Don't send notification to the person who performed the action
if (assigneeId && assigneeId !== user.id) {
  await notifyTaskAssigned({ ... });
}
```

### 3. Batch Notifications for Multiple Users

```typescript
// Get all users to notify
const memberIds = [...];

// Send notification to each
await Promise.all(
  memberIds.map(id => notifyProjectStatusChanged({ userId: id, ... }))
);
```

### 4. Include Context in Notifications

```typescript
// Get related entities for better notification messages
const [project] = await db.select().from(projects).where(...);

await notifyTaskAssigned({
  ...
  projectName: project?.name || "Unknown Project",
});
```

### 5. Error Handling

```typescript
try {
  await notifyTaskAssigned({ ... });
} catch (error) {
  // Log error but don't fail the main operation
  console.error("Failed to send notification:", error);
}
```

## Testing Your Integration

1. **Test notification creation:**

   ```
   - Perform the action (e.g., create a task)
   - Go to /notifications
   - Verify the notification appears
   ```

2. **Test unread count:**

   ```
   - Check the bell icon in header
   - Should show unread count badge
   ```

3. **Test activity feed:**

   ```
   - Go to homepage (/)
   - Check "Recent Activity" card
   - Verify activity was logged
   ```

4. **Test preferences:**
   ```
   - Go to /settings/notifications
   - Disable email for task notifications
   - Perform task action
   - Verify no email is sent (but in-app notification still appears)
   ```

## Pro Tips

1. **Wrap in try-catch:** Notifications should never break your main flow
2. **Use transactions:** If you need atomic operations, use database transactions
3. **Batch operations:** For multiple notifications, use `Promise.all()`
4. **Add delays:** For development, add `await new Promise(r => setTimeout(r, 100))` between operations
5. **Test incrementally:** Add notifications to one feature at a time

---

Need help? Check the full implementation in `NOTIFICATIONS_SYSTEM_IMPLEMENTATION.md`
