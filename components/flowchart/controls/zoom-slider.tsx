"use client";

import { useReactFlow, useViewport } from "@xyflow/react";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut } from "lucide-react";

export function ZoomSlider() {
  const { setViewport } = useReactFlow();
  const { zoom } = useViewport();

  const handleZoomChange = (value: number[]) => {
    setViewport({ x: 0, y: 0, zoom: value[0] }, { duration: 200 });
  };

  return (
    <div className='absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border border-border rounded-lg shadow-lg p-3'>
      <div className='flex flex-col items-center gap-3'>
        <ZoomIn className='h-4 w-4 text-muted-foreground shrink-0' />
        <Slider
          value={[zoom]}
          min={0.1}
          max={2}
          step={0.1}
          onValueChange={handleZoomChange}
          orientation='vertical'
          className='h-32'
        />
        <ZoomOut className='h-4 w-4 text-muted-foreground shrink-0' />
        <span className='text-xs text-muted-foreground font-mono mt-1'>
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
}
