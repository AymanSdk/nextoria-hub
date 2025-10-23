"use client";

import * as React from "react";
import { useState } from "react";
import {
  Bell,
  FolderKanban,
  CheckSquare,
  Users,
  AlertCircle,
  Mail,
  Smartphone,
} from "lucide-react";
import { SettingsCard } from "./settings-card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  settings: {
    id: string;
    label: string;
    description: string;
    enabled: boolean;
  }[];
}

const defaultCategories: NotificationCategory[] = [
  {
    id: "projects",
    title: "Projects",
    description: "Get notified about project updates",
    icon: FolderKanban,
    settings: [
      {
        id: "project_created",
        label: "New project created",
        description: "When a new project is created in your workspace",
        enabled: true,
      },
      {
        id: "project_updated",
        label: "Project updates",
        description: "When a project you're involved in is updated",
        enabled: true,
      },
      {
        id: "project_completed",
        label: "Project completed",
        description: "When a project is marked as completed",
        enabled: true,
      },
    ],
  },
  {
    id: "tasks",
    title: "Tasks",
    description: "Stay updated on your tasks",
    icon: CheckSquare,
    settings: [
      {
        id: "task_assigned",
        label: "Task assigned to you",
        description: "When you're assigned a new task",
        enabled: true,
      },
      {
        id: "task_due_soon",
        label: "Task due soon",
        description: "Reminder when a task is approaching its due date",
        enabled: true,
      },
      {
        id: "task_completed",
        label: "Task completed",
        description: "When a task you created is completed",
        enabled: false,
      },
    ],
  },
  {
    id: "team",
    title: "Team",
    description: "Team activity and mentions",
    icon: Users,
    settings: [
      {
        id: "team_mentions",
        label: "Mentions",
        description: "When someone mentions you in a comment or message",
        enabled: true,
      },
      {
        id: "team_invites",
        label: "Team invitations",
        description: "When you're invited to join a team or project",
        enabled: true,
      },
      {
        id: "team_updates",
        label: "Team updates",
        description: "Important team announcements and updates",
        enabled: true,
      },
    ],
  },
  {
    id: "system",
    title: "System",
    description: "Important system notifications",
    icon: AlertCircle,
    settings: [
      {
        id: "system_security",
        label: "Security alerts",
        description: "Suspicious activity or security updates",
        enabled: true,
      },
      {
        id: "system_updates",
        label: "Product updates",
        description: "New features and product announcements",
        enabled: false,
      },
    ],
  },
];

export function NotificationsSection() {
  const [categories, setCategories] = useState(defaultCategories);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (categoryId: string, settingId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              settings: category.settings.map((setting) =>
                setting.id === settingId
                  ? { ...setting, enabled: !setting.enabled }
                  : setting
              ),
            }
          : category
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Delivery Methods */}
      <SettingsCard
        title='Delivery Methods'
        description='Choose how you want to receive notifications'
        icon={Bell}
      >
        <div className='space-y-4'>
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'>
                <Mail className='h-4 w-4 text-primary' />
              </div>
              <div className='space-y-0.5'>
                <Label htmlFor='email-notifications' className='text-sm font-medium'>
                  Email Notifications
                </Label>
                <p className='text-xs text-muted-foreground'>
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              id='email-notifications'
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <Separator />

          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'>
                <Smartphone className='h-4 w-4 text-primary' />
              </div>
              <div className='space-y-0.5'>
                <Label htmlFor='inapp-notifications' className='text-sm font-medium'>
                  In-App Notifications
                </Label>
                <p className='text-xs text-muted-foreground'>
                  Show notifications within the application
                </p>
              </div>
            </div>
            <Switch
              id='inapp-notifications'
              checked={inAppNotifications}
              onCheckedChange={setInAppNotifications}
            />
          </div>
        </div>
      </SettingsCard>

      {/* Notification Categories */}
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <SettingsCard
            key={category.id}
            title={category.title}
            description={category.description}
            icon={Icon}
          >
            <div className='space-y-4'>
              {category.settings.map((setting, index) => (
                <React.Fragment key={setting.id}>
                  <div className='flex items-start justify-between py-2'>
                    <div className='space-y-0.5 flex-1 pr-4'>
                      <Label
                        htmlFor={setting.id}
                        className='text-sm font-medium cursor-pointer'
                      >
                        {setting.label}
                      </Label>
                      <p className='text-xs text-muted-foreground'>
                        {setting.description}
                      </p>
                    </div>
                    <Switch
                      id={setting.id}
                      checked={setting.enabled}
                      onCheckedChange={() => handleToggle(category.id, setting.id)}
                    />
                  </div>
                  {index < category.settings.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          </SettingsCard>
        );
      })}

      {/* Save Button */}
      <div className='flex justify-end pt-2'>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size='lg'
          className='min-w-[160px]'
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
