"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useReactFlow, type Node } from "@xyflow/react";
import {
  X,
  ChevronRight,
  Box,
  Settings,
  GitBranch,
  Play,
  Square,
  Database,
  Trash2,
  Copy,
  Move,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
}

const nodeTypeConfig = {
  base: { icon: Box, label: "Base Node", color: "text-slate-600" },
  process: { icon: Settings, label: "Process", color: "text-blue-600" },
  decision: { icon: GitBranch, label: "Decision", color: "text-amber-600" },
  start: { icon: Play, label: "Start", color: "text-emerald-600" },
  end: { icon: Square, label: "End", color: "text-rose-600" },
  databaseSchema: { icon: Database, label: "Database", color: "text-purple-600" },
};

const variantConfig = {
  default: { color: "bg-slate-100 border-slate-200", label: "Default" },
  success: { color: "bg-emerald-100 border-emerald-200", label: "Success" },
  warning: { color: "bg-amber-100 border-amber-200", label: "Warning" },
  error: { color: "bg-red-100 border-red-200", label: "Error" },
  info: { color: "bg-blue-100 border-blue-200", label: "Info" },
};

const statusConfig = {
  idle: { color: "bg-slate-400", label: "Idle" },
  running: { color: "bg-blue-500 animate-pulse", label: "Running" },
  success: { color: "bg-emerald-500", label: "Success" },
  error: { color: "bg-red-500", label: "Error" },
};

export function PropertiesPanel({ selectedNode, onClose }: PropertiesPanelProps) {
  const { setNodes, deleteElements } = useReactFlow();
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idle");
  const [variant, setVariant] = useState("default");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      setLabel((selectedNode.data as any).label || "");
      setDescription((selectedNode.data as any).description || "");
      setStatus((selectedNode.data as any).status || "idle");
      setVariant((selectedNode.data as any).variant || "default");
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              className='absolute right-4 top-20 z-10 shadow-lg'
              onClick={() => setIsCollapsed(false)}
            >
              <ChevronRight className='h-4 w-4 rotate-180' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>
            <p>Expand Properties</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const handleUpdateNode = () => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                label,
                description,
                status,
                variant,
              },
            }
          : node
      )
    );
  };

  const handleDuplicateNode = () => {
    const newNode = {
      ...selectedNode,
      id: `${selectedNode.type}-${Date.now()}`,
      position: {
        x: selectedNode.position.x + 50,
        y: selectedNode.position.y + 50,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast.success("Node duplicated");
  };

  const handleDeleteNode = () => {
    deleteElements({ nodes: [{ id: selectedNode.id }] });
    onClose();
    toast.success("Node deleted");
  };

  const nodeType = selectedNode.type || "base";
  const nodeConfig = nodeTypeConfig[nodeType as keyof typeof nodeTypeConfig];
  const Icon = nodeConfig?.icon || Box;

  return (
    <TooltipProvider>
      <Card className='absolute right-4 top-20 z-10 w-[340px] shadow-xl border-border/50 backdrop-blur-sm'>
        <CardHeader className='pb-3 space-y-0'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-2 flex-1'>
              <div
                className={cn(
                  "w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center",
                  nodeConfig?.color
                )}
              >
                <Icon className='h-4 w-4' />
              </div>
              <div className='flex-1 min-w-0'>
                <CardTitle className='text-sm font-semibold'>Properties</CardTitle>
                <p className='text-xs text-muted-foreground truncate'>
                  {nodeConfig?.label || nodeType}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-1'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    onClick={() => setIsCollapsed(true)}
                  >
                    <ChevronRight className='h-3.5 w-3.5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Collapse</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    onClick={onClose}
                  >
                    <X className='h-3.5 w-3.5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-3 pb-4'>
          {/* Quick Actions */}
          <div className='flex gap-1.5'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 h-8 text-xs'
                  onClick={handleDuplicateNode}
                >
                  <Copy className='h-3 w-3 mr-1.5' />
                  Duplicate
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate this node</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 h-8 text-xs'
                  onClick={handleDeleteNode}
                >
                  <Trash2 className='h-3 w-3 mr-1.5' />
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete node (Del)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator />

          {/* Label */}
          <div className='space-y-1.5'>
            <Label htmlFor='label' className='text-xs font-medium'>
              Label
            </Label>
            <Input
              id='label'
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                handleUpdateNode();
              }}
              placeholder='Enter label...'
              className='h-8 text-sm'
            />
          </div>

          {/* Description for Base nodes */}
          {selectedNode.type === "base" && (
            <div className='space-y-1.5'>
              <Label htmlFor='description' className='text-xs font-medium'>
                Description
              </Label>
              <Textarea
                id='description'
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  handleUpdateNode();
                }}
                placeholder='Add description...'
                rows={2}
                className='text-sm resize-none'
              />
            </div>
          )}

          {/* Variant for Base nodes */}
          {selectedNode.type === "base" && (
            <div className='space-y-1.5'>
              <Label htmlFor='variant' className='text-xs font-medium'>
                Variant
              </Label>
              <div className='grid grid-cols-5 gap-1.5'>
                {Object.entries(variantConfig).map(([key, config]) => (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setVariant(key);
                          setNodes((nds) =>
                            nds.map((node) =>
                              node.id === selectedNode.id
                                ? { ...node, data: { ...node.data, variant: key } }
                                : node
                            )
                          );
                        }}
                        className={cn(
                          "h-8 rounded-md border-2 transition-all",
                          config.color,
                          variant === key
                            ? "ring-2 ring-blue-500 ring-offset-1"
                            : "hover:scale-105"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{config.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {/* Status for Process nodes */}
          {selectedNode.type === "process" && (
            <div className='space-y-1.5'>
              <Label htmlFor='status' className='text-xs font-medium'>
                Status
              </Label>
              <div className='grid grid-cols-4 gap-1.5'>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setStatus(key);
                          setNodes((nds) =>
                            nds.map((node) =>
                              node.id === selectedNode.id
                                ? { ...node, data: { ...node.data, status: key } }
                                : node
                            )
                          );
                        }}
                        className={cn(
                          "h-8 rounded-md border-2 border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center",
                          status === key
                            ? "ring-2 ring-blue-500 ring-offset-1"
                            : "hover:scale-105"
                        )}
                      >
                        <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{config.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Info */}
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='info' className='border-none'>
              <AccordionTrigger className='py-2 text-xs font-medium hover:no-underline'>
                <div className='flex items-center gap-1.5'>
                  <Info className='h-3 w-3' />
                  Advanced Info
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-2 pt-2'>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground'>Node ID</p>
                    <Badge
                      variant='outline'
                      className='font-mono text-[10px] truncate w-full justify-start'
                    >
                      {selectedNode.id.slice(0, 12)}...
                    </Badge>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-muted-foreground'>Type</p>
                    <Badge variant='secondary' className='text-[10px] capitalize'>
                      {nodeType}
                    </Badge>
                  </div>
                </div>
                <div className='space-y-1'>
                  <p className='text-muted-foreground text-xs'>Position</p>
                  <div className='flex items-center gap-2 text-xs'>
                    <Badge variant='outline' className='font-mono text-[10px]'>
                      X: {Math.round(selectedNode.position.x)}
                    </Badge>
                    <Badge variant='outline' className='font-mono text-[10px]'>
                      Y: {Math.round(selectedNode.position.y)}
                    </Badge>
                  </div>
                </div>
                {selectedNode.width && selectedNode.height && (
                  <div className='space-y-1'>
                    <p className='text-muted-foreground text-xs'>Size</p>
                    <div className='flex items-center gap-2 text-xs'>
                      <Badge variant='outline' className='font-mono text-[10px]'>
                        W: {Math.round(selectedNode.width)}
                      </Badge>
                      <Badge variant='outline' className='font-mono text-[10px]'>
                        H: {Math.round(selectedNode.height)}
                      </Badge>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Keyboard Shortcuts Hint */}
          <div className='pt-2 border-t'>
            <p className='text-[10px] text-muted-foreground text-center'>
              Press{" "}
              <kbd className='px-1 py-0.5 bg-muted rounded text-[9px] font-mono'>Del</kbd>{" "}
              to delete •{" "}
              <kbd className='px-1 py-0.5 bg-muted rounded text-[9px] font-mono'>
                Ctrl+C
              </kbd>{" "}
              to copy
            </p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
