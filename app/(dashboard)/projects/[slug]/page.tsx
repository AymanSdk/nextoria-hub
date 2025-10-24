import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { ProjectFilesSection } from "@/components/projects/project-files-section";
import { ProjectQuickActions } from "@/components/projects/project-quick-actions";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectOverviewSection } from "@/components/projects/project-overview-section";
import { ProjectTeamSection } from "@/components/projects/project-team-section";
import { ProjectStatsCards } from "@/components/projects/project-stats-cards";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TaskViewSwitcher } from "@/components/tasks/task-view-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from "@/src/db";
import { projects, tasks, users, clients } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth/session";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";
import { eq, ne, and } from "drizzle-orm";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Users as UsersIcon,
  Pencil,
  FileText,
  LayoutDashboard,
  ArrowLeft,
  Archive,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { slug } = await params;

  // Fetch project by slug
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  if (!project) {
    notFound();
  }

  // Fetch client if project has one
  let client = null;
  if (project.clientId) {
    const [clientData] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, project.clientId))
      .limit(1);
    client = clientData;
  }

  // Fetch all workspace team members (for task assignment)
  const { workspaceMembers, workspaces } = await import("@/src/db/schema");

  // Get user's current workspace
  const workspace = await getCurrentWorkspace(session.user.id);

  // Fetch all team members from the workspace (excluding clients)
  const members = workspace
    ? await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          role: users.role,
        })
        .from(workspaceMembers)
        .innerJoin(users, eq(workspaceMembers.userId, users.id))
        .where(
          and(eq(workspaceMembers.workspaceId, workspace.id), ne(users.role, "CLIENT"))
        )
    : [];

  // Fetch all clients for project editing
  const allClients = workspace
    ? await db
        .select({
          id: clients.id,
          name: clients.name,
          companyName: clients.companyName,
        })
        .from(clients)
        .where(eq(clients.workspaceId, workspace.id))
    : [];

  // Fetch all tasks for this project with assignee details
  const projectTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      labels: tasks.labels,
      dueDate: tasks.dueDate,
      estimatedHours: tasks.estimatedHours,
      actualHours: tasks.actualHours,
      assigneeId: tasks.assigneeId,
      assigneeName: users.name,
      assigneeImage: users.image,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(eq(tasks.projectId, project.id));

  // Transform tasks to match the expected format
  const formattedTasks = projectTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BACKLOG",
    priority: task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    labels: task.labels,
    dueDate: task.dueDate,
    assignee: task.assigneeId
      ? {
          id: task.assigneeId,
          name: task.assigneeName || "Unknown",
          image: task.assigneeImage || null,
        }
      : null,
  }));

  // Calculate stats
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = projectTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoTasks = projectTasks.filter((t) => t.status === "TODO").length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className='space-y-6 w-full'>
      {/* Breadcrumb with Back Button */}
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='icon' asChild>
          <Link href='/projects'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Link href='/projects' className='hover:text-foreground transition-colors'>
            Projects
          </Link>
          <span>/</span>
          <span className='text-foreground font-medium'>{project.name}</span>
        </div>
      </div>

      {/* Project Header */}
      <div className='space-y-4'>
        <div className='flex flex-col lg:flex-row items-start justify-between gap-4'>
          <div className='flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full'>
            <div
              className='h-14 w-14 sm:h-20 sm:w-20 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-105'
              style={{ backgroundColor: project.color || "#0070f3" }}
            >
              <Target className='h-7 w-7 sm:h-10 sm:w-10 text-white' />
            </div>
            <div className='flex-1 min-w-0 space-y-2'>
              <div className='flex items-center gap-2 flex-wrap'>
                <h1 className='text-2xl sm:text-4xl font-bold tracking-tight wrap-break-word'>
                  {project.name}
                </h1>
                {project.isArchived && (
                  <Badge variant='secondary' className='text-xs'>
                    Archived
                  </Badge>
                )}
              </div>
              <p className='text-sm sm:text-base text-muted-foreground wrap-break-word'>
                {project.description || "No description provided"}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 shrink-0 w-full lg:w-auto'>
            <EditProjectDialog project={project} clients={allClients} />
            <ProjectQuickActions
              projectId={project.id}
              projectSlug={project.slug}
              isArchived={project.isArchived}
            />
          </div>
        </div>

        {/* Project Meta Info */}
        <div className='flex items-center gap-4 flex-wrap'>
          <ProjectStatusBadge status={project.status} projectSlug={project.slug} />

          <Separator orientation='vertical' className='h-6' />

          {project.dueDate && (
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>Due</span>
              <span className='text-sm font-medium'>
                {new Date(project.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {project.dueDate && (client || members.length > 0) && (
            <Separator orientation='vertical' className='h-6' />
          )}

          {client && (
            <div className='flex items-center gap-2'>
              <UsersIcon className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>Client:</span>
              <span className='text-sm font-medium'>{client.name}</span>
            </div>
          )}

          {client && members.length > 0 && (
            <Separator orientation='vertical' className='h-6' />
          )}

          {members.length > 0 && (
            <div className='flex items-center gap-2'>
              <div className='flex -space-x-2'>
                {members.slice(0, 3).map((member) => (
                  <HoverCard key={member.id}>
                    <HoverCardTrigger>
                      <Avatar className='h-7 w-7 border-2 border-background hover:z-10 cursor-pointer transition-transform hover:scale-110'>
                        <AvatarImage
                          src={member.image || undefined}
                          alt={member.name || ""}
                        />
                        <AvatarFallback className='text-xs'>
                          {member.name?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                    </HoverCardTrigger>
                    <HoverCardContent className='w-64'>
                      <div className='flex gap-3'>
                        <Avatar className='h-12 w-12'>
                          <AvatarImage
                            src={member.image || undefined}
                            alt={member.name || ""}
                          />
                          <AvatarFallback>
                            {member.name?.substring(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className='space-y-1'>
                          <h4 className='text-sm font-semibold'>{member.name}</h4>
                          <p className='text-xs text-muted-foreground'>{member.email}</p>
                          <Badge variant='secondary' className='text-xs'>
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
              <span className='text-sm font-medium text-muted-foreground'>
                {members.length} team {members.length === 1 ? "member" : "members"}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Archived Alert */}
      {project.isArchived && (
        <Alert>
          <Archive className='h-4 w-4' />
          <AlertTitle>This project is archived</AlertTitle>
          <AlertDescription>
            This project has been archived and is read-only. You can unarchive it from the
            quick actions menu.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid w-full max-w-md grid-cols-3'>
          <TabsTrigger value='overview' className='gap-2'>
            <LayoutDashboard className='h-4 w-4' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='tasks' className='gap-2'>
            <CheckCircle2 className='h-4 w-4' />
            Tasks
            {totalTasks > 0 && (
              <span className='ml-1 text-xs bg-muted px-1.5 rounded-full'>
                {totalTasks}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value='files' className='gap-2'>
            <FileText className='h-4 w-4' />
            Files
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6 mt-6'>
          {/* Quick Stats */}
          <ProjectStatsCards
            progress={progress}
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            inProgressTasks={inProgressTasks}
            todoTasks={todoTasks}
            teamSize={members.length}
            dueDate={project.dueDate}
          />

          {/* Overview Section with Team */}
          <div className='grid gap-4 lg:grid-cols-3'>
            <div className='lg:col-span-2 space-y-4'>
              <ProjectOverviewSection
                project={project}
                client={client}
                progress={progress}
                totalTasks={totalTasks}
                completedTasks={completedTasks}
              />
            </div>
            <div className='lg:col-span-1'>
              <ProjectTeamSection members={members} />
            </div>
          </div>

          {/* Recent Tasks Preview */}
          {formattedTasks.length > 0 && (
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>Recent Tasks</CardTitle>
                  <Button variant='ghost' size='sm' asChild>
                    <Link href={`/projects/${slug}?tab=tasks`}>View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {formattedTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className='flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors'
                    >
                      <div className='flex items-center gap-3 flex-1 min-w-0'>
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 ${
                            task.status === "DONE"
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span className='truncate'>{task.title}</span>
                      </div>
                      {task.assignee && (
                        <Avatar className='h-6 w-6'>
                          <AvatarImage src={task.assignee.image || undefined} />
                          <AvatarFallback className='text-xs'>
                            {task.assignee.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value='tasks' className='space-y-4 mt-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
            <div>
              <h2 className='text-lg sm:text-xl font-semibold'>Project Tasks</h2>
              <p className='text-sm text-muted-foreground'>
                Manage and track all tasks for this project
              </p>
            </div>
            <CreateTaskDialog projectId={project.id} members={members} />
          </div>

          {formattedTasks.length > 0 ? (
            <TaskViewSwitcher tasks={formattedTasks} members={members} />
          ) : (
            <Card className='p-12'>
              <div className='text-center'>
                <CheckCircle2 className='mx-auto h-12 w-12 text-muted-foreground' />
                <h3 className='mt-4 text-lg font-semibold'>No tasks yet</h3>
                <p className='mt-2 text-muted-foreground'>
                  Get started by creating your first task
                </p>
                <div className='mt-4 flex justify-center'>
                  <CreateTaskDialog projectId={project.id} members={members} />
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value='files' className='space-y-4 mt-6'>
          <div>
            <h2 className='text-lg sm:text-xl font-semibold'>Project Files</h2>
            <p className='text-sm text-muted-foreground'>
              Upload and manage files related to this project
            </p>
          </div>
          <ProjectFilesSection projectId={project.id} clientId={project.clientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
