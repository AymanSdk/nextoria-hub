import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  Users,
  DollarSign,
  FolderKanban,
  Upload,
  Receipt,
  Target,
  Activity,
  Sparkles,
  Clock,
  Dot,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const iconConfig = {
    icon: Activity,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
  };

  if (activityType.includes("TASK") || entityType === "task") {
    return {
      icon: CheckCircle2,
      color: "hsl(var(--chart-2))",
      bg: "bg-[hsl(var(--chart-2))]/10",
    };
  }
  if (activityType.includes("PROJECT") || entityType === "project") {
    return {
      icon: FolderKanban,
      color: "hsl(var(--chart-1))",
      bg: "bg-[hsl(var(--chart-1))]/10",
    };
  }
  if (activityType.includes("INVOICE") || entityType === "invoice") {
    return {
      icon: DollarSign,
      color: "hsl(var(--chart-5))",
      bg: "bg-[hsl(var(--chart-5))]/10",
    };
  }
  if (activityType.includes("FILE") || entityType === "file") {
    return {
      icon: Upload,
      color: "hsl(var(--chart-4))",
      bg: "bg-[hsl(var(--chart-4))]/10",
    };
  }
  if (activityType.includes("MEMBER") || activityType.includes("TEAM")) {
    return {
      icon: Users,
      color: "hsl(var(--chart-2))",
      bg: "bg-[hsl(var(--chart-2))]/10",
    };
  }
  if (activityType.includes("EXPENSE") || entityType === "expense") {
    return {
      icon: Receipt,
      color: "hsl(var(--chart-3))",
      bg: "bg-[hsl(var(--chart-3))]/10",
    };
  }
  if (activityType.includes("CAMPAIGN") || entityType === "campaign") {
    return {
      icon: Target,
      color: "hsl(var(--chart-4))",
      bg: "bg-[hsl(var(--chart-4))]/10",
    };
  }
  return iconConfig;
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

function getActivityBadge(
  activityType: string
): { label: string; className: string } | null {
  if (activityType.includes("CREATED")) {
    return {
      label: "New",
      className: "bg-primary/10 text-primary border-primary/20",
    };
  }
  if (activityType.includes("COMPLETED") || activityType.includes("APPROVED")) {
    return {
      label: "Done",
      className:
        "bg-[hsl(var(--chart-5))]/10 text-[hsl(var(--chart-5))] border-[hsl(var(--chart-5))]/20",
    };
  }
  if (activityType.includes("UPDATED")) {
    return {
      label: "Updated",
      className: "bg-muted text-muted-foreground border-border",
    };
  }
  return null;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className='h-full flex flex-col items-center justify-center text-center'>
        <div className='relative mb-5'>
          <div className='h-14 w-14 rounded-2xl bg-muted/80 flex items-center justify-center border border-border/60'>
            <Sparkles className='h-6 w-6 text-muted-foreground' />
          </div>
        </div>
        <h3 className='font-medium text-sm text-foreground mb-1'>All caught up</h3>
        <p className='text-xs text-muted-foreground/70 max-w-[280px] leading-relaxed'>
          No recent activity. Updates will appear as your team collaborates.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className='h-full w-full'>
      <div className='space-y-2.5'>
        {activities.map((activity) => {
          const url = getActivityUrl(activity.entityType, activity.entityId);
          const badge = getActivityBadge(activity.activityType);
          const iconConfig = getActivityIcon(activity.activityType, activity.entityType);
          const Icon = iconConfig.icon;

          const content = (
            <>
              {/* Avatar or Icon */}
              <div className='shrink-0 relative'>
                {activity.user ? (
                  <div className='relative'>
                    <Avatar className='h-10 w-10 ring-2 ring-card shadow-sm'>
                      <AvatarImage src={activity.user.avatarUrl || undefined} />
                      <AvatarFallback className='text-[10px] bg-muted text-muted-foreground font-medium'>
                        {activity.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Activity type indicator */}
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-[19px] w-[19px] rounded-full flex items-center justify-center ring-2 ring-card shadow-sm",
                        iconConfig.bg
                      )}
                      style={{ color: iconConfig.color }}
                    >
                      <Icon className='h-2.5 w-2.5' style={{ color: iconConfig.color }} />
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center ring-2 ring-card shadow-sm",
                      iconConfig.bg
                    )}
                  >
                    <Icon className='h-4.5 w-4.5' style={{ color: iconConfig.color }} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2 mb-1'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm leading-relaxed text-foreground/90'>
                      {activity.user && (
                        <span className='font-semibold text-foreground'>
                          {activity.user.name}{" "}
                        </span>
                      )}
                      <span className='text-muted-foreground/90'>{activity.title}</span>
                    </p>
                  </div>
                  {badge && (
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 border",
                        badge.className
                      )}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>

                {activity.description && (
                  <p className='text-xs text-muted-foreground/70 line-clamp-1 mb-1.5 leading-relaxed'>
                    {activity.description}
                  </p>
                )}

                <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground/60'>
                  <Clock className='h-3.5 w-3.5' />
                  <time>
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                  {url && (
                    <>
                      <Dot className='h-3 w-3 opacity-50' />
                      <span className='text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium'>
                        View
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          );

          return (
            <div key={activity.id}>
              {url ? (
                <Link
                  href={url}
                  className={cn(
                    "flex gap-3.5 p-3.5 rounded-lg transition-all duration-200 relative group",
                    "bg-linear-to-r from-primary/5 via-card/50 to-card/50",
                    "hover:from-primary/10 hover:bg-card cursor-pointer",
                    "border border-primary/10 hover:border-primary/20 hover:shadow-md"
                  )}
                >
                  {content}
                </Link>
              ) : (
                <div
                  className={cn(
                    "flex gap-3.5 p-3.5 rounded-lg",
                    "bg-linear-to-r from-primary/3 via-card/30 to-card/30",
                    "border border-primary/5"
                  )}
                >
                  {content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
