"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Workflow,
  Save,
  Edit2,
  Copy,
  Users,
  Clock,
  Check,
  Loader2,
  Cloud,
  CloudOff,
  CloudAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useOthers } from "@/liveblocks.config";
import { Spinner } from "@/components/ui/spinner";
import { FlowchartRoomProvider } from "./flowchart-room-provider";
import {
  CollaborativeFlowchartCanvas,
  type FlowchartSaveState,
} from "./collaborative-flowchart-canvas";
import type { Node, Edge } from "@xyflow/react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export interface FlowchartPageClientRef {}

interface FlowchartPageClientProps {
  roomId: string;
  workspaceId: string;
  initialName: string;
  initialData?: {
    nodes: Node[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
  };
}

// Enhanced Header Component with Modern UI Patterns
function FlowchartHeader({
  saveState,
  roomId,
}: {
  saveState: FlowchartSaveState | null;
  roomId: string;
}) {
  const others = useOthers();
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState("");

  const handleCopyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard");
  };

  const handleRenameStart = () => {
    if (saveState) {
      setTempName(saveState.flowchartName);
      setIsRenaming(true);
    }
  };

  const handleRenameSubmit = () => {
    if (saveState && tempName.trim()) {
      saveState.setFlowchartName(tempName.trim());
      setIsRenaming(false);
      toast.success("Flowchart renamed");
    }
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setTempName("");
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className='flex items-center w-full gap-3'>
        {/* Left Section - Navigation */}
        <div className='flex items-center gap-3'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                asChild
                className='gap-2 hover:bg-accent transition-colors'
              >
                <Link href='/flowchart'>
                  <ChevronLeft className='h-4 w-4' />
                  <span className='hidden sm:inline'>Back</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom'>
              <p>Back to Dashboard</p>
            </TooltipContent>
          </Tooltip>

          <div className='hidden sm:block h-6 w-px bg-border/60' />

          {/* Flowchart Info */}
          <div className='flex items-center gap-2.5'>
            <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10'>
              <Workflow className='h-5 w-5 text-primary' />
            </div>

            <div className='flex flex-col gap-0.5 min-w-0'>
              {/* Flowchart Name - Editable */}
              {isRenaming ? (
                <div className='flex items-center gap-2'>
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit();
                      if (e.key === "Escape") handleRenameCancel();
                    }}
                    onBlur={handleRenameSubmit}
                    className='h-7 w-64 text-sm font-medium'
                    autoFocus
                    placeholder='Enter flowchart name'
                  />
                </div>
              ) : (
                <div className='flex items-center gap-1.5 group'>
                  <h1 className='text-sm font-semibold tracking-tight truncate max-w-[200px] md:max-w-[300px]'>
                    {saveState?.flowchartName || "Untitled Flowchart"}
                  </h1>

                  {/* Cloud Sync Indicator - Google Docs style */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='flex items-center'>
                        {saveState?.isSaving ? (
                          <div className='flex items-center gap-1 text-muted-foreground'>
                            <Spinner className='h-3.5 w-3.5' />
                            <span className='text-[10px] hidden sm:inline'>
                              Saving...
                            </span>
                          </div>
                        ) : saveState?.hasUnsavedChanges ? (
                          <div className='flex items-center gap-1 text-yellow-600 dark:text-yellow-500'>
                            <CloudAlert className='h-3.5 w-3.5' />
                            <span className='text-[10px] hidden sm:inline'>Unsaved</span>
                          </div>
                        ) : saveState?.lastSaved ? (
                          <div className='flex items-center gap-1 text-green-600 dark:text-green-500'>
                            <Cloud className='h-3.5 w-3.5' />
                            <span className='text-[10px] hidden sm:inline'>Saved</span>
                          </div>
                        ) : (
                          <div className='flex items-center gap-1 text-muted-foreground'>
                            <CloudOff className='h-3.5 w-3.5' />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {saveState?.isSaving ? (
                        <p>Saving to cloud...</p>
                      ) : saveState?.hasUnsavedChanges ? (
                        <p>Unsaved changes</p>
                      ) : saveState?.lastSaved ? (
                        <p>
                          All changes saved{" "}
                          {formatDistanceToNow(saveState.lastSaved, { addSuffix: true })}
                        </p>
                      ) : (
                        <p>Not saved to cloud</p>
                      )}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
                        onClick={handleRenameStart}
                      >
                        <Edit2 className='h-3 w-3' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rename flowchart</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Room ID - Clickable to copy */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopyRoomId}
                    className='text-xs text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 group w-fit'
                  >
                    <span className='font-mono'>Room: {roomId.slice(0, 8)}...</span>
                    <Copy className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity' />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to copy room ID</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Right Section - Status & Actions */}
        <div className='flex items-center gap-2 ml-auto'>
          {/* Collaboration Status */}
          {others.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant='outline'
                  className='hidden lg:flex gap-1.5 px-2.5 py-1 text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                >
                  <div className='h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse' />
                  <Users className='h-3 w-3' />
                  {others.length + 1}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {others.length + 1} user{others.length !== 0 ? "s" : ""} online
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          <div className='hidden md:block h-6 w-px bg-border/60' />

          {/* Save Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={saveState?.hasUnsavedChanges ? "default" : "outline"}
                size='sm'
                onClick={saveState?.onSave}
                disabled={saveState?.isSaving || !saveState?.hasUnsavedChanges}
                className={cn(
                  "gap-2 transition-all",
                  saveState?.hasUnsavedChanges && "shadow-sm"
                )}
              >
                {saveState?.isSaving ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Save className='h-4 w-4' />
                )}
                <span className='hidden sm:inline'>
                  {saveState?.isSaving ? "Saving..." : "Save"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save changes (Ctrl+S)</p>
            </TooltipContent>
          </Tooltip>

          {/* Keyboard Shortcut Hint */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded-md hover:bg-accent/50 transition-colors cursor-help'>
                <kbd className='px-1.5 py-0.5 text-[10px] font-semibold bg-muted border border-border rounded'>
                  Del
                </kbd>
                <span className='text-[11px]'>Remove</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Press Delete to remove selected nodes</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function FlowchartPageClient({
  roomId,
  workspaceId,
  initialName,
  initialData,
}: FlowchartPageClientProps) {
  const [saveState, setSaveState] = useState<FlowchartSaveState | null>(null);

  // Memoize the callback to prevent infinite loops
  const handleSaveStateChange = useCallback((state: FlowchartSaveState) => {
    setSaveState(state);
  }, []);

  return (
    <div className='fixed inset-0 overflow-hidden bg-background'>
      <FlowchartRoomProvider roomId={roomId} initialData={initialData}>
        {/* Enhanced Header - inside RoomProvider for useOthers() */}
        <header className='h-16 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 border-b flex items-center px-4 lg:px-6 z-50 shadow-sm'>
          <FlowchartHeader saveState={saveState} roomId={roomId} />
        </header>

        {/* Canvas with Real-time Collaboration */}
        <div className='h-[calc(100vh-4rem)] relative w-full'>
          <CollaborativeFlowchartCanvas
            roomId={roomId}
            workspaceId={workspaceId}
            initialName={initialName}
            initialTemplateData={initialData}
            onSaveStateChange={handleSaveStateChange}
          />
        </div>
      </FlowchartRoomProvider>
    </div>
  );
}
