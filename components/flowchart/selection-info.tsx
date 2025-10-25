"use client";

import { useNodes, useEdges } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { MousePointer2 } from "lucide-react";

export function SelectionInfo() {
  const nodes = useNodes();
  const edges = useEdges();

  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedEdges = edges.filter((e) => e.selected);
  const totalSelected = selectedNodes.length + selectedEdges.length;

  if (totalSelected === 0) return null;

  return (
    <div className='absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2'>
      <MousePointer2 className='h-4 w-4' />
      <span className='text-sm font-medium'>
        {selectedNodes.length > 0 && `${selectedNodes.length} node${selectedNodes.length > 1 ? "s" : ""}`}
        {selectedNodes.length > 0 && selectedEdges.length > 0 && " & "}
        {selectedEdges.length > 0 && `${selectedEdges.length} edge${selectedEdges.length > 1 ? "s" : ""}`}
        {" selected"}
      </span>
      <Badge variant='secondary' className='ml-1'>
        {totalSelected}
      </Badge>
    </div>
  );
}

