"use client";

import { Panel } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { ViewportLogger } from "./viewport-logger";
import { NodeInspector } from "./node-inspector";
import { ChangeLogger } from "./change-logger";

type PanelPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface DevToolsProps {
  position?: PanelPosition;
}

export function DevTools({ position = "bottom-right" }: DevToolsProps) {
  const [mode, setMode] = useState<string>("viewport");

  return (
    <Panel position={position} className="bg-background">
      <Card className="p-4 space-y-3 w-80 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">DevTools</h3>
          <ToggleGroup type="single" value={mode} onValueChange={setMode} size="sm">
            <ToggleGroupItem value="viewport" className="text-xs">
              Viewport
            </ToggleGroupItem>
            <ToggleGroupItem value="nodes" className="text-xs">
              Nodes
            </ToggleGroupItem>
            <ToggleGroupItem value="changes" className="text-xs">
              Changes
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="text-xs">
          {mode === "viewport" && <ViewportLogger />}
          {mode === "nodes" && <NodeInspector />}
          {mode === "changes" && <ChangeLogger />}
        </div>
      </Card>
    </Panel>
  );
}

