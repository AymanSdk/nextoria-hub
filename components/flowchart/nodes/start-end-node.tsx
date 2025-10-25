"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Play, Square } from "lucide-react";

export type StartEndNodeProps = NodeProps & {
  data: {
    label: string;
    type: "start" | "end";
  };
};

export const StartEndNode = memo(({ data, selected }: StartEndNodeProps) => {
  const isStart = data.type === "start";
  const Icon = isStart ? Play : Square;

  return (
    <div
      className={cn(
        "px-6 py-3 rounded-full border-2 shadow-sm min-w-[160px] transition-all text-center",
        isStart 
          ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-400 dark:border-emerald-700"
          : "bg-rose-50 dark:bg-rose-950 border-rose-400 dark:border-rose-700",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-primary"
        />
      )}
      
      <div className="flex items-center justify-center gap-2">
        <Icon className={cn(
          "w-4 h-4",
          isStart ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
        )} />
        <div className={cn(
          "font-semibold text-sm",
          isStart ? "text-emerald-900 dark:text-emerald-100" : "text-rose-900 dark:text-rose-100"
        )}>
          {data.label}
        </div>
      </div>

      {isStart && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-primary"
        />
      )}
    </div>
  );
});

StartEndNode.displayName = "StartEndNode";

