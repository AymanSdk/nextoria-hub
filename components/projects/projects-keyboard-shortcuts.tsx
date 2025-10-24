"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

type KeyboardShortcutsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Navigation */}
          <div>
            <h3 className='font-semibold mb-3'>Navigation</h3>
            <div className='space-y-2'>
              <ShortcutRow keys={["G", "then", "P"]} description='Go to Projects' />
              <ShortcutRow keys={["G", "then", "A"]} description='Go to Analytics tab' />
              <ShortcutRow keys={["N"]} description='New Project' />
              <ShortcutRow keys={["/"]} description='Focus search' />
            </div>
          </div>

          {/* View Controls */}
          <div>
            <h3 className='font-semibold mb-3'>View Controls</h3>
            <div className='space-y-2'>
              <ShortcutRow keys={["V"]} description='Toggle Grid/List view' />
              <ShortcutRow keys={["Esc"]} description='Clear search and filters' />
            </div>
          </div>

          {/* Filters */}
          <div>
            <h3 className='font-semibold mb-3'>Quick Filters</h3>
            <div className='space-y-2'>
              <ShortcutRow keys={["F", "then", "A"]} description='Filter by Active' />
              <ShortcutRow keys={["F", "then", "C"]} description='Filter by Completed' />
              <ShortcutRow keys={["F", "then", "H"]} description='Filter by On Hold' />
              <ShortcutRow keys={["F", "then", "X"]} description='Clear all filters' />
            </div>
          </div>

          {/* General */}
          <div>
            <h3 className='font-semibold mb-3'>General</h3>
            <div className='space-y-2'>
              <ShortcutRow keys={["?"]} description='Show this help dialog' />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className='flex items-center justify-between py-2 px-3 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900'>
      <span className='text-sm text-neutral-600 dark:text-neutral-400'>
        {description}
      </span>
      <div className='flex items-center gap-1'>
        {keys.map((key, index) => (
          <span key={index} className='flex items-center gap-1'>
            {key === "then" ? (
              <span className='text-xs text-neutral-400 px-1'>then</span>
            ) : (
              <Kbd>{key}</Kbd>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

// Hook for keyboard shortcuts
export function useProjectsKeyboardShortcuts(callbacks: {
  onNewProject?: () => void;
  onToggleView?: () => void;
  onClearFilters?: () => void;
  onFocusSearch?: () => void;
  onFilterActive?: () => void;
  onFilterCompleted?: () => void;
  onFilterOnHold?: () => void;
  onShowHelp?: () => void;
  onGoToProjects?: () => void;
  onGoToAnalytics?: () => void;
}) {
  useEffect(() => {
    let multiKeyBuffer = "";
    let multiKeyTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        // Exception: allow "/" to focus search even from inputs
        if (
          e.key === "/" &&
          !(e.target instanceof HTMLInputElement && e.target.type === "search")
        ) {
          return;
        }
      }

      // Handle multi-key shortcuts (e.g., "G then P")
      if (multiKeyBuffer) {
        const combo = `${multiKeyBuffer}${e.key.toUpperCase()}`;
        multiKeyBuffer = "";
        clearTimeout(multiKeyTimeout);

        switch (combo) {
          case "GP":
            e.preventDefault();
            callbacks.onGoToProjects?.();
            break;
          case "GA":
            e.preventDefault();
            callbacks.onGoToAnalytics?.();
            break;
          case "FA":
            e.preventDefault();
            callbacks.onFilterActive?.();
            break;
          case "FC":
            e.preventDefault();
            callbacks.onFilterCompleted?.();
            break;
          case "FH":
            e.preventDefault();
            callbacks.onFilterOnHold?.();
            break;
          case "FX":
            e.preventDefault();
            callbacks.onClearFilters?.();
            break;
        }
        return;
      }

      // Single key shortcuts
      switch (e.key.toLowerCase()) {
        case "?":
          if (e.shiftKey) {
            e.preventDefault();
            callbacks.onShowHelp?.();
          }
          break;
        case "/":
          e.preventDefault();
          callbacks.onFocusSearch?.();
          break;
        case "n":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            callbacks.onNewProject?.();
          }
          break;
        case "v":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            callbacks.onToggleView?.();
          }
          break;
        case "escape":
          e.preventDefault();
          callbacks.onClearFilters?.();
          break;
        case "g":
        case "f":
          // Start multi-key sequence
          multiKeyBuffer = e.key.toUpperCase();
          multiKeyTimeout = setTimeout(() => {
            multiKeyBuffer = "";
          }, 1000); // Clear buffer after 1 second
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(multiKeyTimeout);
    };
  }, [callbacks]);
}
