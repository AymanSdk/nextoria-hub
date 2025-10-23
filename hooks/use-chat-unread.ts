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
        if (!response.ok) {
          // Silently handle errors (e.g., 404, 500)
          return;
        }

        const channels = await response.json();

        // Ensure channels is an array before reducing
        if (!Array.isArray(channels)) {
          return;
        }

        const total = channels.reduce((sum: number, channel: any) => {
          return sum + (channel.unreadCount || 0);
        }, 0);

        setUnreadCount(total);
      } catch (error) {
        // Silently handle fetch errors to prevent console spam
        // The hook will retry on the next poll interval
      }
    };

    fetchUnreadCount();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [session, workspaceId]);

  return unreadCount;
}
