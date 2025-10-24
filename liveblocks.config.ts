import { createClient, LiveList, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

declare global {
  interface Liveblocks {
    // User info displayed in comments, mentions, etc.
    UserMeta: {
      id: string;
      info: {
        name: string;
        email: string;
        avatar?: string;
        role: string;
        color?: string;
      };
    };

    // Custom storage type for the room
    Storage: {
      messages?: LiveList<LiveObject<ChatMessage>>;
      // Whiteboard storage (tldraw)
      [key: string]: any;
    };

    // Presence type for user status in the room
    Presence: {
      isTyping?: boolean;
      lastSeenAt?: number;
      // Whiteboard presence (tldraw)
      presence?: any;
      [key: string]: any;
    };

    // Room events for custom real-time events
    RoomEvent: {
      type: "MESSAGE_SENT" | "USER_JOINED" | "USER_LEFT" | "yjs-update";
      update?: number[];
    };

    // Thread metadata for comments
    ThreadMetadata: {
      resolved: boolean;
      messageId?: string;
    };
  }
}

// Chat message type for Liveblocks storage
export type ChatMessage = {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: number;
  parentMessageId?: string;
  attachments?: string[];
  isEdited?: boolean;
  isDeleted?: boolean;
};

// Create Liveblocks client
const client = createClient({
  authEndpoint: "/api/liveblocks/auth",
  throttle: 100, // Throttle updates to 100ms
});

// Export the room context hooks
export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    useThreads,
    useUser,
    useCreateThread,
    useEditThreadMetadata,
    useCreateComment,
    useEditComment,
    useDeleteComment,
    useAddReaction,
    useRemoveReaction,
  },
} = createRoomContext<
  Liveblocks["Presence"],
  Liveblocks["Storage"],
  Liveblocks["UserMeta"],
  Liveblocks["RoomEvent"],
  Liveblocks["ThreadMetadata"]
>(client);

export { client };
