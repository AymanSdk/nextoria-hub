"use client";

import { useEffect, useRef, useState } from "react";
import { Tldraw, createTLStore, defaultShapeUtils, TLStoreWithStatus } from "tldraw";
import "tldraw/tldraw.css";
import { useSelf, useRoom } from "@/liveblocks.config";
import { UserPresence } from "./user-presence";
import { useOthers } from "@/liveblocks.config";
import { LiveblocksYjsProvider } from "@/components/whiteboard/liveblocks-yjs-provider";
import * as Y from "yjs";

export function CollaborativeWhiteboard() {
  const room = useRoom();
  const currentUser = useSelf();
  const others = useOthers();
  const [store, setStore] = useState<TLStoreWithStatus>({ status: "loading" });

  useEffect(() => {
    // Create Yjs document
    const yDoc = new Y.Doc();

    // Create tldraw store
    const tlStore = createTLStore({
      shapeUtils: defaultShapeUtils,
    });

    // Set up Liveblocks Yjs provider for real-time sync
    const provider = new LiveblocksYjsProvider(room, yDoc);

    // Sync tldraw store with Yjs
    provider.syncTldrawStore(tlStore);

    setStore({
      store: tlStore,
      status: "synced-remote",
      connectionStatus: "online",
    });

    return () => {
      provider.destroy();
      tlStore.dispose();
    };
  }, [room]);

  return (
    <div className='fixed inset-0 w-full h-full flex flex-col bg-white dark:bg-gray-900'>
      {/* Top Navigation Bar */}
      <div className='h-12 bg-background border-b flex items-center justify-between px-4 z-50 shrink-0'>
        <div className='flex items-center gap-4'>
          <a
            href='/whiteboard'
            className='text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='m15 18-6-6 6-6' />
            </svg>
            Exit Whiteboard
          </a>
          <div className='h-4 w-px bg-border' />
          <span className='text-sm font-medium'>Collaborative Whiteboard</span>
        </div>
        <UserPresence others={Array.from(others)} />
      </div>

      {/* Whiteboard Canvas */}
      <div className='flex-1 relative overflow-hidden'>
        <Tldraw
          store={store}
          autoFocus
          onMount={(editor) => {
            // Set user info
            if (currentUser?.info?.name) {
              editor.user.updateUserPreferences({
                name: currentUser.info.name,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
              });
            }
          }}
        />
      </div>
    </div>
  );
}
