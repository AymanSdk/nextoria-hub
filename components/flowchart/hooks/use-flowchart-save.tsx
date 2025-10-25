"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Node, Edge } from "@xyflow/react";
import { toast } from "sonner";

interface UseFlowchartSaveOptions {
  flowchartId?: string;
  roomId: string; // The roomId from URL - used as ID when creating new flowcharts
  workspaceId: string;
  initialName?: string;
  autoSaveInterval?: number; // milliseconds
  onSave?: (id: string) => void;
}

export function useFlowchartSave({
  flowchartId,
  roomId,
  workspaceId,
  initialName,
  autoSaveInterval = 10000, // 10 seconds
  onSave,
}: UseFlowchartSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  // Don't set a default name yet - let it be loaded from DB or set when creating new flowchart
  const [flowchartName, setFlowchartName] = useState(initialName || "");
  const [currentFlowchartId, setCurrentFlowchartId] = useState(flowchartId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNameLoaded, setIsNameLoaded] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);

  // Sync currentFlowchartId with flowchartId prop when it changes
  useEffect(() => {
    if (flowchartId && flowchartId !== currentFlowchartId) {
      console.log("🔄 Syncing flowchart ID:", flowchartId);
      setCurrentFlowchartId(flowchartId);
    }
  }, [flowchartId, currentFlowchartId]);

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

        // Use roomId as the definitive ID - if a flowchart with roomId exists, update it
        // Otherwise create new with roomId as the ID
        const flowchartIdToUse = currentFlowchartId || roomId;

        // Try to update first (works if flowchart exists)
        const nameToSave = name || flowchartName || "Untitled Flowchart";

        let response = await fetch(`/api/flowcharts/${flowchartIdToUse}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameToSave,
            data: flowchartData,
          }),
        });

        // If update fails with 404, create new flowchart with roomId
        if (response.status === 404) {
          response = await fetch("/api/flowcharts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: roomId, // Use roomId as the database ID
              name: nameToSave,
              data: flowchartData,
              workspaceId,
            }),
          });
        }

        // Handle response (from either PUT or POST)
        if (!response.ok) {
          let errorMessage = "Failed to save flowchart";
          try {
            const errorData = await response.json();
            console.error("Failed to save flowchart:", {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If JSON parsing fails, try to get text
            const text = await response.text().catch(() => "");
            console.error("Failed to save flowchart:", {
              status: response.status,
              statusText: response.statusText,
              responseText: text,
            });
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        setCurrentFlowchartId(result.id);
        setFlowchartName(result.name); // Update name from server response
        setLastSaved(new Date(result.updatedAt || result.createdAt));
        setHasUnsavedChanges(false);
        setIsNameLoaded(true);

        // Only show toast for manual saves
        if (!isAutoSave) {
          toast.success("Flowchart saved!");
        }

        if (onSave && !currentFlowchartId) {
          // Only call onSave for new flowcharts
          onSave(result.id);
        }
      } catch (error) {
        console.error("Error saving flowchart:", error);
        // Always show error toasts
        toast.error("Failed to save flowchart");
      } finally {
        setIsSaving(false);
      }
    },
    [currentFlowchartId, roomId, flowchartName, workspaceId, onSave]
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
  const loadFlowchart = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/flowcharts/${id}`);

        // If flowchart doesn't exist (404), it's a new flowchart - return null silently
        if (response.status === 404) {
          console.log("Flowchart not found in database - creating new");
          // Set default name for new flowchart if name hasn't been set
          if (!isNameLoaded && !flowchartName) {
            setFlowchartName(`Untitled Flowchart`);
          }
          setIsNameLoaded(true);
          return null;
        }

        if (!response.ok) throw new Error("Failed to load flowchart");

        const flowchart = await response.json();
        setCurrentFlowchartId(flowchart.id);
        setFlowchartName(flowchart.name); // Load the actual name from database
        setLastSaved(new Date(flowchart.updatedAt));
        setIsNameLoaded(true);

        return flowchart.data;
      } catch (error) {
        console.error("Error loading flowchart:", error);
        toast.error("Failed to load flowchart");
        return null;
      }
    },
    [isNameLoaded, flowchartName]
  );

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
