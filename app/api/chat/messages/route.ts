import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { chatMessages } from "@/src/db/schema/chat";
import { users } from "@/src/db/schema/users";
import { getCurrentUser } from "@/src/lib/auth/session";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * GET /api/chat/messages?channelId={channelId}
 * Get all messages for a channel
 */
export async function GET(request: NextRequest) {
  try {
    await getCurrentUser();
    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get("channelId");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID required" }, { status: 400 });
    }

    // Fetch messages with sender info
    const messages = await db
      .select({
        id: chatMessages.id,
        channelId: chatMessages.channelId,
        senderId: chatMessages.senderId,
        content: chatMessages.content,
        parentMessageId: chatMessages.parentMessageId,
        attachments: chatMessages.attachments,
        isEdited: chatMessages.isEdited,
        isDeleted: chatMessages.isDeleted,
        createdAt: chatMessages.createdAt,
        updatedAt: chatMessages.updatedAt,
        senderName: users.name,
        senderEmail: users.email,
        senderImage: users.image,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .where(
        and(eq(chatMessages.channelId, channelId), eq(chatMessages.isDeleted, false))
      )
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    // Reverse to show oldest first
    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

/**
 * POST /api/chat/messages
 * Save a new message to the database
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const { channelId, content, parentMessageId } = body;

    if (!channelId || !content) {
      return NextResponse.json(
        { error: "Channel ID and content are required" },
        { status: 400 }
      );
    }

    // Save message to database
    const [message] = await db
      .insert(chatMessages)
      .values({
        id: nanoid(),
        channelId,
        senderId: user.id,
        content,
        parentMessageId: parentMessageId || null,
        isEdited: false,
        isDeleted: false,
      })
      .returning();

    // Return message with sender info
    const [messageWithSender] = await db
      .select({
        id: chatMessages.id,
        channelId: chatMessages.channelId,
        senderId: chatMessages.senderId,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        senderName: users.name,
        senderEmail: users.email,
        senderImage: users.image,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.id, message.id))
      .limit(1);

    return NextResponse.json(messageWithSender, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}
