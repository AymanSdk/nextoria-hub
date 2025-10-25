"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const CustomEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
    selected,
  }: EdgeProps) => {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const edgeStyle = {
      ...style,
      strokeWidth: selected ? 2.5 : 2,
      stroke: selected ? "#3b82f6" : style.stroke || "#94a3b8",
      transition: "stroke 0.2s, stroke-width 0.2s",
    };

    return (
      <>
        <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
        <EdgeLabelRenderer>
          {data?.showDeleteButton && (
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "all",
              }}
              className='nodrag nopan'
            >
              <Button
                variant='destructive'
                size='icon'
                className='h-7 w-7 rounded-full shadow-lg hover:scale-110 transition-transform'
                onClick={() => {
                  if (data?.onDelete) {
                    data.onDelete(id);
                  }
                }}
              >
                <X className='h-3.5 w-3.5' />
              </Button>
            </div>
          )}
          {data?.label && (
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "all",
              }}
              className='nodrag nopan px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium shadow-lg backdrop-blur-sm'
            >
              {data.label}
            </div>
          )}
        </EdgeLabelRenderer>
      </>
    );
  }
);

CustomEdge.displayName = "CustomEdge";
