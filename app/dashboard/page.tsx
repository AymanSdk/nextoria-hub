import { getSession } from "@/src/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, FolderKanban, CheckSquare, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();

  const stats = [
    {
      title: "Active Projects",
      value: "12",
      description: "+2 from last month",
      icon: FolderKanban,
    },
    {
      title: "Tasks in Progress",
      value: "45",
      description: "23 completed this week",
      icon: CheckSquare,
    },
    {
      title: "Team Members",
      value: "8",
      description: "Across 3 departments",
      icon: Users,
    },
    {
      title: "Monthly Revenue",
      value: "$12,450",
      description: "+18% from last month",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most recently updated projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Website Redesign</p>
                  <p className="text-xs text-neutral-500">Updated 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Mobile App v2.0</p>
                  <p className="text-xs text-neutral-500">Updated 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Marketing Campaign</p>
                  <p className="text-xs text-neutral-500">Updated yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-neutral-200 dark:border-neutral-800">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Design review session</p>
                  <p className="text-xs text-neutral-500">Due tomorrow</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-neutral-200 dark:border-neutral-800">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Client presentation</p>
                  <p className="text-xs text-neutral-500">Due in 3 days</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-neutral-200 dark:border-neutral-800">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sprint planning</p>
                  <p className="text-xs text-neutral-500">Due in 5 days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

