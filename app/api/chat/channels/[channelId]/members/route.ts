import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { chatChannelMembers, chatChannels } from "@/src/db/schema/chat";
import { users } from "@/src/db/schema/users";
import { getCurrentUser } from "@/src/lib/auth/session";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { isTeamMember } from "@/src/lib/constants/roles";

/**
 * GET /api/chat/channels/[channelId]/members
 * Get all members of a channel
 * 
 * Access Control:
 * - Team members: Can view all channel members
 * - Clients: Can view members only if they're a member of the channel
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { channelId } = await params;

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

    const members = await db
      .select({
        id: chatChannelMembers.id,
        userId: chatChannelMembers.userId,
        joinedAt: chatChannelMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
        userImage: users.image,
        userRole: users.role,
      })
      .from(chatChannelMembers)
      .innerJoin(users, eq(chatChannelMembers.userId, users.id))
      .where(eq(chatChannelMembers.channelId, channelId));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching channel members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

/**
 * POST /api/chat/channels/[channelId]/members
 * Add a member to a channel
 * 
 * Access Control:
 * - Only team members can add members to channels
 * - Clients cannot add members
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { channelId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Only team members can add members to channels
    const userIsTeamMember = isTeamMember(user.role);
    if (!userIsTeamMember) {
      return NextResponse.json(
        { error: "Access denied: Only team members can add channel members" },
        { status: 403 }
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

    // Check if already a member
    const existing = await db
      .select()
      .from(chatChannelMembers)
      .where(
        and(
          eq(chatChannelMembers.channelId, channelId),
          eq(chatChannelMembers.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 });
    }

    // Add member
    const [member] = await db
      .insert(chatChannelMembers)
      .values({
        id: nanoid(),
        channelId,
        userId,
      })
      .returning();

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error adding channel member:", error);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}
