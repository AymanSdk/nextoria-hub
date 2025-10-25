"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { FlowchartCanvas } from "./flowchart-canvas";
import { useFlowchartSave } from "./hooks/use-flowchart-save";
import { useFlowchartStorage } from "./hooks/use-flowchart-storage";
import type { Node, Edge } from "@xyflow/react";

export interface FlowchartSaveState {
  flowchartName: string;
  setFlowchartName: (name: string) => void;
  onSave: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

interface CollaborativeFlowchartCanvasProps {
  roomId: string;
  workspaceId: string;
  initialName?: string;
  initialTemplateData?: {
    nodes: Node[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
  };
  onSave?: (id: string) => void;
  onSaveStateChange?: (state: FlowchartSaveState) => void;
}

export function CollaborativeFlowchartCanvas({
  roomId,
  workspaceId,
  initialName,
  initialTemplateData,
  onSave,
  onSaveStateChange,
}: CollaborativeFlowchartCanvasProps) {
  const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [savedFlowchartId, setSavedFlowchartId] = useState<string | undefined>(undefined);

  // Use refs to avoid recreating callbacks
  const currentNodesRef = useRef<Node[]>([]);
  const currentEdgesRef = useRef<Edge[]>([]);

  useEffect(() => {
    currentNodesRef.current = currentNodes;
    currentEdgesRef.current = currentEdges;
  }, [currentNodes, currentEdges]);

  // Flowchart save hook
  const {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    flowchartName,
    flowchartId: currentFlowchartId,
    setFlowchartName,
    handleSave,
    queueAutoSave,
    loadFlowchart,
  } = useFlowchartSave({
    flowchartId: savedFlowchartId,
    roomId,
    workspaceId,
    initialName,
    onSave: (newId) => {
      setSavedFlowchartId(newId);
      if (onSave) onSave(newId);
    },
  });

  // Liveblocks storage hook
  const { flowchartData, updateNodes, updateEdges, isInitialized } =
    useFlowchartStorage();

  // Load initial data from template, Liveblocks storage, or database
  useEffect(() => {
    if (!isInitialized || !isInitialLoad) return;

    console.log("🔄 Loading initial data...", {
      hasTemplateData: !!initialTemplateData,
      templateNodesCount: initialTemplateData?.nodes?.length || 0,
      hasFlowchartData: !!flowchartData,
      liveblocksNodesCount: flowchartData?.nodes?.length || 0,
      roomId,
    });

    // Priority 1: If we have template data and Liveblocks is empty, use template
    if (
      initialTemplateData &&
      initialTemplateData.nodes.length > 0 &&
      (!flowchartData?.nodes || flowchartData.nodes.length === 0)
    ) {
      console.log("✅ Using template data", initialTemplateData.nodes.length, "nodes");
      setCurrentNodes(initialTemplateData.nodes);
      setCurrentEdges(initialTemplateData.edges || []);
      // Update Liveblocks storage with template data
      updateNodes(initialTemplateData.nodes);
      updateEdges(initialTemplateData.edges || []);
      setIsInitialLoad(false);
      return;
    }

    // Priority 2: If flowchartData exists in Liveblocks and has nodes, use it
    if (flowchartData && flowchartData.nodes && flowchartData.nodes.length > 0) {
      console.log("✅ Using data from Liveblocks", flowchartData.nodes.length, "nodes");
      setCurrentNodes(flowchartData.nodes);
      setCurrentEdges(flowchartData.edges || []);
      setIsInitialLoad(false);
      return;
    }

    // Priority 3: Try to load from database using roomId
    console.log("📥 Checking database for roomId...", roomId);
    loadFlowchart(roomId).then((data) => {
      if (data) {
        console.log("✅ Loaded from database", data.nodes?.length || 0, "nodes");
        setSavedFlowchartId(roomId); // This flowchart exists in DB
        setCurrentNodes(data.nodes || []);
        setCurrentEdges(data.edges || []);
        // Also update Liveblocks storage
        updateNodes(data.nodes || []);
        updateEdges(data.edges || []);
      } else {
        console.log("🆕 No saved flowchart found - starting fresh");
      }
      setIsInitialLoad(false);
    });
  }, [
    roomId,
    isInitialized,
    isInitialLoad,
    initialTemplateData,
    flowchartData,
    loadFlowchart,
    updateNodes,
    updateEdges,
  ]);

  // Sync local state with Liveblocks storage (other users' changes)
  useEffect(() => {
    if (!flowchartData || !isInitialized || isInitialLoad) return;

    const remoteNodes = flowchartData.nodes || [];
    const remoteEdges = flowchartData.edges || [];

    // Only update if different (avoid loops)
    const nodesChanged = JSON.stringify(remoteNodes) !== JSON.stringify(currentNodes);
    const edgesChanged = JSON.stringify(remoteEdges) !== JSON.stringify(currentEdges);

    if (nodesChanged && remoteNodes.length > 0) {
      setCurrentNodes(remoteNodes);
    }
    if (edgesChanged && remoteEdges.length > 0) {
      setCurrentEdges(remoteEdges);
    }
  }, [flowchartData, isInitialized, isInitialLoad]);

  // Handle state changes from FlowchartCanvas
  const handleStateChange = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      if (!isInitialized || isInitialLoad) return;

      // Check if actually changed to prevent unnecessary updates
      const nodesChanged =
        JSON.stringify(nodes) !== JSON.stringify(currentNodesRef.current);
      const edgesChanged =
        JSON.stringify(edges) !== JSON.stringify(currentEdgesRef.current);

      if (!nodesChanged && !edgesChanged) return;

      setCurrentNodes(nodes);
      setCurrentEdges(edges);

      // Update Liveblocks storage for real-time collaboration
      updateNodes(nodes);
      updateEdges(edges);

      // Queue auto-save to database
      queueAutoSave(nodes, edges);
    },
    [isInitialized, isInitialLoad, updateNodes, updateEdges, queueAutoSave]
  );

  // Manual save handler - stable reference using ref
  const handleManualSaveRef = useRef(() => {
    handleSave(currentNodes, currentEdges, flowchartName);
  });

  // Update ref on every render but keep the function reference stable
  useEffect(() => {
    handleManualSaveRef.current = () => {
      handleSave(currentNodes, currentEdges, flowchartName);
    };
  }, [currentNodes, currentEdges, flowchartName, handleSave]);

  // Create stable callback
  const handleManualSave = useCallback(() => {
    handleManualSaveRef.current();
  }, []);

  // Notify parent of save state changes - using ref to avoid recreating on every render
  const onSaveStateChangeRef = useRef(onSaveStateChange);
  useEffect(() => {
    onSaveStateChangeRef.current = onSaveStateChange;
  }, [onSaveStateChange]);

  useEffect(() => {
    if (onSaveStateChangeRef.current) {
      onSaveStateChangeRef.current({
        flowchartName,
        setFlowchartName,
        onSave: handleManualSave,
        isSaving,
        lastSaved,
        hasUnsavedChanges,
      });
    }
  }, [flowchartName, handleManualSave, isSaving, lastSaved, hasUnsavedChanges]);

  return (
    <>
      {/* Render the canvas with initial data and state change handler */}
      {!isInitialLoad && (
        <FlowchartCanvas
          key={roomId}
          initialNodes={currentNodes}
          initialEdges={currentEdges}
          onStateChange={handleStateChange}
        />
      )}
    </>
  );
}

// Export save state for use in header
export function useFlowchartSaveState() {
  // This would need to be implemented with context or other state management
  // For now, we'll pass props from the page
}
