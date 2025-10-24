import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import {
  projects,
  tasks,
  users,
  invoices,
  campaigns,
  expenses,
  workspaceMembers,
} from "@/src/db/schema";
import { eq, count, and, sql, gte, desc } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FolderKanban,
  CheckCircle2,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  Target,
  Receipt,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  Zap,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/src/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskDistributionChart } from "@/components/dashboard/task-distribution-chart";
import { ProjectStatusChart } from "@/components/dashboard/project-status-chart";
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { LiveClock } from "@/components/dashboard/live-clock";
import { getRecentActivities } from "@/src/lib/notifications/activity-logger";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Redirect clients to their dedicated portal
  if (session.user.role === "CLIENT") {
    redirect("/client-portal");
  }

  const userIsAdmin = isAdmin(session.user.role);

  // Date ranges for trends
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Fetch comprehensive statistics
  const [projectsCount] = await db.select({ count: count() }).from(projects);
  const [activeProjectsCount] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "ACTIVE"));

  const [tasksCount] = await db.select({ count: count() }).from(tasks);
  const [completedTasksCount] = await db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.status, "DONE"));

  const [inProgressTasksCount] = await db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.status, "IN_PROGRESS"));

  const [blockedTasksCount] = await db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.status, "BLOCKED"));

  const [todoTasksCount] = await db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.status, "TODO"));

  const [teamCount] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.isActive, true));

  // Client count (users with CLIENT role)
  const [clientCount] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.role, "CLIENT"), eq(users.isActive, true)));

  // Revenue statistics
  const totalRevenue = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
    .from(invoices)
    .where(eq(invoices.status, "PAID"));

  const pendingRevenue = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
    .from(invoices)
    .where(eq(invoices.status, "SENT"));

  // Current month revenue
  const currentMonthRevenue = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
    .from(invoices)
    .where(and(eq(invoices.status, "PAID"), gte(invoices.paidAt, thirtyDaysAgo)));

  // Previous month revenue
  const previousMonthRevenue = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
    .from(invoices)
    .where(
      and(
        eq(invoices.status, "PAID"),
        gte(invoices.paidAt, sixtyDaysAgo),
        sql`${invoices.paidAt} < ${thirtyDaysAgo}`
      )
    );

  // Revenue growth calculation
  const currentRev = currentMonthRevenue[0]?.total || 0;
  const previousRev = previousMonthRevenue[0]?.total || 0;
  const revenueGrowth =
    previousRev > 0 ? ((currentRev - previousRev) / previousRev) * 100 : 0;

  // Campaign stats
  const [campaignsCount] = await db.select({ count: count() }).from(campaigns);
  const [activeCampaignsCount] = await db
    .select({ count: count() })
    .from(campaigns)
    .where(eq(campaigns.status, "ACTIVE"));

  // Expense stats
  const totalExpenses = await db
    .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
    .from(expenses)
    .where(eq(expenses.status, "APPROVED"));

  const pendingExpenses = await db
    .select({ count: count() })
    .from(expenses)
    .where(eq(expenses.status, "SUBMITTED"));

  // Team utilization (tasks per team member)
  const teamUtilization = await db
    .select({
      userId: tasks.assigneeId,
      taskCount: count(),
    })
    .from(tasks)
    .where(eq(tasks.status, "IN_PROGRESS"))
    .groupBy(tasks.assigneeId);

  // Recent projects
  const recentProjects = await db
    .select()
    .from(projects)
    .limit(5)
    .orderBy(desc(projects.createdAt));

  // Get user's workspace for activity feed
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))
    .limit(1);

  // Fetch recent activities
  const recentActivities = membership
    ? await getRecentActivities({
        workspaceId: membership.workspaceId,
        userId: userIsAdmin ? undefined : session.user.id,
        limit: 10,
      })
    : [];

  const avgUtilization =
    teamUtilization.length > 0
      ? Math.round(
          teamUtilization.reduce((acc, t) => acc + t.taskCount, 0) /
            teamUtilization.length
        )
      : 0;

  // Project status breakdown for chart
  const [completedProjectsCount] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "COMPLETED"));

  const [onHoldProjectsCount] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "ON_HOLD"));

  // Revenue by month (last 6 months)
  const revenueByMonth = await db
    .select({
      month: sql<string>`TO_CHAR(${invoices.paidAt}, 'Mon')`,
      total: sql<number>`COALESCE(SUM(${invoices.total}), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.status, "PAID"),
        gte(invoices.paidAt, new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000))
      )
    )
    .groupBy(sql`TO_CHAR(${invoices.paidAt}, 'Mon')`);

  // Task completion rate
  const taskCompletionRate =
    tasksCount.count > 0
      ? Math.round((completedTasksCount.count / tasksCount.count) * 100)
      : 0;

  // Prepare chart data
  const taskDistributionData = [
    { name: "Completed", value: completedTasksCount.count, fill: "hsl(var(--chart-1))" },
    {
      name: "In Progress",
      value: inProgressTasksCount.count,
      fill: "hsl(var(--chart-2))",
    },
    { name: "To Do", value: todoTasksCount.count, fill: "hsl(var(--chart-4))" },
    { name: "Blocked", value: blockedTasksCount.count, fill: "hsl(var(--chart-3))" },
  ];

  const projectStatusData = [
    { name: "Active", value: activeProjectsCount.count, fill: "hsl(var(--chart-2))" },
    {
      name: "Completed",
      value: completedProjectsCount.count,
      fill: "hsl(var(--chart-1))",
    },
    { name: "On Hold", value: onHoldProjectsCount.count, fill: "hsl(var(--chart-4))" },
  ];

  const revenueChartData = revenueByMonth.map((item) => ({
    month: item.month || "N/A",
    revenue: (item.total || 0) / 100,
  }));

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Welcome back, {session.user.name}!
          </h1>
          <p className='text-muted-foreground mt-2'>
            {userIsAdmin
              ? "Here's your complete agency overview"
              : "Here's what's happening with your work today"}
          </p>
        </div>
        <LiveClock />
      </div>

      {/* Primary Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Projects</CardTitle>
            <FolderKanban className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{projectsCount.count}</div>
            <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1'>
              <Badge variant='secondary' className='text-xs'>
                {activeProjectsCount.count} active
              </Badge>
            </p>
            <Progress
              value={(activeProjectsCount.count / (projectsCount.count || 1)) * 100}
              className='mt-2 h-1'
            />
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tasks Overview</CardTitle>
            <CheckCircle2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{tasksCount.count}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              {taskCompletionRate}% completion rate
            </p>
            <Progress value={taskCompletionRate} className='mt-2 h-1' />
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Monthly Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(currentRev / 100).toLocaleString()}
            </div>
            <p className='text-xs mt-1 flex items-center gap-1'>
              {revenueGrowth >= 0 ? (
                <ArrowUpRight className='h-3 w-3 text-green-500' />
              ) : (
                <ArrowDownRight className='h-3 w-3 text-red-500' />
              )}
              <span className={revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
              <span className='text-muted-foreground'>vs last month</span>
            </p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Team & Clients</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{teamCount.count}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Team members • {clientCount.count} clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Zap className='h-5 w-5' />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-4'>
            <Link href='/projects/new'>
              <Button variant='outline' className='w-full justify-start'>
                <Plus className='h-4 w-4 mr-2' />
                Create Project
              </Button>
            </Link>
            <Link href='/invoices'>
              <Button variant='outline' className='w-full justify-start'>
                <FileText className='h-4 w-4 mr-2' />
                New Invoice
              </Button>
            </Link>
            <Link href='/team'>
              <Button variant='outline' className='w-full justify-start'>
                <Users className='h-4 w-4 mr-2' />
                Manage Team
              </Button>
            </Link>
            <Link href='/analytics'>
              <Button variant='outline' className='w-full justify-start'>
                <BarChart3 className='h-4 w-4 mr-2' />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Task Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Overview of all tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskDistributionChart data={taskDistributionData} />
          </CardContent>
        </Card>

        {/* Project Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Current project distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectStatusChart data={projectStatusData} />
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart - Admin Only */}
      {userIsAdmin && revenueChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={revenueChartData} />
          </CardContent>
        </Card>
      )}

      {/* Secondary Statistics - Admin Only */}
      {userIsAdmin && (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ${((totalRevenue[0]?.total || 0) / 100).toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                ${((pendingRevenue[0]?.total || 0) / 100).toLocaleString()} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Campaigns</CardTitle>
              <Target className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{campaignsCount.count}</div>
              <p className='text-xs text-muted-foreground mt-1'>
                <Badge variant='secondary'>{activeCampaignsCount.count} active</Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Expenses</CardTitle>
              <Receipt className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ${((totalExpenses[0]?.total || 0) / 100).toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                {pendingExpenses[0].count} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Team Utilization</CardTitle>
              <Activity className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{avgUtilization}</div>
              <p className='text-xs text-muted-foreground mt-1'>Avg tasks per member</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {blockedTasksCount.count > 0 && (
        <Card className='border-destructive/50 bg-destructive/5'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-destructive'>
              <AlertCircle className='h-5 w-5' />
              Attention Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm'>
              You have {blockedTasksCount.count} blocked task
              {blockedTasksCount.count > 1 ? "s" : ""} that need attention.{" "}
              <Link
                href='/tasks?status=BLOCKED'
                className='underline font-medium hover:text-primary'
              >
                View blocked tasks
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Projects and Activity */}
      <div className='grid gap-6 md:grid-cols-2'>
        <Card className='border-border/60 shadow-lg overflow-visible bg-card/50 backdrop-blur-xl'>
          <CardHeader className='pb-3 pt-5'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <div className='h-12 w-12 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center border border-primary/20 shadow-sm'>
                    <FolderKanban className='h-5 w-5 text-primary' />
                  </div>
                  <div className='absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background animate-pulse' />
                </div>
                <div>
                  <h3 className='font-semibold text-base text-foreground tracking-tight'>
                    Recent Projects
                  </h3>
                  <p className='text-xs text-muted-foreground/80 mt-0.5'>
                    Your latest project updates
                  </p>
                </div>
              </div>
              <Link href='/projects'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all h-8 text-xs font-medium px-3'
                >
                  View All
                  <ArrowUpRight className='h-3.5 w-3.5 ml-1' />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className='p-3'>
            <div className='rounded-xl border border-primary/10 bg-linear-to-br from-primary/5 to-muted/30 backdrop-blur-sm shadow-inner overflow-hidden h-[420px]'>
              {recentProjects.length > 0 ? (
                <ScrollArea className='h-full w-full'>
                  <div className='space-y-2.5 p-4'>
                    {recentProjects.slice(0, 5).map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.slug}`}
                        className='flex items-center justify-between p-3.5 rounded-lg transition-all duration-200 relative group bg-linear-to-r from-primary/5 via-card/50 to-card/50 hover:from-primary/10 hover:bg-card cursor-pointer border border-primary/10 hover:border-primary/20 hover:shadow-md'
                      >
                        <div className='flex items-center gap-3.5 min-w-0 flex-1'>
                          <div
                            className='h-11 w-11 shrink-0 rounded-lg flex items-center justify-center shadow-sm'
                            style={{
                              backgroundColor: project.color || "hsl(var(--primary))",
                            }}
                          >
                            <FolderKanban className='h-5 w-5 text-white' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='font-semibold text-sm group-hover:text-primary transition-colors truncate'>
                              {project.name}
                            </p>
                            <p className='text-xs text-muted-foreground line-clamp-1 mt-0.5'>
                              {project.description?.substring(0, 60)}
                              {project.description && project.description.length > 60
                                ? "..."
                                : ""}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={project.status === "ACTIVE" ? "default" : "secondary"}
                          className='shrink-0 ml-2'
                        >
                          {project.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className='h-full flex items-center justify-center p-4'>
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant='icon'>
                        <FolderKanban />
                      </EmptyMedia>
                      <EmptyTitle>No projects yet</EmptyTitle>
                      <EmptyDescription>
                        Get started by creating your first project to organize your work
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Link href='/projects/new'>
                        <Button>
                          <Plus className='h-4 w-4 mr-2' />
                          Create Your First Project
                        </Button>
                      </Link>
                    </EmptyContent>
                  </Empty>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='border-border/60 shadow-lg overflow-visible bg-card/50 backdrop-blur-xl'>
          <CardHeader className='pb-3 pt-5'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <div className='h-12 w-12 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center border border-primary/20 shadow-sm'>
                    <Activity className='h-5 w-5 text-primary' />
                  </div>
                  <div className='absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background animate-pulse' />
                </div>
                <div>
                  <h3 className='font-semibold text-base text-foreground tracking-tight'>
                    Recent Activity
                  </h3>
                  <p className='text-xs text-muted-foreground/80 mt-0.5'>
                    Latest workspace updates
                  </p>
                </div>
              </div>
              <Link href='/notifications'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all h-8 text-xs font-medium px-3'
                >
                  View All
                  <ArrowUpRight className='h-3.5 w-3.5 ml-1' />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className='p-3'>
            <div className='rounded-xl border border-primary/10 bg-linear-to-br from-primary/5 to-muted/30 p-4 backdrop-blur-sm shadow-inner overflow-hidden h-[420px]'>
              <ActivityFeed activities={recentActivities} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
