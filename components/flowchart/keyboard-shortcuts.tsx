"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  {
    category: "General",
    items: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Ctrl", "Z"], description: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
      { keys: ["Ctrl", "Y"], description: "Redo (alternative)" },
      { keys: ["Ctrl", "S"], description: "Save flowchart" },
    ],
  },
  {
    category: "Selection",
    items: [
      { keys: ["Ctrl", "A"], description: "Select all" },
      { keys: ["Ctrl", "Click"], description: "Multi-select" },
      { keys: ["Esc"], description: "Deselect all" },
      { keys: ["V"], description: "Selection mode" },
      { keys: ["H"], description: "Pan mode" },
    ],
  },
  {
    category: "Edit",
    items: [
      { keys: ["Ctrl", "C"], description: "Copy" },
      { keys: ["Ctrl", "X"], description: "Cut" },
      { keys: ["Ctrl", "V"], description: "Paste" },
      { keys: ["Ctrl", "D"], description: "Duplicate" },
      { keys: ["Delete"], description: "Delete selected" },
      { keys: ["Backspace"], description: "Delete selected" },
    ],
  },
  {
    category: "View",
    items: [
      { keys: ["Ctrl", "+"], description: "Zoom in" },
      { keys: ["Ctrl", "-"], description: "Zoom out" },
      { keys: ["Ctrl", "0"], description: "Reset zoom" },
      { keys: ["Ctrl", "1"], description: "Fit view" },
      { keys: ["Space", "Drag"], description: "Pan canvas" },
    ],
  },
  {
    category: "Nodes",
    items: [
      { keys: ["1"], description: "Add Start node" },
      { keys: ["2"], description: "Add Process node" },
      { keys: ["3"], description: "Add Decision node" },
      { keys: ["4"], description: "Add End node" },
      { keys: ["5"], description: "Add Base node" },
    ],
  },
];

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold mb-3">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-muted-foreground">
                        {item.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                              {key}
                            </kbd>
                            {keyIndex < item.keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {section.category !== shortcuts[shortcuts.length - 1].category && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

