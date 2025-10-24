"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Circle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText,
  ChevronDown,
  Loader2 
} from "lucide-react";
import { toast } from "sonner";

interface ProjectStatusBadgeProps {
  status: string;
  projectSlug: string;
  editable?: boolean;
}

const statusConfig = {
  DRAFT: {
    label: "Draft",
    icon: FileText,
    variant: "outline" as const,
    color: "text-gray-500",
  },
  ACTIVE: {
    label: "Active",
    icon: Circle,
    variant: "default" as const,
    color: "text-blue-500",
  },
  ON_HOLD: {
    label: "On Hold",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-500",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    variant: "secondary" as const,
    color: "text-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-red-500",
  },
};

export function ProjectStatusBadge({ 
  status, 
  projectSlug,
  editable = true 
}: ProjectStatusBadgeProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
  const Icon = config.icon;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/projects/${projectSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Status updated successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (!editable) {
    return (
      <Badge variant={config.variant} className="gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
        {config.label}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          disabled={updating}
        >
          <Badge variant={config.variant} className="gap-1.5 cursor-pointer">
            {updating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Icon className={`h-3.5 w-3.5 ${config.color}`} />
            )}
            {config.label}
            <ChevronDown className="h-3 w-3 ml-0.5" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(statusConfig).map(([key, value]) => {
          const ItemIcon = value.icon;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handleStatusChange(key)}
              disabled={key === status}
            >
              <ItemIcon className={`h-4 w-4 mr-2 ${value.color}`} />
              {value.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

