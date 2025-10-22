import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { chatChannels, chatChannelMembers } from "@/src/db/schema/chat";
import { getCurrentUser } from "@/src/lib/auth/session";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * GET /api/chat/channels
 * Get all chat channels for the current user's workspace
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    // Get all channels in the workspace where the user is a member
    const channels = await db
      .select({
        id: chatChannels.id,
        name: chatChannels.name,
        description: chatChannels.description,
        isPrivate: chatChannels.isPrivate,
        isArchived: chatChannels.isArchived,
        projectId: chatChannels.projectId,
        createdAt: chatChannels.createdAt,
        createdBy: chatChannels.createdBy,
      })
      .from(chatChannels)
      .leftJoin(chatChannelMembers, eq(chatChannels.id, chatChannelMembers.channelId))
      .where(
        and(eq(chatChannels.workspaceId, workspaceId), eq(chatChannels.isArchived, false))
      );

    // Filter channels where user is a member or channel is not private
    const accessibleChannels = channels.filter(
      (channel) => !channel.isPrivate || user.id === channel.createdBy
    );

    return NextResponse.json(accessibleChannels);
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
