"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function TestNotificationsButton() {
  const [loading, setLoading] = useState(false);

  const createTestNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          `Created ${data.notifications} test notifications and ${data.activities} test activities!`
        );
        // Refresh the page to show new notifications
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(data.error || "Failed to create test notifications");
      }
    } catch (error) {
      toast.error("Failed to create test notifications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={createTestNotifications} disabled={loading} variant='outline'>
      {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
      Create Test Notifications
    </Button>
  );
}
