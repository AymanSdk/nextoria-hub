"use client";

import { ReactNode } from "react";
import { RoomProvider as LiveblocksRoomProvider } from "@/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";
import { LiveMap } from "@liveblocks/client";

interface WhiteboardRoomProviderProps {
  roomId: string;
  children: ReactNode;
}

export function WhiteboardRoomProvider({
  roomId,
  children,
}: WhiteboardRoomProviderProps) {
  return (
    <LiveblocksRoomProvider
      id={`whiteboard:${roomId}`}
      initialPresence={{
        presence: null,
      }}
      initialStorage={{
        tldrawRecords: new LiveMap(),
      }}
    >
      <ClientSideSuspense
        fallback={
          <div className='flex items-center justify-center h-screen bg-background'>
            <div className='flex flex-col items-center gap-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
              <p className='text-muted-foreground'>Loading whiteboard...</p>
            </div>
          </div>
        }
      >
        {children}
      </ClientSideSuspense>
    </LiveblocksRoomProvider>
  );
}
