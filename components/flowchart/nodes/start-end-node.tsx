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
        "relative px-6 py-3.5 rounded-full border shadow-lg backdrop-blur-sm min-w-[180px] transition-all duration-200 text-center",
        isStart
          ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/60 dark:via-teal-950/60 dark:to-emerald-950/60 border-emerald-300 dark:border-emerald-700 shadow-emerald-500/10 hover:shadow-emerald-500/20"
          : "bg-gradient-to-r from-rose-50 via-red-50 to-rose-50 dark:from-rose-950/60 dark:via-red-950/60 dark:to-rose-950/60 border-rose-300 dark:border-rose-700 shadow-rose-500/10 hover:shadow-rose-500/20",
        selected &&
          "ring-2 ring-blue-500 ring-offset-2 ring-offset-background shadow-xl shadow-blue-500/20"
      )}
    >
      {!isStart && (
        <Handle
          type='target'
          position={Position.Top}
          className='w-3 h-3 !bg-blue-500 !border-2 !border-white dark:!border-slate-900 shadow-md transition-transform hover:scale-125'
        />
      )}

      <div className='flex items-center justify-center gap-2.5'>
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
            isStart
              ? "bg-emerald-100 dark:bg-emerald-900/50"
              : "bg-rose-100 dark:bg-rose-900/50"
          )}
        >
          <Icon
            className={cn(
              "w-4 h-4",
              isStart
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-rose-700 dark:text-rose-300"
            )}
          />
        </div>
        <div
          className={cn(
            "font-semibold text-sm leading-tight",
            isStart
              ? "text-emerald-900 dark:text-emerald-100"
              : "text-rose-900 dark:text-rose-100"
          )}
        >
          {data.label}
        </div>
      </div>

      {isStart && (
        <Handle
          type='source'
          position={Position.Bottom}
          className='w-3 h-3 !bg-blue-500 !border-2 !border-white dark:!border-slate-900 shadow-md transition-transform hover:scale-125'
        />
      )}
    </div>
  );
});

StartEndNode.displayName = "StartEndNode";
