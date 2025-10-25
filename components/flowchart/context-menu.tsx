"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Lock,
  Unlock,
  Edit,
  Layers,
  ZoomIn,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from "lucide-react";

interface FlowchartContextMenuProps {
  children: React.ReactNode;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLock: () => void;
  onEdit: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onAlign: (type: string) => void;
  hasSelection: boolean;
}

export function FlowchartContextMenu({
  children,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onDuplicate,
  onLock,
  onEdit,
  onBringToFront,
  onSendToBack,
  onAlign,
  hasSelection,
}: FlowchartContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className='w-64'>
        {hasSelection ? (
          <>
            <ContextMenuItem onClick={onEdit}>
              <Edit className='mr-2 h-4 w-4' />
              Edit Properties
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onCopy}>
              <Copy className='mr-2 h-4 w-4' />
              Copy
              <span className='ml-auto text-xs text-muted-foreground'>Ctrl+C</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={onCut}>
              <Scissors className='mr-2 h-4 w-4' />
              Cut
              <span className='ml-auto text-xs text-muted-foreground'>Ctrl+X</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={onDuplicate}>
              <Copy className='mr-2 h-4 w-4' />
              Duplicate
              <span className='ml-auto text-xs text-muted-foreground'>Ctrl+D</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <AlignCenterHorizontal className='mr-2 h-4 w-4' />
                Align
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className='w-48'>
                <ContextMenuItem onClick={() => onAlign("left")}>
                  <AlignStartHorizontal className='mr-2 h-4 w-4' />
                  Align Left
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAlign("center")}>
                  <AlignCenterHorizontal className='mr-2 h-4 w-4' />
                  Align Center
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAlign("right")}>
                  <AlignEndHorizontal className='mr-2 h-4 w-4' />
                  Align Right
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => onAlign("top")}>
                  <AlignStartVertical className='mr-2 h-4 w-4' />
                  Align Top
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAlign("middle")}>
                  <AlignCenterVertical className='mr-2 h-4 w-4' />
                  Align Middle
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onAlign("bottom")}>
                  <AlignEndVertical className='mr-2 h-4 w-4' />
                  Align Bottom
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Layers className='mr-2 h-4 w-4' />
                Arrange
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className='w-48'>
                <ContextMenuItem onClick={onBringToFront}>
                  <Layers className='mr-2 h-4 w-4' />
                  Bring to Front
                </ContextMenuItem>
                <ContextMenuItem onClick={onSendToBack}>
                  <Layers className='mr-2 h-4 w-4' />
                  Send to Back
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem onClick={onLock}>
              <Lock className='mr-2 h-4 w-4' />
              Lock Position
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onDelete} className='text-destructive'>
              <Trash2 className='mr-2 h-4 w-4' />
              Delete
              <span className='ml-auto text-xs'>Del</span>
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem onClick={onPaste}>
              <Clipboard className='mr-2 h-4 w-4' />
              Paste
              <span className='ml-auto text-xs text-muted-foreground'>Ctrl+V</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
