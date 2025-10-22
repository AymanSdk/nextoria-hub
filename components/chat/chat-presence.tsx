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

  // Get other users (not including current user)
  const otherUsers = others.map((other) => ({
    id: other.connectionId, // Use connectionId as unique key
    name: other.info?.name || "Anonymous",
    avatar: other.info?.avatar,
  }));

  // Total count includes current user
  const totalCount = otherUsers.length + 1;

  return (
    <div className='flex items-center gap-2'>
      <span className='text-xs text-muted-foreground'>
        {otherUsers.length === 0 ? "Only you" : `${totalCount} online`}
      </span>

      {otherUsers.length > 0 && (
        <TooltipProvider>
          <div className='flex -space-x-2'>
            {otherUsers.slice(0, 5).map((user) => (
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

            {otherUsers.length > 5 && (
              <div className='h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center'>
                <span className='text-[10px] font-medium'>+{otherUsers.length - 5}</span>
              </div>
            )}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
