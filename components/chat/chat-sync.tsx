"use client";

import { useEffect, useCallback, useRef } from "react";
import { useBroadcastEvent, useEventListener } from "@/liveblocks.config";
import { ChatMessage } from "@/types/chat";

interface ChatSyncProps {
  channelId: string;
  onNewMessage: (message: ChatMessage) => void;
  onBroadcastReady: (broadcast: (message: ChatMessage) => void) => void;
}

/**
 * ChatSync Component
 * Handles real-time message synchronization using Liveblocks events
 * Must be used inside a RoomProvider
 */
export function ChatSync({ channelId, onNewMessage, onBroadcastReady }: ChatSyncProps) {
  const broadcast = useBroadcastEvent();
  const isInitialized = useRef(false);

  // Broadcast function to send new messages
  const broadcastMessage = useCallback(
    (message: ChatMessage) => {
      // Safety check: ensure message is valid
      if (!message || !message.id) {
        console.warn("Invalid message, skipping broadcast:", message);
        return;
      }

      // Ensure date is serializable (convert to ISO string)
      const serializableMessage = {
        ...message,
        channelId,
        createdAt: message.createdAt
          ? message.createdAt instanceof Date
            ? message.createdAt.toISOString()
            : message.createdAt
          : new Date().toISOString(),
      };

      broadcast({
        type: "MESSAGE_SENT",
        data: serializableMessage,
      });
    },
    [broadcast, channelId]
  );

  // Expose broadcast function to parent once
  useEffect(() => {
    if (!isInitialized.current) {
      onBroadcastReady(broadcastMessage);
      isInitialized.current = true;
    }
  }, [broadcastMessage, onBroadcastReady]);

  // Listen for new messages from other users
  useEventListener(({ event }) => {
    if (event.type === "MESSAGE_SENT") {
      const data = event.data as unknown as ChatMessage & { channelId: string };

      // Only add messages for the current channel
      if (data && data.channelId === channelId) {
        const message: ChatMessage = {
          id: data.id,
          channelId: data.channelId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderEmail: data.senderEmail,
          senderImage: data.senderImage,
          senderRole: data.senderRole,
          content: data.content,
          createdAt: data.createdAt,
          attachments: data.attachments || [],
        };
        onNewMessage(message);
      }
    }
  });

  return null; // This is a hook-only component
}
