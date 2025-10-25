"use client";

import { useMemo } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useSelf, useRoom } from "@/liveblocks.config";
import { UserPresence } from "./user-presence";
import { useStorageStore } from "./use-storage-store";
import { LiveCursors } from "./live-cursors";
import { DebugConsole } from "./debug-console";
import { Button } from "@/components/ui/button";
import { Copy, Check, Save, FilePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CollaborativeWhiteboardProps {
  whiteboardId?: string;
  whiteboardName?: string;
  whiteboardDescription?: string;
}

export function CollaborativeWhiteboard({
  whiteboardId,
  whiteboardName,
  whiteboardDescription,
}: CollaborativeWhiteboardProps = {}) {
  const currentUser = useSelf();
  const room = useRoom();
  const [copied, setCopied] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [saveAsName, setSaveAsName] = useState("");
  const [saveAsDescription, setSaveAsDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Extract room ID from Liveblocks room ID (format: whiteboard:roomId)
  const roomId = room.id.replace("whiteboard:", "");

  // Copy room ID to clipboard
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success("Room ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy room ID");
    }
  };

  // Quick save - update existing whiteboard
  const handleQuickSave = async () => {
    if (!whiteboardId) {
      // If no whiteboard ID, open Save As dialog
      setShowSaveAsDialog(true);
      return;
    }

    setSaving(true);
    try {
      // Get the current whiteboard data from Liveblocks
      const { root } = await room.getStorage();
      const tldrawRecords = root.get("tldrawRecords");

      if (!tldrawRecords) {
        throw new Error("No tldraw records found in storage");
      }

      // Convert LiveMap to plain object
      const data: any = {};
      tldrawRecords.forEach((value, key) => {
        data[key] = value;
      });

      const shapes = Object.keys(data).filter((k) => k.startsWith("shape:"));

      const response = await fetch(`/api/whiteboards/${whiteboardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          name: whiteboardName,
          description: whiteboardDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ SAVE FAILED:", errorData);
        throw new Error(errorData.error || "Failed to save");
      }

      const result = await response.json();

      toast.success(`Whiteboard saved! (${shapes.length} shapes)`);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save whiteboard");
    } finally {
      setSaving(false);
    }
  };

  // Save As - create new whiteboard
  const handleSaveAs = async () => {
    if (!saveAsName.trim()) {
      toast.error("Please enter a name for the whiteboard");
      return;
    }

    setSaving(true);
    try {
      // Get the current whiteboard data from Liveblocks
      const { root } = await room.getStorage();
      const tldrawRecords = root.get("tldrawRecords");

      // Convert LiveMap to plain object
      const data: any = {};
      tldrawRecords?.forEach((value, key) => {
        data[key] = value;
      });

      console.log("Saving whiteboard as new:", {
        name: saveAsName,
        recordCount: Object.keys(data).length,
      });

      const response = await fetch("/api/whiteboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveAsName,
          description: saveAsDescription,
          data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save");
      }

      const newWhiteboard = await response.json();
      toast.success("Whiteboard saved successfully!");
      setShowSaveAsDialog(false);
      setSaveAsName("");
      setSaveAsDescription("");

      // Optionally redirect to the new whiteboard
      // window.location.href = `/whiteboard/${newWhiteboard.id}`;
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save whiteboard");
    } finally {
      setSaving(false);
    }
  };

  // Memoize user object to prevent infinite re-renders
  const user = useMemo(
    () => ({
      id: currentUser?.id || "anonymous",
      color: currentUser?.info?.color || "#000000",
      name: currentUser?.info?.name || "Anonymous",
    }),
    [currentUser?.id, currentUser?.info?.color, currentUser?.info?.name]
  );

  // Use Liveblocks + tldraw storage integration
  const storeWithStatus = useStorageStore({ user });

  return (
    <div className='fixed inset-0 w-full h-full flex flex-col bg-white dark:bg-gray-900'>
      {/* Top Navigation Bar */}
      <div className='h-12 bg-background border-b flex items-center justify-between px-4 z-50 shrink-0'>
        <div className='flex items-center gap-4'>
          <a
            href='/whiteboard'
            className='text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='m15 18-6-6 6-6' />
            </svg>
            Exit Whiteboard
          </a>
          <div className='h-4 w-px bg-border' />
          <span className='text-sm font-medium'>
            {whiteboardName || "Collaborative Whiteboard"}
          </span>
          {whiteboardId && <span className='text-xs text-muted-foreground'>(Saved)</span>}
        </div>

        <div className='flex items-center gap-3'>
          {/* Quick Save Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={handleQuickSave}
            disabled={saving}
            className='text-xs gap-2'
          >
            <Save className='h-3 w-3' />
            {saving ? "Saving..." : "Save"}
          </Button>
          {/* Save As Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowSaveAsDialog(true)}
            className='text-xs gap-2'
          >
            <FilePlus className='h-3 w-3' />
            Save As
          </Button>
          {/* Copy Room ID Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={copyRoomId}
            className='text-xs gap-2'
          >
            {copied ? (
              <>
                <Check className='h-3 w-3' />
                Copied!
              </>
            ) : (
              <>
                <Copy className='h-3 w-3' />
                Copy Room ID
              </>
            )}
          </Button>
          <div className='h-4 w-px bg-border' />
          <UserPresence />
        </div>
      </div>

      {/* Save As Dialog */}
      <Dialog open={showSaveAsDialog} onOpenChange={setShowSaveAsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Whiteboard As</DialogTitle>
            <DialogDescription>Save this whiteboard with a new name</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name *</Label>
              <Input
                id='name'
                placeholder='e.g., Project Brainstorm'
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>Description (optional)</Label>
              <Textarea
                id='description'
                placeholder='What is this whiteboard about?'
                value={saveAsDescription}
                onChange={(e) => setSaveAsDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowSaveAsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAs} disabled={saving}>
              {saving ? "Saving..." : "Save As New"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Whiteboard Canvas */}
      <div className='flex-1 relative overflow-hidden'>
        <Tldraw
          store={storeWithStatus}
          autoFocus
          components={{
            CollaboratorScribble: null,
          }}
        />
        <LiveCursors />
        <DebugConsole />
      </div>
    </div>
  );
}
