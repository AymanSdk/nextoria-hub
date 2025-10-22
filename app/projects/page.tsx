import { getSession } from "@/src/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban, Clock, Users } from "lucide-react";
import Link from "next/link";

// Mock data - will be replaced with real data from API
const mockProjects = [
  {
    id: "1",
    name: "Website Redesign",
    slug: "website-redesign",
    description: "Complete overhaul of company website with modern design",
    status: "ACTIVE",
    color: "#0070f3",
    dueDate: new Date("2025-11-30"),
    tasksCount: 24,
    completedTasks: 12,
    membersCount: 5,
  },
  {
    id: "2",
    name: "Mobile App v2.0",
    slug: "mobile-app-v2",
    description: "Next generation mobile application with new features",
    status: "ACTIVE",
    color: "#7928ca",
    dueDate: new Date("2025-12-15"),
    tasksCount: 18,
    completedTasks: 8,
    membersCount: 4,
  },
  {
    id: "3",
    name: "Marketing Campaign",
    slug: "marketing-campaign",
    description: "Q1 2025 digital marketing campaign",
    status: "DRAFT",
    color: "#ff0080",
    dueDate: new Date("2025-11-01"),
    tasksCount: 15,
    completedTasks: 2,
    membersCount: 3,
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    DRAFT: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    ON_HOLD: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return colors[status] || colors.DRAFT;
};

export default async function ProjectsPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Manage and track all your projects in one place
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <Link key={project.id} href={`/projects/${project.slug}`}>
            <Card className="h-full transition-all hover:shadow-md cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: project.color }}
                  >
                    <FolderKanban className="h-5 w-5 text-white" />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>
                <CardTitle className="mt-4">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-neutral-500">Progress</span>
                      <span className="font-medium">
                        {Math.round((project.completedTasks / project.tasksCount) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${(project.completedTasks / project.tasksCount) * 100}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {project.completedTasks} of {project.tasksCount} tasks completed
                    </p>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.membersCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(project.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

