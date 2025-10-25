"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export type BaseNodeProps = NodeProps & {
  data: {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    variant?: "default" | "success" | "warning" | "error" | "info";
  };
};

const variantStyles = {
  default: {
    container:
      "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
    icon: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    text: "text-slate-900 dark:text-slate-100",
  },
  success: {
    container:
      "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700",
    icon: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    text: "text-emerald-900 dark:text-emerald-100",
  },
  warning: {
    container:
      "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700",
    icon: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    text: "text-amber-900 dark:text-amber-100",
  },
  error: {
    container:
      "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700",
    icon: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
    text: "text-red-900 dark:text-red-100",
  },
  info: {
    container:
      "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700",
    icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    text: "text-blue-900 dark:text-blue-100",
  },
};

export const BaseNode = memo(({ data, selected }: BaseNodeProps) => {
  const variant = data.variant || "default";
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative px-4 py-3.5 rounded-xl border shadow-lg shadow-black/5 min-w-[220px] transition-all duration-200 backdrop-blur-sm",
        styles.container,
        selected &&
          "ring-2 ring-blue-500 ring-offset-2 ring-offset-background shadow-xl shadow-blue-500/20"
      )}
    >
      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 !bg-blue-500 !border-2 !border-white dark:!border-slate-900 shadow-md transition-transform hover:scale-125'
      />

      <div className='flex items-start gap-3'>
        {data.icon && (
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-transform hover:scale-105",
              styles.icon
            )}
          >
            {data.icon}
          </div>
        )}
        <div className='flex-1 min-w-0'>
          <div className={cn("font-semibold text-sm leading-tight", styles.text)}>
            {data.label}
          </div>
          {data.description && (
            <div className='text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed'>
              {data.description}
            </div>
          )}
        </div>
      </div>

      <Handle
        type='source'
        position={Position.Bottom}
        className='w-3 h-3 !bg-blue-500 !border-2 !border-white dark:!border-slate-900 shadow-md transition-transform hover:scale-125'
      />
    </div>
  );
});

BaseNode.displayName = "BaseNode";
