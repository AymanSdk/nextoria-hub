import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  FileText,
  Users,
  DollarSign,
  FolderKanban,
  Upload,
  Receipt,
  Target,
  Activity,
} from "lucide-react";
import Link from "next/link";

interface ActivityFeedProps {
  activities: Array<{
    id: string;
    activityType: string;
    entityType: string | null;
    entityId: string | null;
    title: string;
    description: string | null;
    createdAt: Date;
    metadata: string | null;
    userId: string | null;
    workspaceId: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    } | null;
  }>;
}

function getActivityIcon(activityType: string, entityType: string | null) {
  if (activityType.includes("TASK") || entityType === "task") {
    return <CheckCircle2 className='h-4 w-4 text-blue-500' />;
  }
  if (activityType.includes("PROJECT") || entityType === "project") {
    return <FolderKanban className='h-4 w-4 text-purple-500' />;
  }
  if (activityType.includes("INVOICE") || entityType === "invoice") {
    return <DollarSign className='h-4 w-4 text-green-500' />;
  }
  if (activityType.includes("FILE") || entityType === "file") {
    return <Upload className='h-4 w-4 text-orange-500' />;
  }
  if (activityType.includes("MEMBER") || activityType.includes("TEAM")) {
    return <Users className='h-4 w-4 text-indigo-500' />;
  }
  if (activityType.includes("EXPENSE") || entityType === "expense") {
    return <Receipt className='h-4 w-4 text-pink-500' />;
  }
  if (activityType.includes("CAMPAIGN") || entityType === "campaign") {
    return <Target className='h-4 w-4 text-cyan-500' />;
  }
  return <Activity className='h-4 w-4 text-gray-500' />;
}

function getActivityUrl(
  entityType: string | null,
  entityId: string | null
): string | null {
  if (!entityType || !entityId) return null;

  switch (entityType) {
    case "task":
      return `/tasks/${entityId}`;
    case "project":
      return `/projects/${entityId}`;
    case "invoice":
      return `/invoices/${entityId}`;
    case "expense":
      return `/expenses`;
    case "campaign":
      return `/campaigns`;
    case "workspace":
      return `/team`;
    default:
      return null;
  }
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <Activity className='h-12 w-12 text-muted-foreground mb-3' />
        <p className='text-muted-foreground'>No recent activity</p>
        <p className='text-sm text-muted-foreground mt-1'>
          Activity will appear here as your team works
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {activities.map((activity) => {
        const url = getActivityUrl(activity.entityType, activity.entityId);
        const ActivityWrapper = url ? Link : "div";
        const wrapperProps = url ? { href: url } : {};

        return (
          <ActivityWrapper
            key={activity.id}
            {...wrapperProps}
            className={`flex gap-3 ${
              url
                ? "hover:bg-accent/50 -mx-2 px-2 py-2 rounded-md transition-colors cursor-pointer"
                : ""
            }`}
          >
            <div className='flex-shrink-0 mt-1'>
              {activity.user?.avatarUrl ? (
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={activity.user.avatarUrl} />
                  <AvatarFallback>
                    {activity.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : activity.user ? (
                <Avatar className='h-8 w-8'>
                  <AvatarFallback>
                    {activity.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className='h-8 w-8 rounded-full bg-muted flex items-center justify-center'>
                  {getActivityIcon(activity.activityType, activity.entityType)}
                </div>
              )}
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between gap-2'>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm'>
                    {activity.user && (
                      <span className='font-medium'>{activity.user.name} </span>
                    )}
                    <span className='text-muted-foreground'>{activity.title}</span>
                  </p>
                  {activity.description && (
                    <p className='text-sm text-muted-foreground mt-0.5'>
                      {activity.description}
                    </p>
                  )}
                </div>
                <div className='flex-shrink-0'>
                  {getActivityIcon(activity.activityType, activity.entityType)}
                </div>
              </div>

              <time className='text-xs text-muted-foreground mt-1 block'>
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </time>
            </div>
          </ActivityWrapper>
        );
      })}
    </div>
  );
}
