"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  Users as UsersIcon,
  AlertCircle,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface ProjectStatsCardsProps {
  progress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  teamSize: number;
  dueDate?: Date | null;
}

export function ProjectStatsCards({
  progress,
  totalTasks,
  completedTasks,
  inProgressTasks,
  todoTasks,
  teamSize,
  dueDate,
}: ProjectStatsCardsProps) {
  const getDaysUntilDue = () => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysUntilDue();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Progress Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{progress}%</span>
            <span className="text-sm text-muted-foreground">complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </CardContent>
      </Card>

      {/* Total Tasks Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Total Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{totalTasks}</span>
            <span className="text-sm text-muted-foreground">tasks</span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">{completedTasks} done</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">{inProgressTasks} active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In Progress Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {inProgressTasks}
            </span>
            <span className="text-sm text-muted-foreground">in progress</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {todoTasks} tasks in backlog
          </p>
        </CardContent>
      </Card>

      {/* Team or Due Date Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {dueDate ? <Calendar className="h-4 w-4" /> : <UsersIcon className="h-4 w-4" />}
            {dueDate ? "Due Date" : "Team Size"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dueDate ? (
            <>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold ${
                    daysRemaining !== null && daysRemaining < 0
                      ? "text-red-600 dark:text-red-400"
                      : daysRemaining !== null && daysRemaining <= 7
                        ? "text-orange-600 dark:text-orange-400"
                        : ""
                  }`}
                >
                  {daysRemaining !== null
                    ? daysRemaining < 0
                      ? `${Math.abs(daysRemaining)}`
                      : daysRemaining
                    : "N/A"}
                </span>
                {daysRemaining !== null && (
                  <span className="text-sm text-muted-foreground">
                    {daysRemaining < 0 ? "days overdue" : "days left"}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {new Date(dueDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{teamSize}</span>
                <span className="text-sm text-muted-foreground">members</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Active contributors</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

