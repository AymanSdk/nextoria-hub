"use client";

import { cn } from "@/lib/utils";
import type { Role } from "@/src/lib/constants/roles";

interface UserRoleBadgeProps {
  role: Role | string;
  size?: "sm" | "md";
  className?: string;
}

const ROLE_CONFIG: Record<
  string,
  {
    icon: string;
    label: string;
    bgColor: string;
    textColor: string;
  }
> = {
  ADMIN: {
    icon: "⭐",
    label: "Admin",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-700 dark:text-yellow-400",
  },
  DEVELOPER: {
    icon: "💻",
    label: "Developer",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-400",
  },
  DESIGNER: {
    icon: "🎨",
    label: "Designer",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-700 dark:text-purple-400",
  },
  MARKETER: {
    icon: "📢",
    label: "Marketer",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-400",
  },
  CLIENT: {
    icon: "👤",
    label: "Client",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    textColor: "text-gray-700 dark:text-gray-400",
  },
};

export function UserRoleBadge({ role, size = "sm", className }: UserRoleBadgeProps) {
  // Handle case where role might be undefined or not in config
  if (!role || !ROLE_CONFIG[role]) {
    return null;
  }

  const config = ROLE_CONFIG[role];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
        config.bgColor,
        config.textColor,
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        className
      )}
      title={config.label}
    >
      <span className='text-[10px]'>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
