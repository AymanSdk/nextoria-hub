import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { projects, projectMembers, tasks, clients } from "@/src/db/schema";
import { eq, and, count } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderKanban, Clock, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const getStatusBadgeVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "ACTIVE") return "default";
  if (status === "COMPLETED") return "secondary";
  if (status === "CANCELLED") return "destructive";
  return "outline";
};

export default async function ProjectsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const isClient = session.user.role === "CLIENT";

  // Fetch projects based on user role
  let allProjects;

  if (isClient) {
    // For clients, find their client record and fetch only their projects
    const [clientRecord] = await db
      .select()
      .from(clients)
      .where(eq(clients.email, session.user.email || ""))
      .limit(1);

    if (clientRecord) {
      allProjects = await db
        .select({
          id: projects.id,
          name: projects.name,
          slug: projects.slug,
          description: projects.description,
          status: projects.status,
          priority: projects.priority,
          color: projects.color,
          dueDate: projects.dueDate,
          budget: projects.budgetAmount,
        })
        .from(projects)
        .where(eq(projects.clientId, clientRecord.id));
    } else {
      // No client record found, show empty
      allProjects = [];
    }
  } else {
    // For team members, fetch all projects or projects they're members of
    allProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        slug: projects.slug,
        description: projects.description,
        status: projects.status,
        priority: projects.priority,
        color: projects.color,
        dueDate: projects.dueDate,
        budget: projects.budgetAmount,
      })
      .from(projects);
  }

  // Get member counts and task stats for each project
  const projectsWithData = await Promise.all(
    allProjects.map(async (project) => {
      const [memberCount] = await db
        .select({ count: count() })
        .from(projectMembers)
        .where(eq(projectMembers.projectId, project.id));

      const [taskStats] = await db
        .select({
          total: count(),
        })
        .from(tasks)
        .where(eq(tasks.projectId, project.id));

      const [completedStats] = await db
        .select({
          completed: count(),
        })
        .from(tasks)
        .where(and(eq(tasks.projectId, project.id), eq(tasks.status, "DONE")));

      return {
        ...project,
        membersCount: memberCount?.count || 0,
        tasksCount: taskStats?.total || 0,
        completedTasks: completedStats?.completed || 0,
      };
    })
  );

  // Calculate statistics
  const totalProjects = projectsWithData.length;
  const activeProjects = projectsWithData.filter((p) => p.status === "ACTIVE").length;
  const totalTasks = projectsWithData.reduce((acc, p) => acc + p.tasksCount, 0);
  const completedTasks = projectsWithData.reduce((acc, p) => acc + p.completedTasks, 0);
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {isClient ? "My Projects" : "Projects"}
          </h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            {isClient
              ? "View and track your projects"
              : "Manage and track all your projects in one place"}
          </p>
        </div>
        {!isClient && (
          <Link href='/projects/new'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              New Project
            </Button>
          </Link>
        )}
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Projects</CardTitle>
            <FolderKanban className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalProjects}</div>
            <p className='text-xs text-neutral-500 mt-1'>{activeProjects} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Overall Progress</CardTitle>
            <TrendingUp className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{overallProgress}%</div>
            <p className='text-xs text-neutral-500 mt-1'>
              {completedTasks} of {totalTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Tasks</CardTitle>
            <Clock className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalTasks - completedTasks}</div>
            <p className='text-xs text-neutral-500 mt-1'>In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Team Members</CardTitle>
            <Users className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {Math.max(...projectsWithData.map((p) => p.membersCount), 0)}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>Max per project</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {projectsWithData.map((project) => (
          <Link key={project.id} href={`/projects/${project.slug}`}>
            <Card
              className='h-full transition-all hover:shadow-md cursor-pointer border-l-4 hover:border-l-8'
              style={{ borderLeftColor: project.color || "#0070f3" }}
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div
                    className='h-10 w-10 rounded-lg flex items-center justify-center'
                    style={{ backgroundColor: project.color || "#0070f3" }}
                  >
                    <FolderKanban className='h-5 w-5 text-white' />
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(project.status)}
                    className='text-xs'
                  >
                    {project.status}
                  </Badge>
                </div>
                <CardTitle className='mt-4'>{project.name}</CardTitle>
                <CardDescription className='line-clamp-2'>
                  {project.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {/* Progress */}
                  {project.tasksCount > 0 && (
                    <div>
                      <div className='flex items-center justify-between text-sm mb-2'>
                        <span className='text-neutral-500'>Progress</span>
                        <span className='font-medium'>
                          {Math.round(
                            (project.completedTasks / project.tasksCount) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className='h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden'>
                        <div
                          className='h-full transition-all'
                          style={{
                            width: `${
                              (project.completedTasks / project.tasksCount) * 100
                            }%`,
                            backgroundColor: project.color || "#0070f3",
                          }}
                        />
                      </div>
                      <p className='text-xs text-neutral-500 mt-1'>
                        {project.completedTasks} of {project.tasksCount} tasks completed
                      </p>
                    </div>
                  )}

                  {/* Meta info */}
                  <div className='flex items-center gap-4 text-sm text-neutral-500'>
                    <div className='flex items-center gap-1'>
                      <Users className='h-4 w-4' />
                      <span>{project.membersCount}</span>
                    </div>
                    {project.dueDate && (
                      <div className='flex items-center gap-1'>
                        <Clock className='h-4 w-4' />
                        <span>
                          {new Date(project.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {projectsWithData.length === 0 && (
        <Card className='p-12'>
          <div className='text-center'>
            <FolderKanban className='mx-auto h-12 w-12 text-neutral-400' />
            <h3 className='mt-4 text-lg font-semibold'>No projects yet</h3>
            <p className='mt-2 text-neutral-500'>
              Get started by creating your first project
            </p>
            <Link href='/projects/new'>
              <Button className='mt-4'>
                <Plus className='mr-2 h-4 w-4' />
                Create Project
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
