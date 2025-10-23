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
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>{currentWorkspace.name}</span>
            <span className='truncate text-xs'>
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
        <DropdownMenuLabel className='text-xs text-muted-foreground'>
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
                    <p className='text-sm font-medium truncate'>{workspace.name}</p>
                    <p className='text-xs text-muted-foreground truncate'>
                      {workspace.description || workspace.slug}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-1 shrink-0'>
                  {isOwner && (
                    <Badge variant='secondary' className='text-xs'>
                      Owner
                    </Badge>
                  )}
                  <Badge variant='outline' className='text-xs'>
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
