"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useProjectRequestStats() {
  const { data: session } = useSession();
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch stats for non-client users
    if (!session?.user || session.user.role === "CLIENT") {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/project-requests/stats");
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.pendingCount || 0);
        }
      } catch (error) {
        console.error("Error fetching project request stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [session]);

  return { pendingCount, isLoading };
}
