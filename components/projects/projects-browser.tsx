"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  KeyboardShortcutsDialog,
  useProjectsKeyboardShortcuts,
} from "./projects-keyboard-shortcuts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Grid3x3,
  List,
  FolderKanban,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  priority: number | null;
  color: string | null;
  dueDate: Date | null;
  budget: number | null;
  membersCount: number;
  tasksCount: number;
  completedTasks: number;
};

type ProjectsBrowserProps = {
  projects: Project[];
  isClient?: boolean;
};

const getStatusBadgeVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "ACTIVE") return "default";
  if (status === "COMPLETED") return "secondary";
  if (status === "CANCELLED") return "destructive";
  return "outline";
};

const getPriorityLabel = (priority: number | null) => {
  if (priority === null) return "None";
  if (priority >= 8) return "Critical";
  if (priority >= 6) return "High";
  if (priority >= 4) return "Medium";
  return "Low";
};

const getPriorityColor = (priority: number | null) => {
  if (priority === null) return "text-neutral-500";
  if (priority >= 8) return "text-red-500";
  if (priority >= 6) return "text-orange-500";
  if (priority >= 4) return "text-yellow-500";
  return "text-green-500";
};

export function ProjectsBrowser({ projects, isClient = false }: ProjectsBrowserProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Keyboard shortcuts
  useProjectsKeyboardShortcuts({
    onNewProject: () => {
      if (!isClient) router.push("/projects/new");
    },
    onToggleView: () => {
      setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
    },
    onClearFilters: () => {
      setSearchQuery("");
      setStatusFilter("all");
      setPriorityFilter("all");
    },
    onFocusSearch: () => {
      searchInputRef.current?.focus();
    },
    onFilterActive: () => {
      setStatusFilter((prev) => (prev === "ACTIVE" ? "all" : "ACTIVE"));
    },
    onFilterCompleted: () => {
      setStatusFilter((prev) => (prev === "COMPLETED" ? "all" : "COMPLETED"));
    },
    onFilterOnHold: () => {
      setStatusFilter((prev) => (prev === "ON_HOLD" ? "all" : "ON_HOLD"));
    },
    onShowHelp: () => {
      setShowKeyboardShortcuts(true);
    },
  });

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((project) => {
        const priority = project.priority || 0;
        if (priorityFilter === "critical") return priority >= 8;
        if (priorityFilter === "high") return priority >= 6 && priority < 8;
        if (priorityFilter === "medium") return priority >= 4 && priority < 6;
        if (priorityFilter === "low") return priority < 4;
        return true;
      });
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "priority":
          return (b.priority || 0) - (a.priority || 0);
        case "progress":
          const progressA = a.tasksCount > 0 ? a.completedTasks / a.tasksCount : 0;
          const progressB = b.tasksCount > 0 ? b.completedTasks / b.tasksCount : 0;
          return progressB - progressA;
        case "dueDate":
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, statusFilter, priorityFilter, sortBy]);

  // Calculate quick stats
  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === "ACTIVE").length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const onHold = projects.filter((p) => p.status === "ON_HOLD").length;
    const overdue = projects.filter(
      (p) => p.dueDate && new Date(p.dueDate) < new Date() && p.status !== "COMPLETED"
    ).length;

    return { active, completed, onHold, overdue };
  }, [projects]);

  return (
    <TooltipProvider>
      <div className='flex flex-col gap-4'>
        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog
          open={showKeyboardShortcuts}
          onOpenChange={setShowKeyboardShortcuts}
        />

        {/* Stats Cards - Modern Compact Design */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          {/* Active Projects */}
          <Card
            className={cn(
              "relative overflow-hidden border hover:shadow-lg transition-all duration-300 group cursor-pointer",
              statusFilter === "ACTIVE" && "ring-2 ring-primary"
            )}
            onClick={() => setStatusFilter(statusFilter === "ACTIVE" ? "all" : "ACTIVE")}
          >
            <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform' />
            <CardContent className='p-4 relative'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30'>
                      <TrendingUp className='h-4 w-4 text-white' />
                    </div>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                      Active
                    </p>
                  </div>
                  <p className='text-2xl font-bold tracking-tight'>{stats.active}</p>
                  <p className='text-xs text-muted-foreground'>In progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Projects */}
          <Card
            className={cn(
              "relative overflow-hidden border hover:shadow-lg transition-all duration-300 group cursor-pointer",
              statusFilter === "COMPLETED" && "ring-2 ring-primary"
            )}
            onClick={() =>
              setStatusFilter(statusFilter === "COMPLETED" ? "all" : "COMPLETED")
            }
          >
            <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform' />
            <CardContent className='p-4 relative'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30'>
                      <FolderKanban className='h-4 w-4 text-white' />
                    </div>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                      Completed
                    </p>
                  </div>
                  <p className='text-2xl font-bold tracking-tight'>{stats.completed}</p>
                  <p className='text-xs text-muted-foreground'>Finished projects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* On Hold Projects */}
          <Card
            className={cn(
              "relative overflow-hidden border hover:shadow-lg transition-all duration-300 group cursor-pointer",
              statusFilter === "ON_HOLD" && "ring-2 ring-primary"
            )}
            onClick={() =>
              setStatusFilter(statusFilter === "ON_HOLD" ? "all" : "ON_HOLD")
            }
          >
            <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform' />
            <CardContent className='p-4 relative'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30'>
                      <Clock className='h-4 w-4 text-white' />
                    </div>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                      On Hold
                    </p>
                  </div>
                  <p className='text-2xl font-bold tracking-tight'>{stats.onHold}</p>
                  <p className='text-xs text-muted-foreground'>Paused projects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Projects */}
          <Card className='relative overflow-hidden border hover:shadow-lg transition-all duration-300 group cursor-pointer'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform' />
            <CardContent className='p-4 relative'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30'>
                      <AlertCircle className='h-4 w-4 text-white' />
                    </div>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                      Overdue
                    </p>
                  </div>
                  <p className='text-2xl font-bold tracking-tight'>{stats.overdue}</p>
                  <p className='text-xs text-muted-foreground'>Past deadline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className='my-0' />

        {/* Search and Filters Toolbar */}
        <div className='flex items-center gap-3 py-2'>
          {/* Search Input */}
          <div className='relative w-64'>
            <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
            <Input
              ref={searchInputRef}
              placeholder='Search projects...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-8 h-9 text-sm'
            />
          </div>

          <Separator orientation='vertical' className='h-9 bg-border' />

          {/* Filter Controls */}
          <ButtonGroup>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='h-9 w-[100px] text-xs'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='ACTIVE'>Active</SelectItem>
                <SelectItem value='COMPLETED'>Completed</SelectItem>
                <SelectItem value='ON_HOLD'>On Hold</SelectItem>
                <SelectItem value='CANCELLED'>Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className='h-9 w-[100px] text-xs'>
                <SelectValue placeholder='Priority' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Priorities</SelectItem>
                <SelectItem value='critical'>Critical</SelectItem>
                <SelectItem value='high'>High</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='low'>Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='h-9 w-[100px] text-xs'>
                <SelectValue placeholder='Sort' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='name'>Name</SelectItem>
                <SelectItem value='priority'>Priority</SelectItem>
                <SelectItem value='progress'>Progress</SelectItem>
                <SelectItem value='dueDate'>Due Date</SelectItem>
                <SelectItem value='status'>Status</SelectItem>
              </SelectContent>
            </Select>
          </ButtonGroup>

          {/* Active Filter Badges */}
          {(statusFilter !== "all" || priorityFilter !== "all") && (
            <>
              <Separator orientation='vertical' className='h-6' />
              <div className='flex items-center gap-1.5'>
                {statusFilter !== "all" && (
                  <Badge
                    variant='secondary'
                    className='h-7 gap-1 text-xs px-2 cursor-pointer hover:bg-secondary/80'
                    onClick={() => setStatusFilter("all")}
                  >
                    {statusFilter}
                    <X className='h-3 w-3' />
                  </Badge>
                )}
                {priorityFilter !== "all" && (
                  <Badge
                    variant='secondary'
                    className='h-7 gap-1 text-xs px-2 capitalize cursor-pointer hover:bg-secondary/80'
                    onClick={() => setPriorityFilter("all")}
                  >
                    {priorityFilter}
                    <X className='h-3 w-3' />
                  </Badge>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setStatusFilter("all");
                    setPriorityFilter("all");
                  }}
                  className='h-7 px-2 text-xs'
                >
                  Clear
                </Button>
              </div>
            </>
          )}

          {/* Spacer */}
          <div className='flex-1' />

          {/* Right Actions */}
          <div className='flex items-center gap-2'>
            {/* Results Count */}
            {(searchQuery || statusFilter !== "all" || priorityFilter !== "all") && (
              <>
                <span className='text-xs font-medium text-muted-foreground'>
                  {filteredProjects.length}/{projects.length}
                </span>
                <Separator orientation='vertical' className='h-6' />
              </>
            )}

            {/* Keyboard Shortcuts Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowKeyboardShortcuts(true)}
                  className='h-9 w-9 p-0'
                >
                  <HelpCircle className='h-3.5 w-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard Shortcuts (?)</TooltipContent>
            </Tooltip>

            <Separator orientation='vertical' className='h-6' />

            {/* View Mode Selector */}
            <ButtonGroup>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "outline"}
                    size='sm'
                    onClick={() => setViewMode("grid")}
                    className='h-9 w-9 p-0'
                  >
                    <Grid3x3 className='h-3.5 w-3.5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid View</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "outline"}
                    size='sm'
                    onClick={() => setViewMode("list")}
                    className='h-9 w-9 p-0'
                  >
                    <List className='h-3.5 w-3.5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List View</TooltipContent>
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>

        <Separator className='my-0' />

        {/* Projects Display */}
        <div className='mt-6'>
          {viewMode === "grid" ? (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredProjects.map((project) => (
                <ProjectListItem key={project.id} project={project} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <Card className='p-12'>
              <div className='text-center'>
                <FolderKanban className='mx-auto h-12 w-12 text-neutral-400' />
                <h3 className='mt-4 text-lg font-semibold'>No projects found</h3>
                <p className='mt-2 text-neutral-500'>
                  {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by creating your first project"}
                </p>
                {!isClient &&
                  (searchQuery || statusFilter !== "all" || priorityFilter !== "all") && (
                    <Button
                      variant='outline'
                      className='mt-4'
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setPriorityFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// Project Card Component (Grid View)
function ProjectCard({ project }: { project: Project }) {
  const progress =
    project.tasksCount > 0
      ? Math.round((project.completedTasks / project.tasksCount) * 100)
      : 0;

  const isOverdue =
    project.dueDate &&
    new Date(project.dueDate) < new Date() &&
    project.status !== "COMPLETED";

  return (
    <Link href={`/projects/${project.slug}`}>
      <Card
        className='h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-l-4 group'
        style={{ borderLeftColor: project.color || "#0070f3" }}
      >
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div
              className='h-12 w-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110'
              style={{ backgroundColor: project.color || "#0070f3" }}
            >
              <FolderKanban className='h-6 w-6 text-white' />
            </div>
            <div className='flex flex-col gap-2 items-end'>
              <Badge variant={getStatusBadgeVariant(project.status)} className='text-xs'>
                {project.status}
              </Badge>
              {project.priority !== null && (
                <Badge
                  variant='outline'
                  className={cn("text-xs", getPriorityColor(project.priority))}
                >
                  {getPriorityLabel(project.priority)}
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className='mt-4 line-clamp-1'>{project.name}</CardTitle>
          <p className='text-sm text-neutral-500 line-clamp-2 min-h-[40px]'>
            {project.description || "No description"}
          </p>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Progress */}
            {project.tasksCount > 0 && (
              <div>
                <div className='flex items-center justify-between text-sm mb-2'>
                  <span className='text-neutral-500'>Progress</span>
                  <span className='font-medium'>{progress}%</span>
                </div>
                <div className='h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden'>
                  <div
                    className='h-full transition-all duration-300'
                    style={{
                      width: `${progress}%`,
                      backgroundColor: project.color || "#0070f3",
                    }}
                  />
                </div>
                <p className='text-xs text-neutral-500 mt-1'>
                  {project.completedTasks} of {project.tasksCount} tasks completed
                </p>
              </div>
            )}

            {/* Meta info */}
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-4 text-neutral-500'>
                <div className='flex items-center gap-1'>
                  <Users className='h-4 w-4' />
                  <span>{project.membersCount}</span>
                </div>
                {project.budget && (
                  <div className='flex items-center gap-1'>
                    <DollarSign className='h-4 w-4' />
                    <span>${project.budget.toLocaleString()}</span>
                  </div>
                )}
              </div>
              {project.dueDate && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    isOverdue ? "text-red-500 font-medium" : "text-neutral-500"
                  )}
                >
                  <Calendar className='h-3 w-3' />
                  <span>
                    {new Date(project.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Project List Item Component (List View)
function ProjectListItem({ project }: { project: Project }) {
  const progress =
    project.tasksCount > 0
      ? Math.round((project.completedTasks / project.tasksCount) * 100)
      : 0;

  const isOverdue =
    project.dueDate &&
    new Date(project.dueDate) < new Date() &&
    project.status !== "COMPLETED";

  return (
    <Link href={`/projects/${project.slug}`}>
      <Card className='transition-all hover:shadow-md cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50'>
        <CardContent className='p-6'>
          <div className='flex items-center gap-6'>
            {/* Color Indicator & Icon */}
            <div
              className='h-14 w-14 rounded-lg flex items-center justify-center shrink-0'
              style={{ backgroundColor: project.color || "#0070f3" }}
            >
              <FolderKanban className='h-7 w-7 text-white' />
            </div>

            {/* Project Info */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-3 mb-1'>
                    <h3 className='font-semibold text-lg truncate'>{project.name}</h3>
                    <Badge
                      variant={getStatusBadgeVariant(project.status)}
                      className='text-xs'
                    >
                      {project.status}
                    </Badge>
                    {project.priority !== null && (
                      <Badge
                        variant='outline'
                        className={cn("text-xs", getPriorityColor(project.priority))}
                      >
                        {getPriorityLabel(project.priority)}
                      </Badge>
                    )}
                  </div>
                  <p className='text-sm text-neutral-500 line-clamp-1'>
                    {project.description || "No description"}
                  </p>
                </div>

                {/* Progress Circle */}
                {project.tasksCount > 0 && (
                  <div className='flex flex-col items-center gap-1 shrink-0'>
                    <div className='relative h-12 w-12'>
                      <svg className='transform -rotate-90 h-12 w-12'>
                        <circle
                          cx='24'
                          cy='24'
                          r='20'
                          stroke='currentColor'
                          strokeWidth='4'
                          fill='none'
                          className='text-neutral-200 dark:text-neutral-700'
                        />
                        <circle
                          cx='24'
                          cy='24'
                          r='20'
                          stroke={project.color || "#0070f3"}
                          strokeWidth='4'
                          fill='none'
                          strokeDasharray={`${progress * 1.25663706} 125.663706`}
                          className='transition-all duration-300'
                        />
                      </svg>
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <span className='text-xs font-semibold'>{progress}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Meta Row */}
              <div className='flex items-center gap-6 mt-3 text-sm text-neutral-500'>
                <div className='flex items-center gap-1'>
                  <Users className='h-4 w-4' />
                  <span>{project.membersCount} members</span>
                </div>
                {project.tasksCount > 0 && (
                  <div className='flex items-center gap-1'>
                    <Clock className='h-4 w-4' />
                    <span>
                      {project.completedTasks}/{project.tasksCount} tasks
                    </span>
                  </div>
                )}
                {project.budget && (
                  <div className='flex items-center gap-1'>
                    <DollarSign className='h-4 w-4' />
                    <span>${project.budget.toLocaleString()}</span>
                  </div>
                )}
                {project.dueDate && (
                  <div
                    className={cn(
                      "flex items-center gap-1 ml-auto",
                      isOverdue ? "text-red-500 font-medium" : ""
                    )}
                  >
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
