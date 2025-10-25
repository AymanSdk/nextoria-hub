"use client";

import { ReactNode, useMemo } from "react";
import { RoomProvider as LiveblocksRoomProvider } from "@/liveblocks.config";
import { LiveObject } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import type { Node, Edge } from "@xyflow/react";

interface FlowchartRoomProviderProps {
  roomId: string;
  children: ReactNode;
  initialData?: {
    nodes: Node[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
  };
}

export function FlowchartRoomProvider({
  roomId,
  children,
  initialData,
}: FlowchartRoomProviderProps) {
  console.log("🏠 FlowchartRoomProvider - initialData:", {
    hasData: !!initialData,
    nodesCount: initialData?.nodes?.length || 0,
    edgesCount: initialData?.edges?.length || 0,
  });

  const initialStorage = useMemo(() => {
    return {
      flowchartData: new LiveObject({
        nodes: initialData?.nodes || [],
        edges: initialData?.edges || [],
        viewport: initialData?.viewport || { x: 0, y: 0, zoom: 1 },
      }),
    };
  }, []); // Empty deps - we only want this to run once on mount

  return (
    <LiveblocksRoomProvider
      id={`flowchart:${roomId}`}
      initialPresence={{
        cursor: null,
        selectedNodeIds: [],
      }}
      initialStorage={initialStorage}
    >
      <ClientSideSuspense
        fallback={
          <div className='flex items-center justify-center h-screen bg-background'>
            <div className='flex flex-col items-center gap-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
              <p className='text-muted-foreground'>Loading flowchart...</p>
            </div>
          </div>
        }
      >
        {children}
      </ClientSideSuspense>
    </LiveblocksRoomProvider>
  );
}
