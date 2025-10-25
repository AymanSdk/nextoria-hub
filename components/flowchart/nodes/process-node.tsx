"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";

export type ProcessNodeProps = NodeProps & {
  data: {
    label: string;
    status?: "idle" | "running" | "success" | "error";
  };
};

const statusStyles = {
  idle: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
  running: "bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 animate-pulse",
  success: "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700",
  error: "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700",
};

const statusDotStyles = {
  idle: "bg-gray-400",
  running: "bg-blue-500 animate-pulse",
  success: "bg-green-500",
  error: "bg-red-500",
};

export const ProcessNode = memo(({ data, selected }: ProcessNodeProps) => {
  const status = data.status || "idle";

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border-2 shadow-sm min-w-[180px] transition-all",
        statusStyles[status],
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary"
      />
      
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1 font-medium text-sm">{data.label}</div>
        <div className={cn("w-2 h-2 rounded-full", statusDotStyles[status])} />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary"
      />
    </div>
  );
});

ProcessNode.displayName = "ProcessNode";

