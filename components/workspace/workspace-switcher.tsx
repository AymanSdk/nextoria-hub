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
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Building2, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  isActive: boolean;
  role: string;
}

interface WorkspaceSwitcherProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  currentUserId: string;
}

export function WorkspaceSwitcher({
  currentWorkspace,
  workspaces,
  currentUserId,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(currentWorkspace.id);

  const handleSwitchWorkspace = async (workspaceId: string) => {
    if (workspaceId === currentWorkspace.id) return;

    setIsLoading(true);
    setSelectedId(workspaceId);

    try {
      const response = await fetch("/api/workspace/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to switch workspace");
      }

      toast.success("Workspace switched successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to switch workspace");
      setSelectedId(currentWorkspace.id);
    } finally {
      setIsLoading(false);
    }
  };

  if (workspaces.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
          disabled={isLoading}
          tooltip={currentWorkspace.name}
        >
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
            <Building2 className='size-4' />
          </div>
          <div className='grid flex-1 text-left leading-tight'>
            <span className='truncate text-sm font-semibold tracking-tight'>
              {currentWorkspace.name}
            </span>
            <span className='truncate text-[11px] font-medium text-muted-foreground/80 tracking-normal'>
              {currentWorkspace.description || "Workspace"}
            </span>
          </div>
          {isLoading ? (
            <Loader2 className='ml-auto size-4 shrink-0 animate-spin' />
          ) : (
            <ChevronsUpDown className='ml-auto size-4 shrink-0' />
          )}
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
        side='bottom'
        align='start'
        sideOffset={4}
      >
        <DropdownMenuLabel className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70'>
          Switch Workspace
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => {
          const isOwner = workspace.ownerId === currentUserId;
          const isCurrent = workspace.id === selectedId;

          return (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleSwitchWorkspace(workspace.id)}
              className={cn("cursor-pointer", isCurrent && "bg-accent")}
              disabled={isLoading}
            >
              <div className='flex items-center justify-between w-full gap-2'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  {isCurrent && <Check className='h-4 w-4 shrink-0' />}
                  <div className='flex-1 min-w-0'>
                    <p className='text-[13px] font-semibold truncate tracking-tight'>
                      {workspace.name}
                    </p>
                    <p className='text-[11px] text-muted-foreground/80 truncate font-medium tracking-normal'>
                      {workspace.description || workspace.slug}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-1 shrink-0'>
                  {isOwner && (
                    <Badge
                      variant='secondary'
                      className='text-[10px] font-bold tracking-tight'
                    >
                      Owner
                    </Badge>
                  )}
                  <Badge
                    variant='outline'
                    className='text-[10px] font-bold tracking-tight'
                  >
                    {workspace.role}
                  </Badge>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
