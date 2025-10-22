import { NextRequest, NextResponse } from "next/server";
import { WebhookHandler } from "@liveblocks/node";
import { db } from "@/src/db";
import { chatMessages } from "@/src/db/schema/chat";
import { nanoid } from "nanoid";

const webhookHandler = new WebhookHandler(process.env.LIVEBLOCKS_WEBHOOK_SECRET!);

/**
 * POST /api/liveblocks/webhook
 * Handle Liveblocks webhooks to persist messages to Postgres
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("liveblocks-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify the webhook signature
    const event = webhookHandler.verifyRequest({
      headers: request.headers,
      rawBody: body,
    });

    // Handle different event types
    switch (event.type) {
      case "storageUpdated": {
        // When storage is updated (new message added)
        const { roomId, updates } = event.data;

        // Extract channel ID from room ID (format: workspace:{id}:channel:{id})
        const channelId = roomId.split(":")[3];

        if (!channelId) {
          console.error("Invalid room ID format:", roomId);
          break;
        }

        // Process updates to save messages to database
        // Note: This is simplified - in production you'd want to batch these
        for (const update of updates || []) {
          if (update.type === "LiveList" && update.node.liveblocksType === "LiveList") {
            // New message added to the list
            // You would extract the message data and save it here
            // This requires more complex logic to track what's new vs. existing
          }
        }

        break;
      }

      case "userEntered": {
        // User joined the room
        console.log("User entered room:", event.data);
        break;
      }

      case "userLeft": {
        // User left the room
        console.log("User left room:", event.data);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/**
 * Alternative approach: Save messages via API endpoint
 * This is more reliable than webhooks for message persistence
 */
export async function saveMessageToDatabase(
  channelId: string,
  senderId: string,
  content: string,
  parentMessageId?: string
) {
  try {
    const [message] = await db
      .insert(chatMessages)
      .values({
        id: nanoid(),
        channelId,
        senderId,
        content,
        parentMessageId: parentMessageId || null,
        isEdited: false,
        isDeleted: false,
      })
      .returning();

    return message;
  } catch (error) {
    console.error("Error saving message to database:", error);
    throw error;
  }
}
