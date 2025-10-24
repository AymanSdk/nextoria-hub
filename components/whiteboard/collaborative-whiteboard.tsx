"use client";

import { useMemo } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useSelf } from "@/liveblocks.config";
import { UserPresence } from "./user-presence";
import { useStorageStore } from "./use-storage-store";
import { LiveCursors } from "./live-cursors";
import { DebugConsole } from "./debug-console";

export function CollaborativeWhiteboard() {
  const currentUser = useSelf();

  // Memoize user object to prevent infinite re-renders
  const user = useMemo(
    () => ({
      id: currentUser?.id || "anonymous",
      color: currentUser?.info?.color || "#000000",
      name: currentUser?.info?.name || "Anonymous",
    }),
    [currentUser?.id, currentUser?.info?.color, currentUser?.info?.name]
  );

  // Use official Liveblocks + tldraw storage integration
  const store = useStorageStore({ user });

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
        <UserPresence />
      </div>

      {/* Whiteboard Canvas */}
      <div className='flex-1 relative overflow-hidden'>
        <Tldraw
          store={store}
          autoFocus
          components={{
            CollaboratorScribble: null, // Disable tldraw's cursors
          }}
        />
        <LiveCursors />
        <DebugConsole />
      </div>
    </div>
  );
}
