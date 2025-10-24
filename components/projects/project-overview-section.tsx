"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  DollarSign,
  User,
  Building2,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Client {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
}

interface ProjectOverviewSectionProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    startDate: Date | null;
    dueDate: Date | null;
    budgetAmount: number | null;
    budgetCurrency: string | null;
    createdAt: Date;
    updatedAt: Date;
    priority: number | null;
  };
  client: Client | null;
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

const priorityLabels = {
  0: { label: "Low", color: "bg-gray-500" },
  1: { label: "Medium", color: "bg-blue-500" },
  2: { label: "High", color: "bg-orange-500" },
  3: { label: "Critical", color: "bg-red-500" },
};

export function ProjectOverviewSection({
  project,
  client,
  progress,
  totalTasks,
  completedTasks,
}: ProjectOverviewSectionProps) {
  const priorityConfig = priorityLabels[project.priority as keyof typeof priorityLabels] || priorityLabels[0];

  const formatBudget = (amount: number | null, currency: string | null) => {
    if (!amount) return "Not set";
    const currencySymbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      MAD: "DH",
    };
    return `${currencySymbols[currency || "USD"] || "$"}${(amount / 100).toLocaleString()}`;
  };

  const getDaysRemaining = (dueDate: Date | null) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, variant: "destructive" };
    if (diffDays === 0) return { text: "Due today", variant: "default" };
    if (diffDays <= 7) return { text: `${diffDays} days left`, variant: "default" };
    return { text: `${diffDays} days left`, variant: "secondary" };
  };

  const daysRemaining = getDaysRemaining(project.dueDate);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Project Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{totalTasks}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Budget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline & Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {project.startDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Start Date
                </span>
                <span className="font-medium">
                  {new Date(project.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            {project.dueDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Target className="h-3.5 w-3.5" />
                  Due Date
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {new Date(project.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {daysRemaining && (
                    <Badge variant={daysRemaining.variant as any} className="text-xs">
                      {daysRemaining.text}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5" />
                Budget
              </span>
              <span className="font-medium">
                {formatBudget(project.budgetAmount, project.budgetCurrency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                Priority
              </span>
              <Badge className={`${priorityConfig.color} text-white`}>
                {priorityConfig.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      {client && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{client.name}</span>
            </div>
            {client.companyName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  Company
                </span>
                <span className="font-medium">{client.companyName}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-blue-600">{client.email}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Metadata */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Project Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">
              {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">
              {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

