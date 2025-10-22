import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { projects, tasks, users, invoices } from "@/src/db/schema";
import { eq, count, and, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FolderKanban,
  CheckCircle2,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch statistics
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

  const [teamCount] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.isActive, true));

  const totalRevenue = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
    .from(invoices)
    .where(eq(invoices.status, "PAID"));

  // Recent projects
  const recentProjects = await db
    .select()
    .from(projects)
    .limit(5)
    .orderBy(sql`${projects.createdAt} DESC`);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Welcome back, {session.user.name}!
        </h1>
        <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
          Here's what's happening with your agency today
        </p>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Projects
            </CardTitle>
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
              {completedTasksCount.count} completed
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
            <p className='text-xs text-neutral-500 mt-1'>All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Team</CardTitle>
            <Users className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{teamCount.count}</div>
            <p className='text-xs text-neutral-500 mt-1'>Active members</p>
          </CardContent>
        </Card>
      </div>

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
                  className='flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors'>
                  <div className='flex items-center gap-3'>
                    <div
                      className='h-10 w-10 rounded-lg flex items-center justify-center'
                      style={{ backgroundColor: project.color || "#0070f3" }}>
                      <FolderKanban className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <p className='font-semibold'>{project.name}</p>
                      <p className='text-sm text-neutral-500'>
                        {project.description?.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                  <div className='text-sm text-neutral-500'>
                    {project.status}
                  </div>
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
