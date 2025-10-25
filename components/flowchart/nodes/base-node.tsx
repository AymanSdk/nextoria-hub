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
  default: "bg-background border-border",
  success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
  error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
  info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
};

export const BaseNode = memo(({ data, selected }: BaseNodeProps) => {
  const variant = data.variant || "default";

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border-2 shadow-sm min-w-[200px] transition-all",
        variantStyles[variant],
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary"
      />
      
      <div className="flex items-start gap-3">
        {data.icon && (
          <div className="flex-shrink-0 mt-0.5">
            {data.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground">
            {data.label}
          </div>
          {data.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {data.description}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary"
      />
    </div>
  );
});

BaseNode.displayName = "BaseNode";

