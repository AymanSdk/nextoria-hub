"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Check, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useOthers } from "@/liveblocks.config";

interface FlowchartSaveToolbarProps {
  flowchartName: string;
  setFlowchartName: (name: string) => void;
  onSave: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export function FlowchartSaveToolbar({
  flowchartName,
  setFlowchartName,
  onSave,
  isSaving,
  lastSaved,
  hasUnsavedChanges,
}: FlowchartSaveToolbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const others = useOthers();
  const activeUsers = others.length;

  return (
    <div className='flex items-center gap-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border rounded-lg shadow-sm px-4 py-2'>
      {/* Flowchart Name */}
      {isEditing ? (
        <Input
          value={flowchartName}
          onChange={(e) => setFlowchartName(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
              onSave();
            }
            if (e.key === "Escape") {
              setIsEditing(false);
            }
          }}
          className='w-64'
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className='text-sm font-medium hover:text-primary transition-colors'
        >
          {flowchartName}
        </button>
      )}

      <div className='h-6 w-px bg-border' />

      {/* Save Status */}
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        {isSaving ? (
          <>
            <Clock className='h-3 w-3 animate-spin' />
            <span>Saving...</span>
          </>
        ) : hasUnsavedChanges ? (
          <>
            <div className='h-2 w-2 rounded-full bg-amber-500' />
            <span>Unsaved changes</span>
          </>
        ) : lastSaved ? (
          <>
            <Check className='h-3 w-3 text-emerald-500' />
            <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
          </>
        ) : null}
      </div>

      {/* Active Users */}
      {activeUsers > 0 && (
        <>
          <div className='h-6 w-px bg-border' />
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
            <Users className='h-3 w-3' />
            <span>{activeUsers + 1} active</span>
          </div>
        </>
      )}

      {/* Save Button */}
      <Button
        onClick={onSave}
        disabled={isSaving || !hasUnsavedChanges}
        size='sm'
        variant='default'
        className='gap-1.5'
      >
        <Save className='h-3.5 w-3.5' />
        Save
      </Button>
    </div>
  );
}
