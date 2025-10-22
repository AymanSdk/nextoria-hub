import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { chatMessages, chatChannels, chatChannelMembers } from "@/src/db/schema/chat";
import { users } from "@/src/db/schema/users";
import { getCurrentUser } from "@/src/lib/auth/session";
import { eq, desc, and, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { isTeamMember } from "@/src/lib/constants/roles";

/**
 * GET /api/chat/messages?channelId={channelId}
 * Get all messages for a channel
 * 
 * Access Control:
 * - Team members: Can access all channel messages
 * - Clients: Can only access messages from channels they're members of
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get("channelId");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID required" }, { status: 400 });
    }

    // Verify user has access to the channel
    const [channel] = await db
      .select()
      .from(chatChannels)
      .where(eq(chatChannels.id, channelId))
      .limit(1);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const userIsTeamMember = isTeamMember(user.role);

    // If user is a client, check if they're a member of the channel
    if (!userIsTeamMember) {
      const [membership] = await db
        .select()
        .from(chatChannelMembers)
        .where(
          and(
            eq(chatChannelMembers.channelId, channelId),
            eq(chatChannelMembers.userId, user.id)
          )
        )
        .limit(1);

      if (!membership) {
        return NextResponse.json(
          { error: "Access denied: You are not a member of this channel" },
          { status: 403 }
        );
      }
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
 * 
 * Access Control:
 * - Team members: Can send messages to all channels
 * - Clients: Can only send messages to channels they're members of
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

    // Verify channel exists
    const [channel] = await db
      .select()
      .from(chatChannels)
      .where(eq(chatChannels.id, channelId))
      .limit(1);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const userIsTeamMember = isTeamMember(user.role);

    // If user is a client, verify they're a member of the channel
    if (!userIsTeamMember) {
      const [membership] = await db
        .select()
        .from(chatChannelMembers)
        .where(
          and(
            eq(chatChannelMembers.channelId, channelId),
            eq(chatChannelMembers.userId, user.id)
          )
        )
        .limit(1);

      if (!membership) {
        return NextResponse.json(
          { error: "Access denied: You are not a member of this channel" },
          { status: 403 }
        );
      }
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
