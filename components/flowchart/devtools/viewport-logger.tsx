"use client";

import { useViewport } from "@xyflow/react";
import { Separator } from "@/components/ui/separator";

export function ViewportLogger() {
  const { x, y, zoom } = useViewport();

  return (
    <div className="space-y-2 font-mono">
      <div className="flex justify-between">
        <span className="text-muted-foreground">x:</span>
        <span className="font-semibold">{x.toFixed(2)}</span>
      </div>
      <Separator />
      <div className="flex justify-between">
        <span className="text-muted-foreground">y:</span>
        <span className="font-semibold">{y.toFixed(2)}</span>
      </div>
      <Separator />
      <div className="flex justify-between">
        <span className="text-muted-foreground">zoom:</span>
        <span className="font-semibold">{(zoom * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

