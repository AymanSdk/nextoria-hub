"use client";

import { useOthers, useSelf } from "@/liveblocks.config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ChatPresence() {
  const others = useOthers();
  const currentUser = useSelf();

  // Get all active users (including current user)
  const activeUsers = [
    ...(currentUser
      ? [
          {
            id: currentUser.id,
            name: currentUser.info?.name || "You",
            avatar: currentUser.info?.avatar,
          },
        ]
      : []),
    ...others.map((other) => ({
      id: other.id,
      name: other.info?.name || "Anonymous",
      avatar: other.info?.avatar,
    })),
  ];

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className='flex items-center gap-2'>
      <span className='text-xs text-muted-foreground'>
        {activeUsers.length === 1 ? "Only you" : `${activeUsers.length} online`}
      </span>

      <TooltipProvider>
        <div className='flex -space-x-2'>
          {activeUsers.slice(0, 5).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div className='relative'>
                  <Avatar className='h-7 w-7 border-2 border-background ring-1 ring-border'>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className='text-xs bg-primary/10 text-primary'>
                      {user.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className='absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background' />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {activeUsers.length > 5 && (
            <div className='h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center'>
              <span className='text-[10px] font-medium'>+{activeUsers.length - 5}</span>
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
