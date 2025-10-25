"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Hand, MousePointer } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractionModeProps {
  mode: "select" | "pan";
  onChange: (mode: "select" | "pan") => void;
}

export function InteractionMode({ mode, onChange }: InteractionModeProps) {
  return (
    <TooltipProvider>
      <div className="absolute top-4 right-4 z-10 bg-background border border-border rounded-lg shadow-lg p-1 flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={mode === "select" ? "default" : "ghost"}
              size="icon"
              className={cn("h-8 w-8", mode === "select" && "shadow-md")}
              onClick={() => onChange("select")}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Selection Mode (V)</p>
            <p className="text-xs text-muted-foreground">
              Click to select nodes and edges
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={mode === "pan" ? "default" : "ghost"}
              size="icon"
              className={cn("h-8 w-8", mode === "pan" && "shadow-md")}
              onClick={() => onChange("pan")}
            >
              <Hand className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Pan Mode (H)</p>
            <p className="text-xs text-muted-foreground">
              Drag to move canvas
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

