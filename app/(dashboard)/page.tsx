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
import { eq, count, and, sql, gte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/src/lib/auth/rbac";

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

  // Monthly Recurring Revenue (invoices from last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const mrrData = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
    .from(invoices)
    .where(and(eq(invoices.status, "PAID"), gte(invoices.paidAt, thirtyDaysAgo)));

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
    .orderBy(sql`${projects.createdAt} DESC`);

  const avgUtilization =
    teamUtilization.length > 0
      ? Math.round(
          teamUtilization.reduce((acc, t) => acc + t.taskCount, 0) /
            teamUtilization.length
        )
      : 0;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Welcome back, {session.user.name}!
        </h1>
        <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
          {userIsAdmin
            ? "Here's your complete agency overview"
            : "Here's what's happening with your work today"}
        </p>
      </div>

      {/* Primary Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Projects</CardTitle>
            <FolderKanban className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{projectsCount.count}</div>
            <p className='text-xs text-neutral-500 mt-1'>
              {activeProjectsCount.count} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tasks</CardTitle>
            <CheckCircle2 className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{tasksCount.count}</div>
            <p className='text-xs text-neutral-500 mt-1'>
              {completedTasksCount.count} completed, {inProgressTasksCount.count} in
              progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${((totalRevenue[0]?.total || 0) / 100).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>
              ${((pendingRevenue[0]?.total || 0) / 100).toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Team</CardTitle>
            <Users className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{teamCount.count}</div>
            <p className='text-xs text-neutral-500 mt-1'>{clientCount.count} clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Statistics - Admin Only */}
      {userIsAdmin && (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>MRR</CardTitle>
              <TrendingUp className='h-4 w-4 text-neutral-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ${((mrrData[0]?.total || 0) / 100).toLocaleString()}
              </div>
              <p className='text-xs text-neutral-500 mt-1'>Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Campaigns</CardTitle>
              <Target className='h-4 w-4 text-neutral-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{campaignsCount.count}</div>
              <p className='text-xs text-neutral-500 mt-1'>
                {activeCampaignsCount.count} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Expenses</CardTitle>
              <Receipt className='h-4 w-4 text-neutral-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ${((totalExpenses[0]?.total || 0) / 100).toLocaleString()}
              </div>
              <p className='text-xs text-neutral-500 mt-1'>
                {pendingExpenses[0].count} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Team Utilization</CardTitle>
              <Activity className='h-4 w-4 text-neutral-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{avgUtilization}</div>
              <p className='text-xs text-neutral-500 mt-1'>Avg tasks per member</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {blockedTasksCount.count > 0 && (
        <Card className='border-orange-200 dark:border-orange-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-orange-600 dark:text-orange-400'>
              <AlertCircle className='h-5 w-5' />
              Attention Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm'>
              You have {blockedTasksCount.count} blocked task
              {blockedTasksCount.count > 1 ? "s" : ""} that need attention.{" "}
              <Link href='/tasks?status=BLOCKED' className='underline font-medium'>
                View blocked tasks
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProjects.length > 0 ? (
            <div className='space-y-3'>
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className='flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className='h-10 w-10 rounded-lg flex items-center justify-center'
                      style={{ backgroundColor: project.color || "#0070f3" }}
                    >
                      <FolderKanban className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <p className='font-semibold'>{project.name}</p>
                      <p className='text-sm text-neutral-500'>
                        {project.description?.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                  <div className='text-sm text-neutral-500'>{project.status}</div>
                </Link>
              ))}
            </div>
          ) : (
            <p className='text-neutral-500'>No projects yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
