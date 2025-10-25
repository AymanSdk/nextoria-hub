"use client";

import { Button } from "@/components/ui/button";
import { Play, Square, Settings, GitBranch, Box, Database, X, Plus } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NodePaletteProps {
  onAddNode: (type: string) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const [isOpen, setIsOpen] = useState(false);

  const nodeTypes = [
    {
      type: "start",
      icon: Play,
      label: "Start",
      color: "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950",
    },
    {
      type: "end",
      icon: Square,
      label: "End",
      color: "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950",
    },
    {
      type: "process",
      icon: Settings,
      label: "Process",
      color: "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950",
    },
    {
      type: "decision",
      icon: GitBranch,
      label: "Decision",
      color: "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950",
    },
    {
      type: "base",
      icon: Box,
      label: "Basic",
      color: "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950",
    },
    {
      type: "databaseSchema",
      icon: Database,
      label: "Database",
      color: "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950",
    },
  ];

  return (
    <TooltipProvider>
      <div className='absolute left-4 top-20 z-10'>
        {/* Toggle Button */}
        {!isOpen ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='h-10 w-10 rounded-full shadow-lg bg-background hover:scale-110 transition-transform'
                onClick={() => setIsOpen(true)}
              >
                <Plus className='h-5 w-5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='right'>Add Node</TooltipContent>
          </Tooltip>
        ) : (
          /* Expanded Palette */
          <div className='bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border rounded-2xl shadow-xl p-2 w-14'>
            {/* Close Button */}
            <Button
              variant='ghost'
              size='icon'
              className='h-10 w-10 mb-1 hover:bg-destructive/10'
              onClick={() => setIsOpen(false)}
            >
              <X className='h-4 w-4' />
            </Button>

            <div className='h-px bg-border my-2' />

            {/* Node Buttons */}
            <div className='space-y-1'>
              {nodeTypes.map(({ type, icon: Icon, label, color }) => (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className={`h-10 w-10 rounded-lg ${color} transition-all`}
                      onClick={() => onAddNode(type)}
                    >
                      <Icon className='h-5 w-5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='right'>
                    <p className='font-medium'>{label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
