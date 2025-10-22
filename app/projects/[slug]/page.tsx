import { getSession } from "@/src/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, MoreHorizontal, Calendar, Target, Users } from "lucide-react";
import Link from "next/link";
import { TaskKanbanBoard } from "@/components/tasks/task-kanban-board";

// Mock data
const mockProject = {
  id: "1",
  name: "Website Redesign",
  slug: "website-redesign",
  description: "Complete overhaul of company website with modern design",
  status: "ACTIVE",
  color: "#0070f3",
  startDate: new Date("2025-10-01"),
  dueDate: new Date("2025-11-30"),
  members: [
    { id: "1", name: "John Doe", image: null },
    { id: "2", name: "Jane Smith", image: null },
    { id: "3", name: "Bob Johnson", image: null },
  ],
};

const mockTasks = [
  {
    id: "1",
    title: "Design homepage mockup",
    description: "Create initial homepage design in Figma",
    status: "IN_PROGRESS" as const,
    priority: "HIGH" as const,
    assignee: { id: "1", name: "John Doe", image: null },
    dueDate: new Date("2025-10-25"),
    labels: "design,ui",
  },
  {
    id: "2",
    title: "Set up project repository",
    description: "Initialize Next.js project with required dependencies",
    status: "DONE" as const,
    priority: "MEDIUM" as const,
    assignee: { id: "2", name: "Jane Smith", image: null },
    dueDate: new Date("2025-10-20"),
    labels: "development",
  },
  {
    id: "3",
    title: "Content strategy planning",
    description: "Plan website content structure and copy",
    status: "TODO" as const,
    priority: "MEDIUM" as const,
    assignee: { id: "3", name: "Bob Johnson", image: null },
    dueDate: new Date("2025-10-28"),
    labels: "content,marketing",
  },
  {
    id: "4",
    title: "API integration research",
    description: "Research best practices for API integration",
    status: "BACKLOG" as const,
    priority: "LOW" as const,
    assignee: null,
    dueDate: new Date("2025-11-05"),
    labels: "development,research",
  },
  {
    id: "5",
    title: "Responsive design implementation",
    description: "Implement responsive layouts for all pages",
    status: "IN_REVIEW" as const,
    priority: "HIGH" as const,
    assignee: { id: "1", name: "John Doe", image: null },
    dueDate: new Date("2025-10-30"),
    labels: "design,development",
  },
];

export default async function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getSession();

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className="h-16 w-16 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: mockProject.color }}
          >
            <Target className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {mockProject.name}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              {mockProject.description}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="secondary">{mockProject.status}</Badge>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Calendar className="h-4 w-4" />
                <span>
                  Due {new Date(mockProject.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neutral-500" />
              <span className="text-2xl font-bold">
                {mockProject.members.length}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{mockTasks.length}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {mockTasks.filter((t) => t.status === "DONE").length}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {mockTasks.filter((t) => t.status === "IN_PROGRESS").length}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
        <TaskKanbanBoard tasks={mockTasks} />
      </div>
    </div>
  );
}

