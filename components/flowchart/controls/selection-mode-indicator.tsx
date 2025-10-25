"use client";

import { Badge } from "@/components/ui/badge";
import { MousePointer2, Hand, Box } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionModeIndicatorProps {
  mode: "select" | "pan";
}

export function SelectionModeIndicator({ mode }: SelectionModeIndicatorProps) {
  const isSelectMode = mode === "select";

  return (
    <div className='absolute bottom-4 left-1/2 -translate-x-1/2 z-10'>
      <Badge
        variant={isSelectMode ? "default" : "secondary"}
        className={cn(
          "px-3 py-2 gap-2 text-sm font-medium shadow-lg transition-all",
          isSelectMode && "bg-primary text-primary-foreground"
        )}
      >
        {isSelectMode ? (
          <>
            <MousePointer2 className='h-4 w-4' />
            <span>Selection Mode</span>
            <div className='flex items-center gap-1 ml-2 pl-2 border-l border-primary-foreground/30'>
              <Box className='h-3 w-3' />
              <span className='text-xs'>Drag to select</span>
            </div>
          </>
        ) : (
          <>
            <Hand className='h-4 w-4' />
            <span>Pan Mode</span>
            <span className='text-xs ml-2 pl-2 border-l border-muted-foreground/30'>
              Drag to move canvas
            </span>
          </>
        )}
      </Badge>
    </div>
  );
}
