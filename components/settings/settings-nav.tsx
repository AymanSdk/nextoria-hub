"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsNavProps {
  isAdmin: boolean;
}

export function SettingsNav({ isAdmin }: SettingsNavProps) {
  const pathname = usePathname();

  return (
    <div className='flex justify-center'>
      <div className='inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground'>
        <Link
          href='/settings/profile'
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-background/50",
            pathname === "/settings/profile" && "bg-background text-foreground shadow-sm"
          )}
        >
          <User className='mr-2 h-4 w-4' />
          Profile
        </Link>
        {isAdmin && (
          <Link
            href='/settings/workspace'
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-background/50",
              pathname === "/settings/workspace" &&
                "bg-background text-foreground shadow-sm"
            )}
          >
            <Building2 className='mr-2 h-4 w-4' />
            Workspace
          </Link>
        )}
      </div>
    </div>
  );
}
