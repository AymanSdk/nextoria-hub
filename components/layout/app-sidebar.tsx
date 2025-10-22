"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  FileText,
  Settings,
  MessageSquare,
  BarChart3,
  Wallet,
  Bell,
  Target,
  Calendar,
  Receipt,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  roles?: string[]; // Roles that can see this item
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    icon: Target,
    roles: ["ADMIN", "MARKETER"],
  },
  {
    title: "Content Calendar",
    href: "/content-calendar",
    icon: Calendar,
    roles: ["ADMIN", "MARKETER", "DESIGNER"],
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "Client Portal",
    href: "/client-portal",
    icon: UserCheck,
    roles: ["CLIENT"],
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Files",
    href: "/files",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "MARKETER"],
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: Wallet,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
    roles: ["ADMIN", "DEVELOPER", "DESIGNER", "MARKETER"],
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role || "CLIENT";

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return (
    <div className='flex h-full w-64 flex-col border-r bg-neutral-50/50 dark:bg-neutral-900/50'>
      {/* Logo */}
      <div className='flex h-16 items-center border-b px-6'>
        <Link href='/' className='flex items-center gap-2'>
          <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300' />
          <span className='text-lg font-semibold tracking-tight'>Nextoria</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className='flex-1 px-3 py-4'>
        <nav className='space-y-1'>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 px-3",
                    isActive && "bg-neutral-100 dark:bg-neutral-800"
                  )}>
                  <Icon className='h-4 w-4' />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className='ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-medium text-white dark:bg-neutral-100 dark:text-neutral-900'>
                      {item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        <Separator className='my-4' />

        <nav className='space-y-1'>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 px-3",
                    isActive && "bg-neutral-100 dark:bg-neutral-800"
                  )}>
                  <Icon className='h-4 w-4' />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className='ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white'>
                      {item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
