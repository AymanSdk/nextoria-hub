import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";

export default async function NotificationSettingsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage how you receive notifications
        </p>
      </div>

      <NotificationPreferencesForm />
    </div>
  );
}

