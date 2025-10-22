"use client";

import { ReactNode } from "react";
import { RoomProvider as LiveblocksRoomProvider } from "@/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";

interface ChatRoomProviderProps {
  channelId: string;
  workspaceId: string;
  children: ReactNode;
}

export function ChatRoomProvider({
  channelId,
  workspaceId,
  children,
}: ChatRoomProviderProps) {
  // Room ID follows the pattern: workspace:{workspaceId}:channel:{channelId}
  const roomId = `workspace:${workspaceId}:channel:${channelId}`;

  return (
    <LiveblocksRoomProvider
      id={roomId}
      initialPresence={{
        isTyping: false,
        lastSeenAt: Date.now(),
      }}
    >
      <ClientSideSuspense
        fallback={
          <div className='flex items-center justify-center h-full'>
            <div className='animate-pulse text-neutral-500'>Loading chat...</div>
          </div>
        }
      >
        {children}
      </ClientSideSuspense>
    </LiveblocksRoomProvider>
  );
}
