import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { projects, tasks, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Calendar,
  Target,
  Users as UsersIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { redirect, notFound } from "next/navigation";
import { TaskViewSwitcher } from "@/components/tasks/task-view-switcher";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { ProjectFilesSection } from "@/components/projects/project-files-section";

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

  // Fetch all workspace team members (for task assignment)
  // Since this is an internal agency tool, show all team members regardless of project membership
  const { workspaceMembers, workspaces, clients } = await import("@/src/db/schema");

  // Get the workspace
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, "nextoria-agency"))
    .limit(1);

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
        .where(eq(workspaceMembers.workspaceId, workspace.id))
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
    description: task.description || "",
    status: task.status as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BACKLOG",
    priority: task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    labels: task.labels || "",
    dueDate: task.dueDate ? task.dueDate : undefined,
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

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "ACTIVE") return "default";
    if (status === "COMPLETED") return "secondary";
    if (status === "CANCELLED") return "destructive";
    return "outline";
  };

  return (
    <div className='space-y-6 max-w-[1600px]'>
      {/* Project Header */}
      <div className='space-y-4'>
        <div className='flex flex-col sm:flex-row items-start justify-between gap-4'>
          <div className='flex items-start gap-4 flex-1 min-w-0 w-full'>
            <div
              className='h-16 w-16 rounded-lg flex items-center justify-center shrink-0'
              style={{ backgroundColor: project.color || "#0070f3" }}
            >
              <Target className='h-8 w-8 text-white' />
            </div>
            <div className='flex-1 min-w-0'>
              <h1 className='text-3xl font-bold tracking-tight wrap-break-word'>
                {project.name}
              </h1>
              <p className='text-neutral-500 dark:text-neutral-400 mt-1 wrap-break-word'>
                {project.description || "No description"}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            <EditProjectDialog project={project} clients={allClients} />
          </div>
        </div>

        {/* Project Meta Info */}
        <div className='flex items-center gap-4 flex-wrap'>
          <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
          {project.dueDate && (
            <div className='flex items-center gap-2 text-sm text-neutral-500'>
              <Calendar className='h-4 w-4' />
              <span>
                Due{" "}
                {new Date(project.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          {members.length > 0 && (
            <div className='flex items-center gap-2'>
              <div className='flex -space-x-2'>
                {members.slice(0, 5).map((member) => (
                  <Avatar key={member.id} className='h-8 w-8 border-2 border-background'>
                    <AvatarFallback className='text-xs'>
                      {member.name?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {members.length > 5 && (
                <span className='text-sm text-neutral-500'>+{members.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='text-2xl font-bold'>{progress}%</div>
              <div className='h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden'>
                <div
                  className='h-full transition-all'
                  style={{
                    width: `${progress}%`,
                    backgroundColor: project.color || "#0070f3",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-neutral-500' />
              <span className='text-2xl font-bold'>{totalTasks}</span>
            </div>
            <p className='text-xs text-neutral-500 mt-1'>{completedTasks} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <Clock className='h-5 w-5 text-blue-500' />
              <span className='text-2xl font-bold'>{inProgressTasks}</span>
            </div>
            <p className='text-xs text-neutral-500 mt-1'>{todoTasks} in backlog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <UsersIcon className='h-5 w-5 text-neutral-500' />
              <span className='text-2xl font-bold'>{members.length}</span>
            </div>
            <p className='text-xs text-neutral-500 mt-1'>Active contributors</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <div className='w-full overflow-hidden'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold'>Tasks</h2>
          <CreateTaskDialog projectId={project.id} members={members} />
        </div>

        {formattedTasks.length > 0 ? (
          <TaskViewSwitcher tasks={formattedTasks} members={members} />
        ) : (
          <Card className='p-12'>
            <div className='text-center'>
              <CheckCircle2 className='mx-auto h-12 w-12 text-neutral-400' />
              <h3 className='mt-4 text-lg font-semibold'>No tasks yet</h3>
              <p className='mt-2 text-neutral-500'>
                Get started by creating your first task
              </p>
              <div className='mt-4 flex justify-center'>
                <CreateTaskDialog projectId={project.id} members={members} />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Project Files */}
      <ProjectFilesSection projectId={project.id} clientId={project.clientId} />
    </div>
  );
}
