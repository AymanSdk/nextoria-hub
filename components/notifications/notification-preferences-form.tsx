"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NotificationPreferences {
  emailEnabled: boolean;
  emailTaskAssigned: boolean;
  emailTaskCommented: boolean;
  emailTaskStatusChanged: boolean;
  emailTaskDueSoon: boolean;
  emailProjectInvitation: boolean;
  emailProjectUpdates: boolean;
  emailInvoices: boolean;
  emailFileShared: boolean;
  emailApprovals: boolean;
  emailMentions: boolean;
  inAppEnabled: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
}

export function NotificationPreferencesForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    emailTaskAssigned: true,
    emailTaskCommented: true,
    emailTaskStatusChanged: false,
    emailTaskDueSoon: true,
    emailProjectInvitation: true,
    emailProjectUpdates: true,
    emailInvoices: true,
    emailFileShared: true,
    emailApprovals: true,
    emailMentions: true,
    inAppEnabled: true,
    dailyDigest: false,
    weeklyDigest: false,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/notifications/preferences");
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        toast.success("Notification preferences saved");
      } else {
        toast.error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
          <CardDescription>
            Control notifications you see within the application
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='inAppEnabled' className='flex-1'>
              Enable in-app notifications
            </Label>
            <Switch
              id='inAppEnabled'
              checked={preferences.inAppEnabled}
              onCheckedChange={(checked) => updatePreference("inAppEnabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Control what email notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='emailEnabled' className='flex-1 font-semibold'>
              Enable all email notifications
            </Label>
            <Switch
              id='emailEnabled'
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) => updatePreference("emailEnabled", checked)}
            />
          </div>

          <Separator />

          <div
            className='space-y-3 opacity-100'
            style={{ opacity: preferences.emailEnabled ? 1 : 0.5 }}
          >
            <p className='text-sm font-medium'>Tasks</p>
            <div className='space-y-3 pl-4'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='emailTaskAssigned' className='flex-1 text-sm font-normal'>
                  Task assigned to me
                </Label>
                <Switch
                  id='emailTaskAssigned'
                  checked={preferences.emailTaskAssigned}
                  onCheckedChange={(checked) =>
                    updatePreference("emailTaskAssigned", checked)
                  }
                  disabled={!preferences.emailEnabled}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='emailTaskCommented'
                  className='flex-1 text-sm font-normal'
                >
                  Comments on my tasks
                </Label>
                <Switch
                  id='emailTaskCommented'
                  checked={preferences.emailTaskCommented}
                  onCheckedChange={(checked) =>
                    updatePreference("emailTaskCommented", checked)
                  }
                  disabled={!preferences.emailEnabled}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='emailTaskStatusChanged'
                  className='flex-1 text-sm font-normal'
                >
                  Task status changes
                </Label>
                <Switch
                  id='emailTaskStatusChanged'
                  checked={preferences.emailTaskStatusChanged}
                  onCheckedChange={(checked) =>
                    updatePreference("emailTaskStatusChanged", checked)
                  }
                  disabled={!preferences.emailEnabled}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='emailTaskDueSoon' className='flex-1 text-sm font-normal'>
                  Tasks due soon
                </Label>
                <Switch
                  id='emailTaskDueSoon'
                  checked={preferences.emailTaskDueSoon}
                  onCheckedChange={(checked) =>
                    updatePreference("emailTaskDueSoon", checked)
                  }
                  disabled={!preferences.emailEnabled}
                />
              </div>
            </div>

            <Separator />

            <p className='text-sm font-medium'>Projects</p>
            <div className='space-y-3 pl-4'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='emailProjectInvitation'
                  className='flex-1 text-sm font-normal'
                >
                  Project invitations
                </Label>
                <Switch
                  id='emailProjectInvitation'
                  checked={preferences.emailProjectInvitation}
                  onCheckedChange={(checked) =>
                    updatePreference("emailProjectInvitation", checked)
                  }
                  disabled={!preferences.emailEnabled}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='emailProjectUpdates'
                  className='flex-1 text-sm font-normal'
                >
                  Project updates and status changes
                </Label>
                <Switch
                  id='emailProjectUpdates'
                  checked={preferences.emailProjectUpdates}
                  onCheckedChange={(checked) =>
                    updatePreference("emailProjectUpdates", checked)
                  }
                  disabled={!preferences.emailEnabled}
                />
              </div>
            </div>

            <Separator />

            <p className='text-sm font-medium'>Other</p>
            <div className='space-y-3 pl-4'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='emailInvoices' className='flex-1 text-sm font-normal'>
                  Invoices and payments
                </Label>
                <Switch
                  id='emailInvoices'
                  checked={preferences.emailInvoices}
                  onCheckedChange={(checked) =>
                    updatePreference("emailInvoices", checked)
                  }
                  disabled={!preferences.emailEnabled}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='emailFileShared' className='flex-1 text-sm font-normal'>
                  Files shared with me
                </Label>
                <Switch
                  id='emailFileShared'
                  checked={preferences.emailFileShared}
                  onCheckedChange={(checked) =>
                    updatePreference("emailFileShared", checked)
                  }
                  disabled={!preferences.emailEnabled}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='emailApprovals' className='flex-1 text-sm font-normal'>
                  Approval requests
                </Label>
                <Switch
                  id='emailApprovals'
                  checked={preferences.emailApprovals}
                  onCheckedChange={(checked) =>
                    updatePreference("emailApprovals", checked)
                  }
                  disabled={!preferences.emailEnabled}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='emailMentions' className='flex-1 text-sm font-normal'>
                  Mentions and messages
                </Label>
                <Switch
                  id='emailMentions'
                  checked={preferences.emailMentions}
                  onCheckedChange={(checked) =>
                    updatePreference("emailMentions", checked)
                  }
                  disabled={!preferences.emailEnabled}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Digest Emails</CardTitle>
          <CardDescription>
            Receive summary emails instead of individual notifications
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='dailyDigest' className='flex-1'>
              Daily digest (sent at 8:00 AM)
            </Label>
            <Switch
              id='dailyDigest'
              checked={preferences.dailyDigest}
              onCheckedChange={(checked) => updatePreference("dailyDigest", checked)}
            />
          </div>
          <div className='flex items-center justify-between'>
            <Label htmlFor='weeklyDigest' className='flex-1'>
              Weekly digest (sent Monday at 8:00 AM)
            </Label>
            <Switch
              id='weeklyDigest'
              checked={preferences.weeklyDigest}
              onCheckedChange={(checked) => updatePreference("weeklyDigest", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
