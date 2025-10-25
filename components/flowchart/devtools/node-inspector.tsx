"use client";

import { useNodes } from "@xyflow/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function NodeInspector() {
  const nodes = useNodes();

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3">
        {nodes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No nodes in flow
          </div>
        ) : (
          nodes.map((node) => (
            <div key={node.id} className="space-y-2 p-2 rounded-md bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-semibold truncate">{node.data.label || node.id}</span>
                <Badge variant="outline" className="text-xs">
                  {node.type}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-1 text-[10px] text-muted-foreground">
                <div>ID: {node.id}</div>
                <div>
                  Position: ({Math.round(node.position.x)}, {Math.round(node.position.y)})
                </div>
                {node.selected && (
                  <Badge variant="default" className="text-[10px] h-4">
                    Selected
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}

