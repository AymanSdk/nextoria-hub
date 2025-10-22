"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useProjectRequestStats } from "@/hooks/use-project-request-stats";
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
  Building2,
  ChevronUp,
  User2,
  Send,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  roles?: string[];
}

const mainNavItems: NavItem[] = [
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
];

const clientRequestItems: NavItem[] = [
  {
    title: "Project Requests",
    href: "/project-requests",
    icon: Send,
    roles: ["CLIENT"],
  },
];

const workspaceItems: NavItem[] = [
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
    title: "Clients",
    href: "/clients",
    icon: Building2,
    roles: ["ADMIN", "DEVELOPER", "DESIGNER", "MARKETER"],
  },
  {
    title: "Project Requests",
    href: "/project-requests",
    icon: Send,
    roles: ["ADMIN", "DEVELOPER", "DESIGNER", "MARKETER"],
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
];

const toolsItems: NavItem[] = [
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
];

const financeItems: NavItem[] = [
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

const settingsItems: NavItem[] = [
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
  const { pendingCount } = useProjectRequestStats();

  const userRole = session?.user?.role || "CLIENT";
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;
  const isClient = userRole === "CLIENT";

  // Customize navigation items based on role
  const customMainNavItems = mainNavItems.map((item) => {
    if (isClient) {
      // For clients, change "Dashboard" to point to client portal
      if (item.href === "/") {
        return { ...item, href: "/client-portal", title: "Dashboard" };
      }
      // Change "Projects" to "My Projects" for clients
      if (item.href === "/projects") {
        return { ...item, title: "My Projects" };
      }
      // Change "Tasks" to "My Tasks" for clients
      if (item.href === "/tasks") {
        return { ...item, title: "My Tasks" };
      }
    }
    return item;
  });

  // Add badge count to Project Requests for admins/team
  const customWorkspaceItems = workspaceItems.map((item) => {
    if (item.href === "/project-requests" && pendingCount > 0) {
      return { ...item, badge: pendingCount };
    }
    return item;
  });

  const filterByRole = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(userRole);
    });
  };

  const renderNavGroup = (items: NavItem[], label?: string) => {
    const filteredItems = filterByRole(items);
    if (filteredItems.length === 0) return null;

    return (
      <SidebarGroup>
        {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && item.badge > 0 && (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300'>
                  <span className='text-sm font-bold text-white dark:text-neutral-900'>
                    N
                  </span>
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Nextoria</span>
                  <span className='truncate text-xs text-muted-foreground'>Hub</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className='overflow-hidden'>
        {renderNavGroup(customMainNavItems)}
        {isClient && renderNavGroup(clientRequestItems)}
        {!isClient && renderNavGroup(customWorkspaceItems, "Workspace")}
        {!isClient && renderNavGroup(toolsItems, "Tools")}
        {isClient &&
          renderNavGroup(
            toolsItems.filter((item) => item.href === "/chat" || item.href === "/files"),
            "Tools"
          )}
        {renderNavGroup(
          financeItems.filter((item) => item.href === "/invoices"),
          isClient ? "Invoices" : "Finance"
        )}
        <SidebarSeparator />
        {renderNavGroup(settingsItems)}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={userImage || undefined} alt={userName} />
                    <AvatarFallback className='rounded-lg'>
                      {userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>{userName}</span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {userEmail}
                    </span>
                  </div>
                  <ChevronUp className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    <Avatar className='h-8 w-8 rounded-lg'>
                      <AvatarImage src={userImage || undefined} alt={userName} />
                      <AvatarFallback className='rounded-lg'>
                        {userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>{userName}</span>
                      <span className='truncate text-xs text-muted-foreground'>
                        {userEmail}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/settings/profile'>
                    <User2 className='mr-2 h-4 w-4' />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/settings'>
                    <Settings className='mr-2 h-4 w-4' />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/docs'>
                    <BookOpen className='mr-2 h-4 w-4' />
                    Documentation
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400'
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
