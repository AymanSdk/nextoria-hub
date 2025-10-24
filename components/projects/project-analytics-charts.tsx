"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, Target, CheckCircle2, Clock } from "lucide-react";

type Project = {
  id: string;
  status: string;
  priority: number | null;
  tasksCount: number;
  completedTasks: number;
  budget: number | null;
};

type ProjectAnalyticsChartsProps = {
  projects: Project[];
};

const STATUS_COLORS = {
  ACTIVE: "#0070f3",
  COMPLETED: "#10b981",
  ON_HOLD: "#f59e0b",
  CANCELLED: "#ef4444",
  PLANNING: "#8b5cf6",
};

const PRIORITY_COLORS = {
  Critical: "#ef4444",
  High: "#f59e0b",
  Medium: "#0070f3",
  Low: "#10b981",
  None: "#6b7280",
};

export function ProjectAnalyticsCharts({ projects }: ProjectAnalyticsChartsProps) {
  // Calculate status distribution
  const statusDistribution = Object.entries(
    projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    name: status.replace(/_/g, " "),
    value: count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#6b7280",
  }));

  // Calculate priority distribution
  const priorityDistribution = [
    {
      name: "Critical",
      value: projects.filter((p) => (p.priority || 0) >= 8).length,
      color: PRIORITY_COLORS.Critical,
    },
    {
      name: "High",
      value: projects.filter((p) => (p.priority || 0) >= 6 && (p.priority || 0) < 8)
        .length,
      color: PRIORITY_COLORS.High,
    },
    {
      name: "Medium",
      value: projects.filter((p) => (p.priority || 0) >= 4 && (p.priority || 0) < 6)
        .length,
      color: PRIORITY_COLORS.Medium,
    },
    {
      name: "Low",
      value: projects.filter((p) => (p.priority || 0) < 4 && p.priority !== null).length,
      color: PRIORITY_COLORS.Low,
    },
    {
      name: "None",
      value: projects.filter((p) => p.priority === null).length,
      color: PRIORITY_COLORS.None,
    },
  ].filter((item) => item.value > 0);

  // Calculate progress metrics
  const totalTasks = projects.reduce((acc, p) => acc + p.tasksCount, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.completedTasks, 0);
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Project completion rates
  const projectsByCompletion = [
    {
      name: "0-25%",
      count: projects.filter((p) => {
        const progress = p.tasksCount > 0 ? (p.completedTasks / p.tasksCount) * 100 : 0;
        return progress < 25;
      }).length,
    },
    {
      name: "25-50%",
      count: projects.filter((p) => {
        const progress = p.tasksCount > 0 ? (p.completedTasks / p.tasksCount) * 100 : 0;
        return progress >= 25 && progress < 50;
      }).length,
    },
    {
      name: "50-75%",
      count: projects.filter((p) => {
        const progress = p.tasksCount > 0 ? (p.completedTasks / p.tasksCount) * 100 : 0;
        return progress >= 50 && progress < 75;
      }).length,
    },
    {
      name: "75-100%",
      count: projects.filter((p) => {
        const progress = p.tasksCount > 0 ? (p.completedTasks / p.tasksCount) * 100 : 0;
        return progress >= 75;
      }).length,
    },
  ];

  // Calculate budget metrics
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const projectsWithBudget = projects.filter((p) => p.budget !== null).length;

  return (
    <div className='grid gap-6 md:grid-cols-2'>
      {/* Overall Progress Card */}
      <Card className='md:col-span-2'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>Completion status across all projects</CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
                <TrendingUp className='h-6 w-6 text-primary' />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <div>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-3xl font-bold'>{overallProgress}%</span>
                <span className='text-sm text-neutral-500'>
                  {completedTasks} of {totalTasks} tasks completed
                </span>
              </div>
              <Progress value={overallProgress} className='h-3' />
            </div>

            <div className='grid grid-cols-3 gap-4 pt-4 border-t'>
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <CheckCircle2 className='h-4 w-4 text-green-500' />
                  <span className='text-sm font-medium text-neutral-500'>Completed</span>
                </div>
                <p className='text-2xl font-bold'>{completedTasks}</p>
              </div>
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <Clock className='h-4 w-4 text-blue-500' />
                  <span className='text-sm font-medium text-neutral-500'>
                    In Progress
                  </span>
                </div>
                <p className='text-2xl font-bold'>{totalTasks - completedTasks}</p>
              </div>
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <Target className='h-4 w-4 text-purple-500' />
                  <span className='text-sm font-medium text-neutral-500'>Total</span>
                </div>
                <p className='text-2xl font-bold'>{totalTasks}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Projects by Status</CardTitle>
          <CardDescription>
            Distribution of projects by their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width='100%' height={250}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className='grid grid-cols-2 gap-3 mt-4'>
                {statusDistribution.map((item) => (
                  <div key={item.name} className='flex items-center gap-2'>
                    <div
                      className='h-3 w-3 rounded-full'
                      style={{ backgroundColor: item.color }}
                    />
                    <span className='text-sm text-neutral-600 dark:text-neutral-400'>
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className='flex items-center justify-center h-[250px] text-neutral-500'>
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Priority Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Projects by Priority</CardTitle>
          <CardDescription>Distribution of projects by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          {priorityDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width='100%' height={250}>
                <BarChart data={priorityDistribution}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-neutral-200 dark:stroke-neutral-800'
                  />
                  <XAxis dataKey='name' className='text-xs' />
                  <YAxis className='text-xs' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey='value' radius={[8, 8, 0, 0]}>
                    {priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className='grid grid-cols-2 gap-3 mt-4'>
                {priorityDistribution.map((item) => (
                  <div key={item.name} className='flex items-center gap-2'>
                    <div
                      className='h-3 w-3 rounded-full'
                      style={{ backgroundColor: item.color }}
                    />
                    <span className='text-sm text-neutral-600 dark:text-neutral-400'>
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className='flex items-center justify-center h-[250px] text-neutral-500'>
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Distribution</CardTitle>
          <CardDescription>Projects grouped by completion percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={projectsByCompletion}>
              <CartesianGrid
                strokeDasharray='3 3'
                className='stroke-neutral-200 dark:stroke-neutral-800'
              />
              <XAxis dataKey='name' className='text-xs' />
              <YAxis className='text-xs' />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey='count' fill='#0070f3' radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className='grid grid-cols-4 gap-2 mt-4'>
            {projectsByCompletion.map((item) => (
              <div key={item.name} className='text-center'>
                <p className='text-2xl font-bold'>{item.count}</p>
                <p className='text-xs text-neutral-500'>{item.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Total budget across all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <div>
              <p className='text-sm text-neutral-500 mb-2'>Total Budget</p>
              <p className='text-3xl font-bold'>${totalBudget.toLocaleString()}</p>
            </div>
            <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
              <div>
                <p className='text-sm text-neutral-500 mb-1'>Projects with Budget</p>
                <p className='text-2xl font-bold'>{projectsWithBudget}</p>
              </div>
              <div>
                <p className='text-sm text-neutral-500 mb-1'>Average Budget</p>
                <p className='text-2xl font-bold'>
                  $
                  {projectsWithBudget > 0
                    ? Math.round(totalBudget / projectsWithBudget).toLocaleString()
                    : 0}
                </p>
              </div>
            </div>
            {projects.length > 0 && (
              <div className='pt-4 border-t'>
                <p className='text-sm text-neutral-500 mb-2'>Budget per Project</p>
                <div className='space-y-2'>
                  {projects
                    .filter((p) => p.budget !== null)
                    .sort((a, b) => (b.budget || 0) - (a.budget || 0))
                    .slice(0, 5)
                    .map((project, index) => (
                      <div
                        key={project.id}
                        className='flex items-center justify-between text-sm'
                      >
                        <span className='text-neutral-600 dark:text-neutral-400'>
                          Project {index + 1}
                        </span>
                        <span className='font-medium'>
                          ${project.budget?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
