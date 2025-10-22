import { Liveblocks } from "@liveblocks/node";
import { getSession } from "@/src/lib/auth/session";
import { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Get the current user from NextAuth session
    const session = await getSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = session.user;

    // Get the room from the request (optional)
    const { room } = await request.json().catch(() => ({ room: undefined }));

    // Prepare user info for Liveblocks
    const userInfo = {
      name: user.name || user.email || "Anonymous",
      email: user.email || "",
      avatar: user.image || undefined,
      role: user.role || "USER",
    };

    // Create a session for the current user
    // Optionally restrict access to specific rooms based on workspace
    const session_data = await liveblocks.prepareSession(user.id, {
      userInfo,
    });

    // If a specific room is requested, we can add room-specific permissions
    if (room) {
      // Room naming convention: workspace:{workspaceId}:channel:{channelId}
      // This allows us to control access at the workspace level

      // For now, we'll allow access if the user is authenticated
      // You can add more granular checks here based on channel membership
      session_data.allow(room, session_data.FULL_ACCESS);
    }

    // Authorize the user and return the result
    const { status, body } = await session_data.authorize();

    return new Response(body, { status });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
