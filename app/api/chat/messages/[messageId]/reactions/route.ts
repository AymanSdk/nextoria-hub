import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { messageReactions } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/src/lib/auth/session";
import { nanoid } from "nanoid";

/**
 * POST /api/chat/messages/[messageId]/reactions
 * Add or toggle a reaction to a message
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { messageId } = await params;
    const body = await request.json();
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
    }

    // Check if user already reacted with this emoji
    const [existing] = await db
      .select()
      .from(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, user.id),
          eq(messageReactions.emoji, emoji)
        )
      )
      .limit(1);

    if (existing) {
      // Remove reaction (toggle off)
      await db.delete(messageReactions).where(eq(messageReactions.id, existing.id));

      return NextResponse.json({ action: "removed", emoji });
    } else {
      // Add reaction
      const [reaction] = await db
        .insert(messageReactions)
        .values({
          id: nanoid(),
          messageId,
          userId: user.id,
          emoji,
        })
        .returning();

      return NextResponse.json({ action: "added", reaction });
    }
  } catch (error) {
    console.error("Error handling reaction:", error);
    return NextResponse.json({ error: "Failed to handle reaction" }, { status: 500 });
  }
}

/**
 * GET /api/chat/messages/[messageId]/reactions
 * Get all reactions for a message
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;

    const reactions = await db
      .select()
      .from(messageReactions)
      .where(eq(messageReactions.messageId, messageId));

    // Group by emoji
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push({
        id: reaction.userId,
      });
      return acc;
    }, {} as Record<string, { emoji: string; count: number; users: Array<{ id: string }> }>);

    return NextResponse.json(Object.values(grouped));
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 });
  }
}
