import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import {
  projects,
  tasks,
  users,
  invoices,
  campaigns,
  expenses,
  taskActivity,
} from "@/src/db/schema";
import { eq, count, and, sql, gte, lte } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  Target,
  Users as UsersIcon,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/src/lib/auth/rbac";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default async function AnalyticsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only admins and certain roles can view analytics
  if (!["ADMIN", "MARKETER"].includes(session.user.role)) {
    redirect("/");
  }

  // Date ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Project Analytics
  const [totalProjects] = await db.select({ count: count() }).from(projects);
  const [activeProjects] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "ACTIVE"));
  const [completedProjects] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "COMPLETED"));

  // Task Analytics
  const [totalTasks] = await db.select({ count: count() }).from(tasks);
  const [completedTasks] = await db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.status, "DONE"));
  const [inProgressTasks] = await db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.status, "IN_PROGRESS"));
  const [blockedTasks] = await db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.status, "BLOCKED"));

  // Revenue Analytics
  const totalRevenue = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
    .from(invoices)
    .where(eq(invoices.status, "PAID"));

  const last30DaysRevenue = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
    .from(invoices)
    .where(
      and(eq(invoices.status, "PAID"), gte(invoices.paidAt, thirtyDaysAgo))
    );

  const previous30DaysRevenue = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
    .from(invoices)
    .where(
      and(
        eq(invoices.status, "PAID"),
        gte(invoices.paidAt, sixtyDaysAgo),
        lte(invoices.paidAt, thirtyDaysAgo)
      )
    );

  // Calculate revenue growth
  const currentRevenue = last30DaysRevenue[0]?.total || 0;
  const previousRevenue = previous30DaysRevenue[0]?.total || 0;
  const revenueGrowth =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  // Team Analytics
  const [totalTeam] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.isActive, true));

  // Team productivity (tasks completed per team member)
  const teamProductivity = await db
    .select({
      userId: tasks.assigneeId,
      completedCount: count(),
    })
    .from(tasks)
    .where(and(eq(tasks.status, "DONE"), gte(tasks.completedAt, thirtyDaysAgo)))
    .groupBy(tasks.assigneeId);

  const avgTasksPerMember =
    teamProductivity.length > 0
      ? Math.round(
          teamProductivity.reduce((acc, t) => acc + t.completedCount, 0) /
            teamProductivity.length
        )
      : 0;

  // Campaign Analytics (if user is marketer/admin)
  const [totalCampaigns] = await db.select({ count: count() }).from(campaigns);
  const [activeCampaigns] = await db
    .select({ count: count() })
    .from(campaigns)
    .where(eq(campaigns.status, "ACTIVE"));

  const campaignMetrics = await db
    .select({
      totalReach: sql<number>`COALESCE(SUM(${campaigns.reach}), 0)`,
      totalConversions: sql<number>`COALESCE(SUM(${campaigns.conversions}), 0)`,
      totalSpent: sql<number>`COALESCE(SUM(${campaigns.spentAmount}), 0)`,
    })
    .from(campaigns);

  // Expense Analytics
  const totalExpenses = await db
    .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
    .from(expenses)
    .where(eq(expenses.status, "APPROVED"));

  const last30DaysExpenses = await db
    .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
    .from(expenses)
    .where(
      and(
        eq(expenses.status, "APPROVED"),
        gte(expenses.expenseDate, thirtyDaysAgo)
      )
    );

  // Project completion rate
  const completionRate =
    totalProjects.count > 0
      ? Math.round((completedProjects.count / totalProjects.count) * 100)
      : 0;

  // Task completion rate
  const taskCompletionRate =
    totalTasks.count > 0
      ? Math.round((completedTasks.count / totalTasks.count) * 100)
      : 0;

  // Average project value
  const avgProjectValue =
    totalProjects.count > 0
      ? (totalRevenue[0]?.total || 0) / totalProjects.count
      : 0;

  // Profit margin (revenue - expenses)
  const profitMargin =
    (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Analytics</h1>
        <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
          Comprehensive insights into your agency performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Revenue
            </CardTitle>
            <DollarSign className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(currentRevenue / 100).toLocaleString()}
            </div>
            <div className='flex items-center text-xs mt-1'>
              {revenueGrowth >= 0 ? (
                <TrendingUp className='h-3 w-3 text-green-500 mr-1' />
              ) : (
                <TrendingUp className='h-3 w-3 text-red-500 mr-1 rotate-180' />
              )}
              <span
                className={
                  revenueGrowth >= 0 ? "text-green-500" : "text-red-500"
                }>
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
              <span className='text-neutral-500 ml-1'>vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Profit Margin</CardTitle>
            <TrendingUp className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(profitMargin / 100).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>
              ${((totalExpenses[0]?.total || 0) / 100).toLocaleString()}{" "}
              expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Project Completion
            </CardTitle>
            <CheckCircle className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{completionRate}%</div>
            <p className='text-xs text-neutral-500 mt-1'>
              {completedProjects.count} of {totalProjects.count} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Team Productivity
            </CardTitle>
            <Activity className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{avgTasksPerMember}</div>
            <p className='text-xs text-neutral-500 mt-1'>
              Avg tasks/member (30d)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project & Task Analytics */}
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Overview of project distribution</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-neutral-500'>Active Projects</span>
                <span className='font-medium'>{activeProjects.count}</span>
              </div>
              <Progress
                value={(activeProjects.count / totalProjects.count) * 100}
                className='h-2'
              />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-neutral-500'>Completed Projects</span>
                <span className='font-medium'>{completedProjects.count}</span>
              </div>
              <Progress value={completionRate} className='h-2' />
            </div>

            <div className='pt-4 border-t'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-neutral-500'>
                  Average Project Value
                </span>
                <span className='font-semibold'>
                  ${(avgProjectValue / 100).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Analytics</CardTitle>
            <CardDescription>Task completion and bottlenecks</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div>
                <p className='text-2xl font-bold text-green-600'>
                  {completedTasks.count}
                </p>
                <p className='text-xs text-neutral-500'>Completed</p>
              </div>
              <div>
                <p className='text-2xl font-bold text-blue-600'>
                  {inProgressTasks.count}
                </p>
                <p className='text-xs text-neutral-500'>In Progress</p>
              </div>
              <div>
                <p className='text-2xl font-bold text-red-600'>
                  {blockedTasks.count}
                </p>
                <p className='text-xs text-neutral-500'>Blocked</p>
              </div>
            </div>

            <div className='pt-4 border-t space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-neutral-500'>
                  Completion Rate
                </span>
                <span className='font-semibold'>{taskCompletionRate}%</span>
              </div>
              <Progress value={taskCompletionRate} className='h-2' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Analytics (for Marketers/Admin) */}
      {["ADMIN", "MARKETER"].includes(session.user.role) && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Marketing campaign metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-4'>
              <div className='space-y-2'>
                <p className='text-sm text-neutral-500'>Total Campaigns</p>
                <p className='text-2xl font-bold'>{totalCampaigns.count}</p>
                <Badge>{activeCampaigns.count} active</Badge>
              </div>

              <div className='space-y-2'>
                <p className='text-sm text-neutral-500'>Total Reach</p>
                <p className='text-2xl font-bold'>
                  {(campaignMetrics[0]?.totalReach || 0).toLocaleString()}
                </p>
              </div>

              <div className='space-y-2'>
                <p className='text-sm text-neutral-500'>Conversions</p>
                <p className='text-2xl font-bold'>
                  {(campaignMetrics[0]?.totalConversions || 0).toLocaleString()}
                </p>
              </div>

              <div className='space-y-2'>
                <p className='text-sm text-neutral-500'>Total Spent</p>
                <p className='text-2xl font-bold'>
                  $
                  {(
                    (campaignMetrics[0]?.totalSpent || 0) / 100
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary (Admin only) */}
      {isAdmin(session.user.role) && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Revenue and expense breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-3'>
              <div className='space-y-2 p-4 border rounded-lg'>
                <p className='text-sm text-neutral-500'>Total Revenue</p>
                <p className='text-2xl font-bold text-green-600'>
                  ${((totalRevenue[0]?.total || 0) / 100).toLocaleString()}
                </p>
                <p className='text-xs text-neutral-500'>All time</p>
              </div>

              <div className='space-y-2 p-4 border rounded-lg'>
                <p className='text-sm text-neutral-500'>Total Expenses</p>
                <p className='text-2xl font-bold text-red-600'>
                  ${((totalExpenses[0]?.total || 0) / 100).toLocaleString()}
                </p>
                <p className='text-xs text-neutral-500'>All time</p>
              </div>

              <div className='space-y-2 p-4 border rounded-lg'>
                <p className='text-sm text-neutral-500'>Net Profit</p>
                <p className='text-2xl font-bold text-blue-600'>
                  ${(profitMargin / 100).toLocaleString()}
                </p>
                <p className='text-xs text-neutral-500'>
                  {totalRevenue[0]?.total
                    ? (
                        (profitMargin / (totalRevenue[0]?.total || 1)) *
                        100
                      ).toFixed(1)
                    : 0}
                  % margin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {blockedTasks.count > 0 && (
        <Card className='border-orange-200 dark:border-orange-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-orange-600 dark:text-orange-400'>
              <AlertCircle className='h-5 w-5' />
              Performance Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm'>
              {blockedTasks.count} task
              {blockedTasks.count > 1 ? "s are" : " is"} currently blocked.
              Review and address bottlenecks to improve team productivity.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
