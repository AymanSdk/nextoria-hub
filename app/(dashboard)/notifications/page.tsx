import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Notifications</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Stay updated with the latest activities
          </p>
        </div>
        <Button variant='outline'>Mark all as read</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-12 text-neutral-500'>
            <Bell className='h-12 w-12 mb-4 text-neutral-400' />
            <p className='text-center'>No notifications yet</p>
            <p className='text-sm text-center mt-2'>
              You'll see notifications here when there's activity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
