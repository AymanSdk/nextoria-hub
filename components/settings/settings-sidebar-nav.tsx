"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Bell, Palette, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SettingsSidebarNavProps {
  isAdmin: boolean;
  hasPassword: boolean;
}

const navItems = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: User,
    description: "Manage your personal information",
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: Shield,
    description: "Password and authentication",
    requiresPassword: true,
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
    description: "Configure notification preferences",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
    icon: Palette,
    description: "Customize your interface",
  },
  {
    title: "Workspace",
    href: "/settings/workspace",
    icon: Building2,
    description: "Manage workspace settings",
    adminOnly: true,
  },
];

export function SettingsSidebarNav({ isAdmin, hasPassword }: SettingsSidebarNavProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.requiresPassword && !hasPassword) return false;
    return true;
  });

  return (
    <nav className='space-y-1'>
      {filteredItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <div key={item.href}>
            <Link href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-auto py-3 px-4 text-left",
                  isActive && "bg-secondary font-medium shadow-sm"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='truncate'>{item.title}</span>
                    {item.adminOnly && (
                      <Badge variant='outline' className='text-xs'>
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground truncate mt-0.5'>
                    {item.description}
                  </p>
                </div>
              </Button>
            </Link>
            {index < filteredItems.length - 1 && (
              <Separator className='my-1 bg-border/50' />
            )}
          </div>
        );
      })}
    </nav>
  );
}
