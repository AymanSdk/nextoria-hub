"use client";

import { useCallback, useState } from "react";
import { type Node, type Edge } from "@xyflow/react";

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export function useUndoRedo() {
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    setPast((prev) => [...prev, { nodes, edges }]);
    setFuture([]);
  }, []);

  const undo = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (past.length === 0) return null;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      setPast(newPast);
      setFuture((prev) => [...prev, { nodes: currentNodes, edges: currentEdges }]);

      return previous;
    },
    [past]
  );

  const redo = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (future.length === 0) return null;

      const next = future[future.length - 1];
      const newFuture = future.slice(0, future.length - 1);

      setFuture(newFuture);
      setPast((prev) => [...prev, { nodes: currentNodes, edges: currentEdges }]);

      return next;
    },
    [future]
  );

  const clear = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    undo,
    redo,
    takeSnapshot,
    clear,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}

