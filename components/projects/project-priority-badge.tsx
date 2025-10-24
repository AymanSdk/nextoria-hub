"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProjectPriorityBadgeProps {
  priority: number | null;
}

const priorityConfig = {
  0: { label: "Low", color: "bg-gray-500 text-white", icon: TrendingDown },
  1: { label: "Medium", color: "bg-blue-500 text-white", icon: Minus },
  2: { label: "High", color: "bg-orange-500 text-white", icon: TrendingUp },
  3: { label: "Critical", color: "bg-red-500 text-white", icon: TrendingUp },
};

export function ProjectPriorityBadge({ priority }: ProjectPriorityBadgeProps) {
  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig[0];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`gap-1.5 ${config.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Project Priority: {config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

