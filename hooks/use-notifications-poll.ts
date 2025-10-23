"use client";

import { useState, useEffect } from "react";

/**
 * Hook to poll for unread notification count
 * Polls every 60 seconds
 */
export function useNotificationsPoll() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Poll every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, []);

  return { unreadCount, loading };
}
