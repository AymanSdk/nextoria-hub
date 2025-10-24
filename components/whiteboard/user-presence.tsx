"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOthers } from "@/liveblocks.config";

export function UserPresence() {
  const others = useOthers();

  const activeUsers = useMemo(() => {
    // Generate a color for each user based on their ID
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-orange-500",
    ];

    return others.map((other, index) => ({
      id: other.id,
      name: other.presence?.username || other.info?.name || "Anonymous",
      avatar: other.info?.avatar,
      color: colors[index % colors.length],
    }));
  }, [others]);

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-muted-foreground mr-1'>
        {activeUsers.length + 1} {activeUsers.length + 1 === 1 ? "user" : "users"}
      </span>
      <div className='flex -space-x-2'>
        {activeUsers.slice(0, 5).map((user) => (
          <div key={user.id} className='relative group' title={user.name}>
            <Avatar className={`h-8 w-8 border-2 border-background`}>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className={user.color}>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Tooltip */}
            <div className='absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-50'>
              <div className='bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap shadow-md border'>
                {user.name}
              </div>
            </div>
          </div>
        ))}
        {activeUsers.length > 5 && (
          <div className='h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center'>
            <span className='text-xs font-medium'>+{activeUsers.length - 5}</span>
          </div>
        )}
      </div>
    </div>
  );
}
