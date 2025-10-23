import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { chatChannelMembers, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/src/lib/auth/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { channelId } = await params;

    // Get all members of this channel
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
      })
      .from(chatChannelMembers)
      .innerJoin(users, eq(chatChannelMembers.userId, users.id))
      .where(eq(chatChannelMembers.channelId, channelId));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching channel members:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel members" },
      { status: 500 }
    );
  }
}
