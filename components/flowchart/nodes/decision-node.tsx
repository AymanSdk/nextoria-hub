"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { GitBranch } from "lucide-react";

export type DecisionNodeProps = NodeProps & {
  data: {
    label: string;
  };
};

export const DecisionNode = memo(({ data, selected }: DecisionNodeProps) => {
  return (
    <div className="relative">
      <div
        className={cn(
          "relative px-6 py-4 bg-amber-50 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-700 shadow-sm transition-all",
          "rotate-45 w-[140px] h-[140px] flex items-center justify-center",
          selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        <div className="-rotate-45 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-amber-700 dark:text-amber-300" />
          <div className="font-medium text-sm text-amber-900 dark:text-amber-100 text-center">
            {data.label}
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary absolute -top-2 left-1/2 -translate-x-1/2"
      />
      
      <Handle
        type="source"
        id="yes"
        position={Position.Right}
        className="w-3 h-3 !bg-green-500 absolute top-1/2 -right-2 -translate-y-1/2"
      />
      
      <Handle
        type="source"
        id="no"
        position={Position.Bottom}
        className="w-3 h-3 !bg-red-500 absolute -bottom-2 left-1/2 -translate-x-1/2"
      />
    </div>
  );
});

DecisionNode.displayName = "DecisionNode";

