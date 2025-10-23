import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { chatChannelMembers, chatMessages } from "@/src/db/schema";
import { eq, and, gt, count } from "drizzle-orm";
import { getCurrentUser } from "@/src/lib/auth/session";

/**
 * POST /api/chat/channels/[channelId]/read
 * Mark messages as read up to a specific message
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { channelId } = await params;
    const body = await request.json();
    const { lastReadMessageId } = body;

    if (!lastReadMessageId) {
      return NextResponse.json(
        { error: "lastReadMessageId is required" },
        { status: 400 }
      );
    }

    // Update or create channel membership with last read message
    const [existing] = await db
      .select()
      .from(chatChannelMembers)
      .where(
        and(
          eq(chatChannelMembers.channelId, channelId),
          eq(chatChannelMembers.userId, user.id)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(chatChannelMembers)
        .set({ lastReadMessageId })
        .where(eq(chatChannelMembers.id, existing.id));
    } else {
      await db.insert(chatChannelMembers).values({
        channelId,
        userId: user.id,
        lastReadMessageId,
      });
    }

    // Get updated unread count
    const [unreadCount] = await db
      .select({ count: count() })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.channelId, channelId),
          gt(chatMessages.createdAt, new Date(lastReadMessageId))
        )
      );

    return NextResponse.json({
      success: true,
      unreadCount: unreadCount?.count || 0,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
