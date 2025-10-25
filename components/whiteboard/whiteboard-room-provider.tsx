"use client";

import { ReactNode, useRef } from "react";
import { RoomProvider as LiveblocksRoomProvider } from "@/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";
import { LiveMap } from "@liveblocks/client";
import { TLRecord } from "tldraw";

interface WhiteboardRoomProviderProps {
  roomId: string;
  children: ReactNode;
  savedData?: Record<string, TLRecord>;
}

export function WhiteboardRoomProvider({
  roomId,
  children,
  savedData,
}: WhiteboardRoomProviderProps) {
  const initialStorage = useRef(() => {
    const tldrawRecords = new LiveMap();

    // If we have saved data, pre-populate the LiveMap
    if (savedData) {
      const entries = Object.entries(savedData);
      entries.forEach(([key, value]) => {
        tldrawRecords.set(key, value);
      });
    }

    return {
      tldrawRecords,
    };
  }).current();

  return (
    <LiveblocksRoomProvider
      id={`whiteboard:${roomId}`}
      initialPresence={{
        presence: null,
      }}
      initialStorage={initialStorage}
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
