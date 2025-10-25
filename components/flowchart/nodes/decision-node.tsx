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
    <div className='relative'>
      <div
        className={cn(
          "relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/60 dark:via-orange-950/60 dark:to-amber-950/60",
          "border border-amber-300 dark:border-amber-700 shadow-lg shadow-amber-500/10 backdrop-blur-sm",
          "transition-all duration-200",
          "rotate-45 w-[150px] h-[150px] flex items-center justify-center rounded-2xl",
          selected &&
            "ring-2 ring-blue-500 ring-offset-2 ring-offset-background shadow-xl shadow-blue-500/20"
        )}
      >
        <div className='-rotate-45 flex flex-col items-center gap-2 px-4'>
          <div className='w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shadow-sm'>
            <GitBranch className='w-4 h-4 text-amber-700 dark:text-amber-300' />
          </div>
          <div className='font-semibold text-sm text-amber-900 dark:text-amber-100 text-center leading-tight max-w-[90px]'>
            {data.label}
          </div>
        </div>
      </div>

      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 !bg-blue-500 !border-2 !border-white dark:!border-slate-900 shadow-md absolute -top-2 left-1/2 -translate-x-1/2 transition-transform hover:scale-125'
      />

      <Handle
        type='source'
        id='yes'
        position={Position.Right}
        className='w-3 h-3 !bg-emerald-500 !border-2 !border-white dark:!border-slate-900 shadow-md absolute top-1/2 -right-2 -translate-y-1/2 transition-transform hover:scale-125'
      />

      <Handle
        type='source'
        id='no'
        position={Position.Bottom}
        className='w-3 h-3 !bg-red-500 !border-2 !border-white dark:!border-slate-900 shadow-md absolute -bottom-2 left-1/2 -translate-x-1/2 transition-transform hover:scale-125'
      />
    </div>
  );
});

DecisionNode.displayName = "DecisionNode";
