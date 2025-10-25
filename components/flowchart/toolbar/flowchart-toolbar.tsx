"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Square,
  Settings,
  GitBranch,
  Box,
  Trash2,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";

interface FlowchartToolbarProps {
  onAddNode: (type: string) => void;
  onDeleteSelected: () => void;
  onDownload: () => void;
  onUpload: () => void;
}

export function FlowchartToolbar({
  onAddNode,
  onDeleteSelected,
  onDownload,
  onUpload,
}: FlowchartToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const nodeTypes = [
    { type: "start", icon: Play, label: "Start", color: "text-emerald-600" },
    { type: "end", icon: Square, label: "End", color: "text-rose-600" },
    { type: "process", icon: Settings, label: "Process", color: "text-blue-600" },
    { type: "decision", icon: GitBranch, label: "Decision", color: "text-amber-600" },
    { type: "base", icon: Box, label: "Basic", color: "text-gray-600" },
  ];

  return (
    <TooltipProvider>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background border border-border rounded-lg shadow-lg p-2">
        <div className="flex items-center gap-1">
          {/* Add Node Buttons */}
          <div className="flex items-center gap-1 px-1">
            <span className="text-xs text-muted-foreground font-medium mr-2">
              Add Node:
            </span>
            {nodeTypes.map(({ type, icon: Icon, label, color }) => (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onAddNode(type)}
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add {label} Node</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => zoomIn()}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => zoomOut()}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => fitView()}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fit View</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onDeleteSelected}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Selected</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download Flow</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onUpload}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import Flow</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

