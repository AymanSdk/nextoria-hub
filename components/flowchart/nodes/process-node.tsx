"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Settings, Loader2, CheckCircle2, XCircle, Pause } from "lucide-react";

export type ProcessNodeProps = NodeProps & {
  data: {
    label: string;
    status?: "idle" | "running" | "success" | "error";
  };
};

const statusConfig = {
  idle: {
    container:
      "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300",
    icon: Pause,
    iconColor: "text-slate-500 dark:text-slate-400",
    dot: "bg-slate-400",
    shadow: "shadow-slate-500/10",
  },
  running: {
    container:
      "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-300 dark:border-blue-700 hover:border-blue-400",
    icon: Loader2,
    iconColor: "text-blue-600 dark:text-blue-400 animate-spin",
    dot: "bg-blue-500 animate-pulse",
    shadow: "shadow-blue-500/20",
  },
  success: {
    container:
      "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-300 dark:border-emerald-700 hover:border-emerald-400",
    icon: CheckCircle2,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    shadow: "shadow-emerald-500/20",
  },
  error: {
    container:
      "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 border-red-300 dark:border-red-700 hover:border-red-400",
    icon: XCircle,
    iconColor: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    shadow: "shadow-red-500/20",
  },
};

export const ProcessNode = memo(({ data, selected }: ProcessNodeProps) => {
  const status = data.status || "idle";
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm min-w-[200px] transition-all duration-200",
        config.container,
        config.shadow,
        selected &&
          "ring-2 ring-blue-500 ring-offset-2 ring-offset-background shadow-xl shadow-blue-500/20"
      )}
    >
      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 !bg-blue-500 !border-2 !border-white dark:!border-slate-900 shadow-md transition-transform hover:scale-125'
      />

      <div className='flex items-center gap-3'>
        <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-white/50 dark:bg-slate-800/50 flex items-center justify-center shadow-sm'>
          <Icon className={cn("w-4 h-4", config.iconColor)} />
        </div>
        <div className='flex-1 font-semibold text-sm text-slate-900 dark:text-slate-100 leading-tight'>
          {data.label}
        </div>
        <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", config.dot)} />
      </div>

      <Handle
        type='source'
        position={Position.Bottom}
        className='w-3 h-3 !bg-blue-500 !border-2 !border-white dark:!border-slate-900 shadow-md transition-transform hover:scale-125'
      />
    </div>
  );
});

ProcessNode.displayName = "ProcessNode";
