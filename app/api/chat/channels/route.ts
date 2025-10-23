import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { chatChannels, chatChannelMembers, chatMessages } from "@/src/db/schema/chat";
import { getCurrentUser } from "@/src/lib/auth/session";
import { eq, and, gt, sql, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { isTeamMember } from "@/src/lib/constants/roles";

/**
 * GET /api/chat/channels
 * Get all chat channels for the current user's workspace
 *
 * Access Control:
 * - Team members (ADMIN, DEVELOPER, DESIGNER, MARKETER): See all channels
 * - Clients (CLIENT): See only channels they're members of
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    const userIsTeamMember = isTeamMember(user.role);

    // Get channels with unread counts
    const channelsQuery = userIsTeamMember
      ? db
          .select()
          .from(chatChannels)
          .where(
            and(
              eq(chatChannels.workspaceId, workspaceId),
              eq(chatChannels.isArchived, false)
            )
          )
      : db
          .select()
          .from(chatChannels)
          .innerJoin(
            chatChannelMembers,
            and(
              eq(chatChannels.id, chatChannelMembers.channelId),
              eq(chatChannelMembers.userId, user.id)
            )
          )
          .where(
            and(
              eq(chatChannels.workspaceId, workspaceId),
              eq(chatChannels.isArchived, false)
            )
          );

    const channelsData = await channelsQuery;

    // Get channel memberships for unread tracking
    const memberships = await db
      .select()
      .from(chatChannelMembers)
      .where(eq(chatChannelMembers.userId, user.id));

    const membershipMap = new Map(memberships.map((m) => [m.channelId, m]));

    // Calculate unread counts for each channel
    const channels = await Promise.all(
      channelsData.map(async (item) => {
        const channel = "chat_channels" in item ? item.chat_channels : item;
        const membership = membershipMap.get(channel.id);

        let unreadCount = 0;
        if (membership?.lastReadMessageId) {
          const [result] = await db
            .select({ count: count() })
            .from(chatMessages)
            .where(
              and(
                eq(chatMessages.channelId, channel.id),
                sql`${chatMessages.id} > ${membership.lastReadMessageId}`
              )
            );
          unreadCount = result?.count || 0;
        } else {
          // No last read message, count all messages
          const [result] = await db
            .select({ count: count() })
            .from(chatMessages)
            .where(eq(chatMessages.channelId, channel.id));
          unreadCount = result?.count || 0;
        }

        return {
          id: channel.id,
          name: channel.name,
          description: channel.description,
          isPrivate: channel.isPrivate,
          isArchived: channel.isArchived,
          projectId: channel.projectId,
          channelType: channel.channelType,
          createdAt: channel.createdAt,
          createdBy: channel.createdBy,
          unreadCount,
        };
      })
    );

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 });
  }
}

/**
 * POST /api/chat/channels
 * Create a new chat channel
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const { workspaceId, name, description, isPrivate, projectId } = body;

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "Workspace ID and name are required" },
        { status: 400 }
      );
    }

    // Create the channel
    const [channel] = await db
      .insert(chatChannels)
      .values({
        id: nanoid(),
        workspaceId,
        name,
        description,
        isPrivate: isPrivate || false,
        projectId: projectId || null,
        createdBy: user.id,
      })
      .returning();

    // Add the creator as a member
    await db.insert(chatChannelMembers).values({
      id: nanoid(),
      channelId: channel.id,
      userId: user.id,
    });

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("Error creating channel:", error);
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 });
  }
}
