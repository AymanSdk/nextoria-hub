import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { notifications, users } from "@/src/db/schema";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

/**
 * GET /api/notifications
 * Get notifications for the current user with pagination and filters
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const filter = searchParams.get("filter"); // "unread", "read", or null for all
    const type = searchParams.get("type"); // specific notification type
    const search = searchParams.get("search"); // search in title/message

    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [eq(notifications.userId, user.id)];

    if (filter === "unread") {
      conditions.push(eq(notifications.isRead, false));
    } else if (filter === "read") {
      conditions.push(eq(notifications.isRead, true));
    }

    if (type) {
      conditions.push(eq(notifications.type, type as any));
    }

    if (search) {
      conditions.push(
        or(
          like(notifications.title, `%${search}%`),
          like(notifications.message, `%${search}%`)
        )!
      );
    }

    // Fetch notifications with sender info
    const userNotifications = await db
      .select({
        notification: notifications,
        sender: users,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.senderId, users.id))
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(...conditions));

    const totalCount = countResult[0]?.count || 0;

    return NextResponse.json({
      notifications: userNotifications.map((n) => ({
        ...n.notification,
        sender: n.sender
          ? {
              id: n.sender.id,
              name: n.sender.name,
              email: n.sender.email,
              avatarUrl: n.sender.image,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
