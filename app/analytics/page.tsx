import { getSession } from "@/src/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { TrendingUp, DollarSign, Users, CheckCircle2 } from "lucide-react";

// Mock data
const revenueData = [
  { month: "Jan", revenue: 12500, expenses: 8200 },
  { month: "Feb", revenue: 15800, expenses: 9100 },
  { month: "Mar", revenue: 18200, expenses: 9800 },
  { month: "Apr", revenue: 16500, expenses: 8900 },
  { month: "May", revenue: 21000, expenses: 10500 },
  { month: "Jun", revenue: 19500, expenses: 9700 },
];

const projectStatusData = [
  { name: "Active", value: 12, color: "#10b981" },
  { name: "Completed", value: 24, color: "#3b82f6" },
  { name: "On Hold", value: 3, color: "#f59e0b" },
  { name: "Draft", value: 5, color: "#6b7280" },
];

const taskThroughputData = [
  { week: "Week 1", completed: 24, created: 18 },
  { week: "Week 2", completed: 32, created: 25 },
  { week: "Week 3", completed: 28, created: 30 },
  { week: "Week 4", completed: 35, created: 22 },
];

const teamUtilizationData = [
  { member: "John Doe", utilization: 85 },
  { member: "Jane Smith", utilization: 92 },
  { member: "Bob Johnson", utilization: 78 },
  { member: "Alice Williams", utilization: 88 },
];

export default async function AnalyticsPage() {
  const session = await getSession();

  // Check if user has access to analytics
  const hasAccess = ["ADMIN", "DEVELOPER", "MARKETER"].includes(session?.user?.role || "");

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-neutral-500">You don't have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Track performance, revenue, and team productivity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$19,500</div>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Active Clients
            </CardTitle>
            <Users className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +3 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Tasks Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">119</div>
            <p className="text-xs text-neutral-500 mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Avg. Team Utilization
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86%</div>
            <p className="text-xs text-neutral-500 mt-1">
              Across all members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>
                Monthly revenue and expenses comparison
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Status Distribution</CardTitle>
              <CardDescription>
                Overview of project statuses
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Throughput</CardTitle>
              <CardDescription>
                Tasks completed vs created per week
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={taskThroughputData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                  <XAxis 
                    dataKey="week"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Completed"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Created"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Utilization</CardTitle>
              <CardDescription>
                Individual team member utilization rates
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={teamUtilizationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis 
                    dataKey="member" 
                    type="category"
                    width={120}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="utilization" fill="#8b5cf6" name="Utilization %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

