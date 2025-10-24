import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { projects, tasks, clients, workspaceMembers, users } from "@/src/db/schema";
import { eq, and, count, ne } from "drizzle-orm";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";
import { Button } from "@/components/ui/button";
import {
  Plus,
  BarChart3,
  FolderKanban,
  FileText,
  Users as UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProjectsBrowser } from "@/components/projects/projects-browser";
import { ProjectAnalyticsCharts } from "@/components/projects/project-analytics-charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default async function ProjectsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const isClient = session.user.role === "CLIENT";

  // Fetch projects based on user role
  let allProjects: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    priority: number | null;
    color: string | null;
    dueDate: Date | null;
    budget: number | null;
  }[] = [];

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

  // Get workspace team member count (all team members excluding clients)
  const workspace = await getCurrentWorkspace(session.user.id);

  // Count all workspace team members (excluding clients)
  const [teamMemberCount] = workspace
    ? await db
        .select({ count: count() })
        .from(workspaceMembers)
        .innerJoin(users, eq(workspaceMembers.userId, users.id))
        .where(
          and(eq(workspaceMembers.workspaceId, workspace.id), ne(users.role, "CLIENT"))
        )
    : [{ count: 0 }];

  // Get task stats for each project
  const projectsWithData = await Promise.all(
    allProjects.map(async (project) => {
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
        membersCount: teamMemberCount.count || 0, // Use workspace team count
        tasksCount: taskStats?.total || 0,
        completedTasks: completedStats?.completed || 0,
      };
    })
  );

  return (
    <TooltipProvider>
      <div className='space-y-6'>
        {/* Header with Quick Actions */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {isClient ? "My Projects" : "Projects"}
            </h1>
            <p className='text-muted-foreground mt-2'>
              {isClient
                ? "View and track your projects"
                : "Manage and track all your projects in one place"}
            </p>
          </div>

          {/* Quick Actions */}
          {!isClient && (
            <div className='flex items-center gap-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href='/team'>
                    <Button variant='outline' size='lg' className='gap-2'>
                      <UsersIcon className='h-4 w-4' />
                      <span className='hidden sm:inline'>Team</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Manage team members</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href='/invoices'>
                    <Button variant='outline' size='lg' className='gap-2'>
                      <FileText className='h-4 w-4' />
                      <span className='hidden sm:inline'>Invoices</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>View invoices</TooltipContent>
              </Tooltip>

              <div className='h-10 w-px bg-border' />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href='/projects/new'>
                    <Button
                      size='lg'
                      className='gap-2 shadow-md hover:shadow-lg transition-shadow'
                    >
                      <Plus className='h-4 w-4' />
                      <span className='hidden sm:inline'>New Project</span>
                      <span className='sm:hidden'>New</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Create a new project</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue='projects' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='projects'>
              <FolderKanban className='mr-2 h-4 w-4' />
              All Projects
            </TabsTrigger>
            <TabsTrigger value='analytics'>
              <BarChart3 className='mr-2 h-4 w-4' />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value='projects' className='space-y-6'>
            <ProjectsBrowser projects={projectsWithData} isClient={isClient} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value='analytics' className='space-y-6'>
            <ProjectAnalyticsCharts projects={projectsWithData} />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
