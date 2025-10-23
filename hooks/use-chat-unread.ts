"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useChatUnread(workspaceId?: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user || !workspaceId) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`/api/chat/channels?workspaceId=${workspaceId}`);
        if (!response.ok) return;

        const channels = await response.json();
        const total = channels.reduce((sum: number, channel: any) => {
          return sum + (channel.unreadCount || 0);
        }, 0);

        setUnreadCount(total);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [session, workspaceId]);

  return unreadCount;
}
