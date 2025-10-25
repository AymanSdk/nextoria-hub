"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Node, Edge } from "@xyflow/react";
import { toast } from "sonner";

interface UseFlowchartSaveOptions {
  flowchartId?: string;
  workspaceId: string;
  initialName?: string;
  autoSaveInterval?: number; // milliseconds
  onSave?: (id: string) => void;
}

export function useFlowchartSave({
  flowchartId,
  workspaceId,
  initialName = "Untitled Flowchart",
  autoSaveInterval = 10000, // 10 seconds
  onSave,
}: UseFlowchartSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [flowchartName, setFlowchartName] = useState(initialName);
  const [currentFlowchartId, setCurrentFlowchartId] = useState(flowchartId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);

  // Save flowchart to database
  const saveFlowchart = useCallback(
    async (nodes: Node[], edges: Edge[], name?: string, isAutoSave = false) => {
      setIsSaving(true);

      try {
        const flowchartData = {
          nodes,
          edges,
          viewport: { x: 0, y: 0, zoom: 1 },
        };

        // Update existing or create new
        if (currentFlowchartId) {
          const response = await fetch(`/api/flowcharts/${currentFlowchartId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name || flowchartName,
              data: flowchartData,
            }),
          });

          if (!response.ok) throw new Error("Failed to save flowchart");

          const updated = await response.json();
          setLastSaved(new Date(updated.updatedAt));
          setHasUnsavedChanges(false);

          // Only show toast for manual saves
          if (!isAutoSave) {
            toast.success("Flowchart saved!");
          }
        } else {
          const response = await fetch("/api/flowcharts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name || flowchartName,
              data: flowchartData,
              workspaceId,
            }),
          });

          if (!response.ok) throw new Error("Failed to create flowchart");

          const created = await response.json();
          setCurrentFlowchartId(created.id);
          setLastSaved(new Date(created.createdAt));
          setHasUnsavedChanges(false);

          // Only show toast for manual saves
          if (!isAutoSave) {
            toast.success("Flowchart created!");
          }

          if (onSave) {
            onSave(created.id);
          }
        }
      } catch (error) {
        console.error("Error saving flowchart:", error);
        // Always show error toasts
        toast.error("Failed to save flowchart");
      } finally {
        setIsSaving(false);
      }
    },
    [currentFlowchartId, flowchartName, workspaceId, onSave]
  );

  // Manual save
  const handleSave = useCallback(
    (nodes: Node[], edges: Edge[], name?: string) => {
      return saveFlowchart(nodes, edges, name, false);
    },
    [saveFlowchart]
  );

  // Queue changes for auto-save
  const queueAutoSave = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      pendingChangesRef.current = { nodes, edges };
      setHasUnsavedChanges(true);

      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer
      autoSaveTimerRef.current = setTimeout(() => {
        if (pendingChangesRef.current) {
          saveFlowchart(
            pendingChangesRef.current.nodes,
            pendingChangesRef.current.edges,
            undefined,
            true
          );
          pendingChangesRef.current = null;
        }
      }, autoSaveInterval);
    },
    [autoSaveInterval, saveFlowchart]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Load flowchart from database
  const loadFlowchart = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/flowcharts/${id}`);

      // If flowchart doesn't exist (404), it's a new flowchart - return null silently
      if (response.status === 404) {
        console.log("Flowchart not found in database - creating new");
        return null;
      }

      if (!response.ok) throw new Error("Failed to load flowchart");

      const flowchart = await response.json();
      setCurrentFlowchartId(flowchart.id);
      setFlowchartName(flowchart.name);
      setLastSaved(new Date(flowchart.updatedAt));

      return flowchart.data;
    } catch (error) {
      console.error("Error loading flowchart:", error);
      toast.error("Failed to load flowchart");
      return null;
    }
  }, []);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    flowchartName,
    flowchartId: currentFlowchartId,
    setFlowchartName,
    handleSave,
    queueAutoSave,
    loadFlowchart,
  };
}
