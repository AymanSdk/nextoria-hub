"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useNodes, useEdges } from "@xyflow/react";

interface ChangeLog {
  id: string;
  timestamp: string;
  type: "node" | "edge";
  action: string;
}

export function ChangeLogger() {
  const nodes = useNodes();
  const edges = useEdges();
  const [changes, setChanges] = useState<ChangeLog[]>([]);

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    setChanges((prev) => [
      {
        id: Date.now().toString(),
        timestamp,
        type: "node",
        action: `${nodes.length} nodes`,
      },
      ...prev.slice(0, 19),
    ]);
  }, [nodes.length]);

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    setChanges((prev) => [
      {
        id: Date.now().toString(),
        timestamp,
        type: "edge",
        action: `${edges.length} edges`,
      },
      ...prev.slice(0, 19),
    ]);
  }, [edges.length]);

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {changes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No changes yet
          </div>
        ) : (
          changes.map((change) => (
            <div
              key={change.id}
              className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-[10px]"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={change.type === "node" ? "default" : "secondary"}
                  className="text-[10px] h-4"
                >
                  {change.type}
                </Badge>
                <span>{change.action}</span>
              </div>
              <span className="text-muted-foreground">{change.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}

