"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
    router.refresh();
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className='sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-white/80 backdrop-blur-sm dark:bg-neutral-950/80 px-6'>
      {/* Left: Search */}
      <div className='flex flex-1 items-center gap-4'>
        <Button variant='ghost' size='icon' className='md:hidden'>
          <Menu className='h-5 w-5' />
        </Button>

        <div className='relative w-full max-w-md'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500' />
          <Input
            type='search'
            placeholder='Search projects, tasks, or people...'
            className='pl-10 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
          />
        </div>
      </div>

      {/* Right: Notifications & User */}
      <div className='flex items-center gap-2'>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='relative'>
              <Bell className='h-5 w-5' />
              <span className='absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-80'>
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className='p-4 text-center text-sm text-neutral-500'>
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='gap-2 px-2'>
              <Avatar className='h-8 w-8'>
                <AvatarImage
                  src={user?.image || undefined}
                  alt={user?.name || "User"}
                />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className='hidden flex-col items-start text-left md:flex'>
                <span className='text-sm font-medium'>
                  {user?.name || "User"}
                </span>
                <span className='text-xs text-neutral-500'>
                  {user?.role || "Member"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>
              <div className='flex flex-col'>
                <span className='text-sm font-medium'>{user?.name}</span>
                <span className='text-xs text-neutral-500'>{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/settings/workspace")}>
              Workspace Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings/billing")}>
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className='text-red-600 dark:text-red-400'>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
