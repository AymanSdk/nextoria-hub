"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRoom, useMutation, useStorage } from "@/liveblocks.config";
import { LiveObject } from "@liveblocks/client";
import type { Node, Edge } from "@xyflow/react";

export interface FlowchartStorage {
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
}

export function useFlowchartStorage() {
  const room = useRoom();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get flowchart data from Liveblocks storage
  const flowchartData = useStorage((root) => root.flowchartData);

  // Initialize storage if it doesn't exist
  useEffect(() => {
    if (!room || isInitialized) return;

    const initializeStorage = async () => {
      const { root } = await room.getStorage();

      if (!root.get("flowchartData")) {
        root.set(
          "flowchartData",
          new LiveObject<FlowchartStorage>({
            nodes: [],
            edges: [],
            viewport: { x: 0, y: 0, zoom: 1 },
          })
        );
      }

      setIsInitialized(true);
    };

    initializeStorage();
  }, [room, isInitialized]);

  // Mutation to update nodes
  const updateNodes = useMutation(({ storage }, nodes: Node[]) => {
    const flowchart = storage.get("flowchartData");
    if (flowchart) {
      flowchart.set("nodes", nodes);
    }
  }, []);

  // Mutation to update edges
  const updateEdges = useMutation(({ storage }, edges: Edge[]) => {
    const flowchart = storage.get("flowchartData");
    if (flowchart) {
      flowchart.set("edges", edges);
    }
  }, []);

  // Mutation to update viewport
  const updateViewport = useMutation(
    ({ storage }, viewport: { x: number; y: number; zoom: number }) => {
      const flowchart = storage.get("flowchartData");
      if (flowchart) {
        flowchart.set("viewport", viewport);
      }
    },
    []
  );

  // Mutation to update entire flowchart
  const updateFlowchart = useMutation(({ storage }, data: FlowchartStorage) => {
    const flowchart = storage.get("flowchartData");
    if (flowchart) {
      flowchart.update(data);
    }
  }, []);

  return {
    flowchartData,
    updateNodes,
    updateEdges,
    updateViewport,
    updateFlowchart,
    isInitialized,
  };
}
