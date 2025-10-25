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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
  Undo2,
  Redo2,
  Copy,
  Scissors,
  Clipboard,
  Image,
  FileJson,
  Network,
  Search,
  Keyboard,
  Database,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Bug,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface ComprehensiveToolbarProps {
  onAddNode: (type: string) => void;
  onDeleteSelected: () => void;
  onDownload: () => void;
  onUpload: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onExportImage: (format: "png" | "jpeg" | "svg") => void;
  onAutoLayout: (direction: "TB" | "LR" | "BT" | "RL") => void;
  onAlign: (type: string) => void;
  onToggleSearch: () => void;
  onToggleKeyboardShortcuts: () => void;
  onToggleDevTools: () => void;
  onToggleDataTable: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasCopied: boolean;
}

export function ComprehensiveToolbar({
  onAddNode,
  onDeleteSelected,
  onDownload,
  onUpload,
  onUndo,
  onRedo,
  onCopy,
  onCut,
  onPaste,
  onExportImage,
  onAutoLayout,
  onAlign,
  onToggleSearch,
  onToggleKeyboardShortcuts,
  onToggleDevTools,
  onToggleDataTable,
  canUndo,
  canRedo,
  hasCopied,
}: ComprehensiveToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const nodeTypes = [
    { type: "start", icon: Play, label: "Start", color: "text-emerald-600" },
    { type: "end", icon: Square, label: "End", color: "text-rose-600" },
    { type: "process", icon: Settings, label: "Process", color: "text-blue-600" },
    { type: "decision", icon: GitBranch, label: "Decision", color: "text-amber-600" },
    { type: "base", icon: Box, label: "Basic", color: "text-gray-600" },
    {
      type: "databaseSchema",
      icon: Database,
      label: "DB Schema",
      color: "text-purple-600",
    },
  ];

  return (
    <TooltipProvider>
      <div className='absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border border-border rounded-lg shadow-lg p-2'>
        <div className='flex items-center gap-1'>
          {/* Add Nodes Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-8 gap-2'>
                    <Box className='h-4 w-4' />
                    <span className='text-xs'>Add Node</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Add Node</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align='start'>
              <DropdownMenuLabel>Node Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {nodeTypes.map(({ type, icon: Icon, label, color }) => (
                <DropdownMenuItem key={type} onClick={() => onAddNode(type)}>
                  <Icon className={cn("mr-2 h-4 w-4", color)} />
                  {label} Node
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation='vertical' className='h-6' />

          {/* Undo/Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo2 className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo</p>
              <p className='text-xs text-muted-foreground'>Ctrl+Z</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo2 className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo</p>
              <p className='text-xs text-muted-foreground'>Ctrl+Y</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation='vertical' className='h-6' />

          {/* Copy/Cut/Paste */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={onCopy}>
                <Copy className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy</p>
              <p className='text-xs text-muted-foreground'>Ctrl+C</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={onCut}>
                <Scissors className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cut</p>
              <p className='text-xs text-muted-foreground'>Ctrl+X</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={onPaste}
                disabled={!hasCopied}
              >
                <Clipboard className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Paste</p>
              <p className='text-xs text-muted-foreground'>Ctrl+V</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation='vertical' className='h-6' />

          {/* Align Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <AlignCenterHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Align Nodes</TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuLabel>Horizontal</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onAlign("left")}>
                <AlignStartHorizontal className='mr-2 h-4 w-4' />
                Align Left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign("center")}>
                <AlignCenterHorizontal className='mr-2 h-4 w-4' />
                Align Center
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign("right")}>
                <AlignEndHorizontal className='mr-2 h-4 w-4' />
                Align Right
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Vertical</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onAlign("top")}>
                <AlignStartVertical className='mr-2 h-4 w-4' />
                Align Top
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign("middle")}>
                <AlignCenterVertical className='mr-2 h-4 w-4' />
                Align Middle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlign("bottom")}>
                <AlignEndVertical className='mr-2 h-4 w-4' />
                Align Bottom
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auto Layout Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <Network className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Auto Layout</TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuLabel>Layout Direction</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAutoLayout("TB")}>
                ↓ Top to Bottom
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAutoLayout("LR")}>
                → Left to Right
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAutoLayout("BT")}>
                ↑ Bottom to Top
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAutoLayout("RL")}>
                ← Right to Left
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation='vertical' className='h-6' />

          {/* Zoom Controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => zoomIn()}
              >
                <ZoomIn className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => zoomOut()}
              >
                <ZoomOut className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => fitView()}
              >
                <Maximize className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit View</TooltipContent>
          </Tooltip>

          <Separator orientation='vertical' className='h-6' />

          {/* Export Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <Image className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Export</TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuLabel>Export As</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExportImage("png")}>
                <Image className='mr-2 h-4 w-4' />
                PNG Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportImage("jpeg")}>
                <Image className='mr-2 h-4 w-4' />
                JPEG Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportImage("svg")}>
                <Image className='mr-2 h-4 w-4' />
                SVG Vector
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDownload}>
                <FileJson className='mr-2 h-4 w-4' />
                JSON Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={onUpload}>
                <Upload className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import JSON</TooltipContent>
          </Tooltip>

          <Separator orientation='vertical' className='h-6' />

          {/* Utility Tools */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={onToggleSearch}
              >
                <Search className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search Nodes</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={onToggleDataTable}
              >
                <Database className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Data Table</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={onToggleDevTools}
              >
                <Bug className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>DevTools</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={onToggleKeyboardShortcuts}
              >
                <Keyboard className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Keyboard Shortcuts</p>
              <p className='text-xs text-muted-foreground'>Press ?</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation='vertical' className='h-6' />

          {/* Delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-destructive hover:text-destructive'
                onClick={onDeleteSelected}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Selected</p>
              <p className='text-xs text-muted-foreground'>Del</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
