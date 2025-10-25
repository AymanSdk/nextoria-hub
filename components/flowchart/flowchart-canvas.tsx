"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
  ReactFlowProvider,
  type NodeMouseHandler,
  SelectionMode,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BaseNode } from "./nodes/base-node";
import { ProcessNode } from "./nodes/process-node";
import { DecisionNode } from "./nodes/decision-node";
import { StartEndNode } from "./nodes/start-end-node";
import { DatabaseSchemaNode } from "./nodes/database-schema-node";
import { CustomEdge } from "./edges/custom-edge";
import { ComprehensiveToolbar } from "./toolbar/comprehensive-toolbar";
import { ZoomSlider } from "./controls/zoom-slider";
import { NodePalette } from "./controls/node-palette";
import { PropertiesPanel } from "./properties-panel";
import { FlowchartContextMenu } from "./context-menu";
import { InteractionMode } from "./controls/interaction-mode";
import { SelectionModeIndicator } from "./controls/selection-mode-indicator";
import { SelectionGuide } from "./controls/selection-guide";
import { NodeSearch } from "./controls/node-search";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { DevTools } from "./devtools/devtools";
import { FlowchartDataTable } from "./data-table/flowchart-data-table";
import { SelectionInfo } from "./selection-info";
import { useUndoRedo } from "./hooks/use-undo-redo";
import { useCopyPaste } from "./hooks/use-copy-paste";
import { getLayoutedElements } from "./auto-layout";
import { exportToImage } from "./export-image";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { FileCode } from "lucide-react";

// Start with a blank canvas
const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

function FlowchartCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [interactionMode, setInteractionMode] = useState<"select" | "pan">("select");
  const [showSearch, setShowSearch] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showDataTable, setShowDataTable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { undo, redo, takeSnapshot, canUndo, canRedo } = useUndoRedo();
  const { copy, cut, paste, duplicate, hasCopied } = useCopyPaste();

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      base: BaseNode,
      process: ProcessNode,
      decision: DecisionNode,
      startEnd: StartEndNode,
      databaseSchema: DatabaseSchemaNode,
    }),
    []
  );

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

  // Take snapshot before changes for undo/redo
  const handleNodesChangeWithHistory = useCallback(
    (changes: any) => {
      takeSnapshot(nodes, edges);
      onNodesChange(changes);
    },
    [nodes, edges, onNodesChange, takeSnapshot]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshot(nodes, edges);
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "custom",
            data: { showDeleteButton: true, onDelete: handleDeleteEdge },
          },
          eds
        )
      );
    },
    [setEdges, nodes, edges, takeSnapshot]
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      takeSnapshot(nodes, edges);
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      toast.success("Edge deleted");
    },
    [setEdges, nodes, edges, takeSnapshot]
  );

  const handleAddNode = useCallback(
    (type: string) => {
      takeSnapshot(nodes, edges);
      const newNode: Node = {
        id: nanoid(),
        type: type === "start" || type === "end" ? "startEnd" : type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data:
          type === "start"
            ? { label: "Start", type: "start" }
            : type === "end"
            ? { label: "End", type: "end" }
            : type === "process"
            ? { label: "New Process", status: "idle" }
            : type === "decision"
            ? { label: "Decision?" }
            : type === "databaseSchema"
            ? {
                label: "Table",
                schema: [
                  { title: "id", type: "uuid" },
                  { title: "name", type: "varchar" },
                  { title: "created_at", type: "timestamp" },
                ],
              }
            : {
                label: "New Node",
                description: "Add description",
                icon: <FileCode className='w-4 h-4' />,
                variant: "default" as const,
              },
      };

      setNodes((nds) => [...nds, newNode]);
      toast.success(`${type} node added`);
    },
    [setNodes, nodes, edges, takeSnapshot]
  );

  const handleDeleteSelected = useCallback(() => {
    takeSnapshot(nodes, edges);
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
    toast.success("Selected items deleted");
  }, [setNodes, setEdges, nodes, edges, takeSnapshot]);

  const handleUndo = useCallback(() => {
    const previous = undo(nodes, edges);
    if (previous) {
      setNodes(previous.nodes);
      setEdges(previous.edges);
      toast.success("Undo");
    }
  }, [undo, nodes, edges, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const next = redo(nodes, edges);
    if (next) {
      setNodes(next.nodes);
      setEdges(next.edges);
      toast.success("Redo");
    }
  }, [redo, nodes, edges, setNodes, setEdges]);

  const handleCopy = useCallback(() => {
    const success = copy();
    if (success) toast.success("Copied to clipboard");
  }, [copy]);

  const handleCut = useCallback(() => {
    const result = cut();
    if (result) {
      takeSnapshot(nodes, edges);
      setNodes(result.nodes);
      setEdges(result.edges);
      toast.success("Cut to clipboard");
    }
  }, [cut, setNodes, setEdges, nodes, edges, takeSnapshot]);

  const handlePaste = useCallback(() => {
    const result = paste();
    if (result) {
      takeSnapshot(nodes, edges);
      setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        ...result.nodes,
      ]);
      setEdges((eds) => [...eds, ...result.edges]);
      toast.success("Pasted");
    }
  }, [paste, setNodes, setEdges, nodes, edges, takeSnapshot]);

  const handleDuplicate = useCallback(() => {
    const result = duplicate();
    if (result) {
      takeSnapshot(nodes, edges);
      setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        ...result.nodes,
      ]);
      setEdges((eds) => [...eds, ...result.edges]);
      toast.success("Duplicated");
    }
  }, [duplicate, setNodes, setEdges, nodes, edges, takeSnapshot]);

  const handleAlign = useCallback(
    (type: string) => {
      takeSnapshot(nodes, edges);
      const selectedNodes = nodes.filter((n) => n.selected);
      if (selectedNodes.length < 2) {
        toast.error("Select at least 2 nodes to align");
        return;
      }

      const updated = nodes.map((node) => {
        if (!node.selected) return node;

        switch (type) {
          case "left":
            return {
              ...node,
              position: {
                ...node.position,
                x: Math.min(...selectedNodes.map((n) => n.position.x)),
              },
            };
          case "center":
            const avgX =
              selectedNodes.reduce((sum, n) => sum + n.position.x, 0) /
              selectedNodes.length;
            return { ...node, position: { ...node.position, x: avgX } };
          case "right":
            return {
              ...node,
              position: {
                ...node.position,
                x: Math.max(...selectedNodes.map((n) => n.position.x)),
              },
            };
          case "top":
            return {
              ...node,
              position: {
                ...node.position,
                y: Math.min(...selectedNodes.map((n) => n.position.y)),
              },
            };
          case "middle":
            const avgY =
              selectedNodes.reduce((sum, n) => sum + n.position.y, 0) /
              selectedNodes.length;
            return { ...node, position: { ...node.position, y: avgY } };
          case "bottom":
            return {
              ...node,
              position: {
                ...node.position,
                y: Math.max(...selectedNodes.map((n) => n.position.y)),
              },
            };
          default:
            return node;
        }
      });

      setNodes(updated);
      toast.success(`Aligned ${type}`);
    },
    [nodes, setNodes, edges, takeSnapshot]
  );

  const handleAutoLayout = useCallback(
    (direction: "TB" | "LR" | "BT" | "RL") => {
      takeSnapshot(nodes, edges);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      toast.success(`Auto layout applied: ${direction}`);
    },
    [nodes, edges, setNodes, setEdges, takeSnapshot]
  );

  const handleDownload = useCallback(() => {
    const flow = {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    const dataStr = JSON.stringify(flow, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `flowchart-${Date.now()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Flow downloaded");
  }, [nodes, edges]);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target?.result as string);
          if (flow.nodes && flow.edges) {
            takeSnapshot(nodes, edges);
            setNodes(flow.nodes);
            setEdges(flow.edges);
            toast.success("Flow imported successfully");
          } else {
            toast.error("Invalid flow file");
          }
        } catch (error) {
          toast.error("Failed to import flow");
        }
      };
      reader.readAsText(file);

      event.target.value = "";
    },
    [setNodes, setEdges, nodes, edges, takeSnapshot]
  );

  const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleExportImage = useCallback((format: "png" | "jpeg" | "svg") => {
    exportToImage(format);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts
      if (
        (e.ctrlKey || e.metaKey) &&
        ["z", "y", "c", "x", "v", "d", "a", "s"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
      ) {
        handleRedo();
      }
      // Copy/Cut/Paste
      else if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "x") {
        handleCut();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        handlePaste();
      }
      // Duplicate
      else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        handleDuplicate();
      }
      // Select All
      else if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
      }
      // Help
      else if (e.key === "?") {
        setShowKeyboardShortcuts(true);
      }
      // Interaction modes
      else if (e.key === "v") {
        setInteractionMode("select");
      } else if (e.key === "h") {
        setInteractionMode("pan");
      }
      // Add nodes
      else if (e.key === "1") {
        handleAddNode("start");
      } else if (e.key === "2") {
        handleAddNode("process");
      } else if (e.key === "3") {
        handleAddNode("decision");
      } else if (e.key === "4") {
        handleAddNode("end");
      } else if (e.key === "5") {
        handleAddNode("base");
      } else if (e.key === "6") {
        handleAddNode("databaseSchema");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleCopy,
    handleCut,
    handlePaste,
    handleDuplicate,
    handleAddNode,
    setNodes,
  ]);

  const hasSelection = nodes.some((n) => n.selected) || edges.some((e) => e.selected);

  return (
    <div className='w-full h-full relative'>
      <FlowchartContextMenu
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
        onDelete={handleDeleteSelected}
        onDuplicate={handleDuplicate}
        onLock={() => toast.info("Lock feature coming soon")}
        onEdit={() => {
          const selected = nodes.find((n) => n.selected);
          if (selected) setSelectedNode(selected);
        }}
        onBringToFront={() => toast.info("Arrange feature coming soon")}
        onSendToBack={() => toast.info("Arrange feature coming soon")}
        onAlign={handleAlign}
        hasSelection={hasSelection}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChangeWithHistory}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          defaultEdgeOptions={{
            animated: false,
            style: { strokeWidth: 2 },
          }}
          deleteKeyCode={["Backspace", "Delete"]}
          multiSelectionKeyCode='Control'
          selectionMode={SelectionMode.Partial}
          panOnDrag={interactionMode === "pan"}
          nodesDraggable={interactionMode === "select"}
          nodesConnectable={interactionMode === "select"}
          elementsSelectable={interactionMode === "select"}
          className='bg-background'
          snapToGrid
          snapGrid={[15, 15]}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            className='bg-muted/30'
          />
          <Controls
            className='bg-background border-2 border-border rounded-xl shadow-2xl [&_button]:bg-background [&_button]:border-2 [&_button]:border-border [&_button]:text-foreground [&_button]:hover:bg-primary [&_button]:hover:text-primary-foreground [&_button]:hover:border-primary [&_button]:transition-all [&_button]:shadow-md [&_button_svg]:w-5 [&_button_svg]:h-5 [&_button_svg]:stroke-[2.5]'
            showInteractive={false}
          />
          <MiniMap
            className='bg-background border border-border rounded-lg shadow-lg'
            nodeStrokeWidth={3}
            zoomable
            pannable
          />

          <ComprehensiveToolbar
            onAddNode={handleAddNode}
            onDeleteSelected={handleDeleteSelected}
            onDownload={handleDownload}
            onUpload={handleUpload}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onCopy={handleCopy}
            onCut={handleCut}
            onPaste={handlePaste}
            onExportImage={handleExportImage}
            onAutoLayout={handleAutoLayout}
            onAlign={handleAlign}
            onToggleSearch={() => setShowSearch(!showSearch)}
            onToggleKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
            onToggleDevTools={() => setShowDevTools(!showDevTools)}
            onToggleDataTable={() => setShowDataTable(!showDataTable)}
            canUndo={canUndo}
            canRedo={canRedo}
            hasCopied={hasCopied}
          />

          <InteractionMode mode={interactionMode} onChange={setInteractionMode} />

          <SelectionModeIndicator mode={interactionMode} />

          <SelectionGuide />

          <NodePalette onAddNode={handleAddNode} />

          <ZoomSlider />

          <SelectionInfo />

          {selectedNode && (
            <PropertiesPanel
              selectedNode={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          )}

          {showSearch && <NodeSearch onClose={() => setShowSearch(false)} />}

          {showDevTools && <DevTools position='bottom-right' />}

          {showDataTable && (
            <FlowchartDataTable onClose={() => setShowDataTable(false)} />
          )}
        </ReactFlow>
      </FlowchartContextMenu>

      <KeyboardShortcuts
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />

      <input
        ref={fileInputRef}
        type='file'
        accept='.json'
        className='hidden'
        onChange={handleFileChange}
      />
    </div>
  );
}

export function FlowchartCanvas() {
  return (
    <ReactFlowProvider>
      <FlowchartCanvasInner />
    </ReactFlowProvider>
  );
}
