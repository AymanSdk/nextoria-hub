import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { chatChannelMembers } from "@/src/db/schema/chat";
import { users } from "@/src/db/schema/users";
import { getCurrentUser } from "@/src/lib/auth/session";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * GET /api/chat/channels/[channelId]/members
 * Get all members of a channel
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    await getCurrentUser();
    const { channelId } = params;

    const members = await db
      .select({
        id: chatChannelMembers.id,
        userId: chatChannelMembers.userId,
        joinedAt: chatChannelMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
        userImage: users.image,
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
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    await getCurrentUser();
    const { channelId } = params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Check if already a member
    const existing = await db
      .select()
      .from(chatChannelMembers)
      .where(
        eq(chatChannelMembers.channelId, channelId) &&
          eq(chatChannelMembers.userId, userId)
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
