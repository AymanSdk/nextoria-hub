"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { nanoid } from "nanoid";
import {
  Workflow,
  Plus,
  Clock,
  Trash2,
  MoreVertical,
  Sparkles,
  Loader2,
  Search,
  Grid3x3,
  List,
  SortAsc,
  Filter,
  Copy,
  Share2,
  Lock,
  Globe,
  Folder,
  Star,
  Eye,
  Calendar,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import type { Flowchart } from "@/src/db/schema";
import { flowchartTemplates } from "@/src/lib/flowchart/templates";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type SortBy = "updated" | "created" | "name" | "nodes";
type FilterBy = "all" | "shared" | "private" | "recent";

export default function FlowchartIndexPage() {
  const [flowcharts, setFlowcharts] = useState<Flowchart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("flowcharts");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flowchartToDelete, setFlowchartToDelete] = useState<string | null>(null);

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch workspace ID from user
  useEffect(() => {
    fetch("/api/user/workspace")
      .then((res) => res.json())
      .then((data) => {
        if (data.workspaceId) {
          setWorkspaceId(data.workspaceId);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch flowcharts for the workspace
  useEffect(() => {
    if (!workspaceId) return;

    const fetchFlowcharts = async () => {
      try {
        const response = await fetch(`/api/flowcharts?workspaceId=${workspaceId}`);
        if (response.ok) {
          const data = await response.json();
          setFlowcharts(data);
        }
      } catch (error) {
        console.error("Error fetching flowcharts:", error);
        toast.error("Failed to load flowcharts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlowcharts();
  }, [workspaceId]);

  // Filter and sort flowcharts
  const filteredAndSortedFlowcharts = useMemo(() => {
    let result = [...flowcharts];

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Share status filter
    if (filterBy === "shared") {
      result = result.filter((f) => f.isPublic);
    } else if (filterBy === "private") {
      result = result.filter((f) => !f.isPublic);
    } else if (filterBy === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter((f) => new Date(f.updatedAt) > sevenDaysAgo);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "nodes":
          return (b.data?.nodes?.length || 0) - (a.data?.nodes?.length || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [flowcharts, searchQuery, sortBy, filterBy]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/flowcharts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFlowcharts((prev) => prev.filter((f) => f.id !== id));
        toast.success("Flowchart deleted");
      } else {
        toast.error("Failed to delete flowchart");
      }
    } catch (error) {
      console.error("Error deleting flowchart:", error);
      toast.error("Failed to delete flowchart");
    }
    setDeleteDialogOpen(false);
    setFlowchartToDelete(null);
  };

  const handleDuplicate = async (flowchart: Flowchart) => {
    try {
      const response = await fetch("/api/flowcharts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${flowchart.name} (Copy)`,
          description: flowchart.description,
          data: flowchart.data,
          workspaceId,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setFlowcharts((prev) => [created, ...prev]);
        toast.success("Flowchart duplicated");
      } else {
        toast.error("Failed to duplicate flowchart");
      }
    } catch (error) {
      console.error("Error duplicating flowchart:", error);
      toast.error("Failed to duplicate flowchart");
    }
  };

  const createFromTemplate = (templateId: string) => {
    const roomId = nanoid(10);
    window.location.href = `/flowchart/${roomId}?template=${templateId}`;
  };

  // Stats
  const stats = {
    total: flowcharts.length,
    shared: flowcharts.filter((f) => f.isPublic).length,
    private: flowcharts.filter((f) => !f.isPublic).length,
    recent: flowcharts.filter((f) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(f.updatedAt) > sevenDaysAgo;
    }).length,
  };

  return (
    <TooltipProvider>
      <div className='container max-w-7xl py-8 space-y-6'>
        {/* Hero Section */}
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <div className='p-2 bg-primary/10 rounded-xl'>
                <Workflow className='h-6 w-6 text-primary' />
              </div>
              <h1 className='text-3xl font-bold tracking-tight'>Flowcharts</h1>
            </div>
            <p className='text-muted-foreground'>
              Create and collaborate on flowcharts in real-time
            </p>
          </div>

          <Button asChild size='lg' className='shadow-lg'>
            <Link href={`/flowchart/${nanoid(10)}`}>
              <Plus className='mr-2 h-4 w-4' />
              New Flowchart
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Total</p>
                  <p className='text-2xl font-bold'>{stats.total}</p>
                </div>
                <Workflow className='h-8 w-8 text-blue-500 opacity-75' />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Shared</p>
                  <p className='text-2xl font-bold'>{stats.shared}</p>
                </div>
                <Globe className='h-8 w-8 text-emerald-500 opacity-75' />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Private</p>
                  <p className='text-2xl font-bold'>{stats.private}</p>
                </div>
                <Lock className='h-8 w-8 text-amber-500 opacity-75' />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Recent</p>
                  <p className='text-2xl font-bold'>{stats.recent}</p>
                </div>
                <Clock className='h-8 w-8 text-purple-500 opacity-75' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger value='flowcharts'>My Flowcharts</TabsTrigger>
            <TabsTrigger value='templates'>Templates</TabsTrigger>
          </TabsList>

          {/* My Flowcharts Tab */}
          <TabsContent value='flowcharts' className='space-y-4 mt-6'>
            {/* Toolbar */}
            <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
              <div className='flex flex-1 w-full gap-2'>
                {/* Search */}
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search flowcharts...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-9'
                  />
                </div>

                {/* Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <Filter className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-48'>
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={filterBy === "all"}
                      onCheckedChange={() => setFilterBy("all")}
                    >
                      All Flowcharts
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterBy === "shared"}
                      onCheckedChange={() => setFilterBy("shared")}
                    >
                      <Globe className='h-4 w-4 mr-2' />
                      Shared
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterBy === "private"}
                      onCheckedChange={() => setFilterBy("private")}
                    >
                      <Lock className='h-4 w-4 mr-2' />
                      Private
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterBy === "recent"}
                      onCheckedChange={() => setFilterBy("recent")}
                    >
                      <Clock className='h-4 w-4 mr-2' />
                      Last 7 days
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className='flex items-center gap-2'>
                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                  <SelectTrigger className='w-[160px]'>
                    <SortAsc className='h-4 w-4 mr-2' />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='updated'>Last Modified</SelectItem>
                    <SelectItem value='created'>Date Created</SelectItem>
                    <SelectItem value='name'>Name</SelectItem>
                    <SelectItem value='nodes'>Size</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className='flex items-center border rounded-lg'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size='icon'
                        className='h-9 w-9'
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid3x3 className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Grid View</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size='icon'
                        className='h-9 w-9'
                        onClick={() => setViewMode("list")}
                      >
                        <List className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>List View</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Results Count */}
            {searchQuery || filterBy !== "all" ? (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <span>
                  Found {filteredAndSortedFlowcharts.length} flowchart
                  {filteredAndSortedFlowcharts.length !== 1 ? "s" : ""}
                </span>
                {(searchQuery || filterBy !== "all") && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 px-2'
                    onClick={() => {
                      setSearchQuery("");
                      setFilterBy("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : null}

            {/* Content */}
            {isLoading ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              </div>
            ) : filteredAndSortedFlowcharts.length === 0 ? (
              <Card className='border-dashed'>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <Workflow className='h-12 w-12 text-muted-foreground mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>
                    {searchQuery || filterBy !== "all"
                      ? "No flowcharts found"
                      : "No flowcharts yet"}
                  </h3>
                  <p className='text-sm text-muted-foreground mb-4 text-center max-w-sm'>
                    {searchQuery || filterBy !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create your first flowchart or start with a template"}
                  </p>
                  {!(searchQuery || filterBy !== "all") && (
                    <div className='flex gap-2'>
                      <Button asChild>
                        <Link href={`/flowchart/${nanoid(10)}`}>
                          <Plus className='mr-2 h-4 w-4' />
                          Create Flowchart
                        </Link>
                      </Button>
                      <Button variant='outline' onClick={() => setActiveTab("templates")}>
                        <Sparkles className='mr-2 h-4 w-4' />
                        Browse Templates
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {filteredAndSortedFlowcharts.map((flowchart) => (
                  <FlowchartGridCard
                    key={flowchart.id}
                    flowchart={flowchart}
                    onDelete={(id) => {
                      setFlowchartToDelete(id);
                      setDeleteDialogOpen(true);
                    }}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            ) : (
              <div className='space-y-2'>
                {filteredAndSortedFlowcharts.map((flowchart) => (
                  <FlowchartListItem
                    key={flowchart.id}
                    flowchart={flowchart}
                    onDelete={(id) => {
                      setFlowchartToDelete(id);
                      setDeleteDialogOpen(true);
                    }}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value='templates' className='space-y-4 mt-6'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {flowchartTemplates.map((template) => {
                const Icon = template.icon;
                const categoryColors = {
                  software:
                    "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
                  business:
                    "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
                  database:
                    "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
                  ecommerce:
                    "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
                  security: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",
                };

                return (
                  <Card
                    key={template.id}
                    className='group hover:border-primary transition-all hover:shadow-lg'
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-start gap-3'>
                        <div
                          className={`p-2 rounded-lg ${
                            categoryColors[template.category]
                          }`}
                        >
                          <Icon className='h-4 w-4' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <CardTitle className='text-base'>{template.name}</CardTitle>
                          <CardDescription className='capitalize mt-1'>
                            {template.category}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-muted-foreground mb-3 line-clamp-2'>
                        {template.description}
                      </p>

                      <div className='flex items-center gap-2 text-xs text-muted-foreground mb-3'>
                        <div className='flex items-center gap-1'>
                          <div className='h-1.5 w-1.5 rounded-full bg-blue-500' />
                          {template.data.nodes.length} nodes
                        </div>
                        <div className='h-1 w-1 rounded-full bg-border' />
                        <div className='flex items-center gap-1'>
                          <div className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                          {template.data.edges.length} connections
                        </div>
                      </div>

                      <Button
                        className='w-full'
                        size='sm'
                        variant='outline'
                        onClick={() => createFromTemplate(template.id)}
                      >
                        <Sparkles className='mr-2 h-3.5 w-3.5' />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your flowchart.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => flowchartToDelete && handleDelete(flowchartToDelete)}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

// Grid Card Component
function FlowchartGridCard({
  flowchart,
  onDelete,
  onDuplicate,
}: {
  flowchart: Flowchart;
  onDelete: (id: string) => void;
  onDuplicate: (flowchart: Flowchart) => void;
}) {
  return (
    <Card className='group hover:border-primary transition-all hover:shadow-lg overflow-hidden p-0'>
      {/* Thumbnail */}
      <Link href={`/flowchart/${flowchart.id}`}>
        <div className='aspect-video bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 flex items-center justify-center relative overflow-hidden'>
          <div className='absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700 opacity-30' />
          <Workflow className='h-12 w-12 text-muted-foreground/30' />
          {flowchart.isPublic && (
            <div className='absolute top-2 right-2'>
              <Badge variant='secondary' className='gap-1'>
                <Globe className='h-3 w-3' />
                Shared
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardHeader className='pb-3 pt-6 px-6'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <Link href={`/flowchart/${flowchart.id}`}>
              <CardTitle className='text-base truncate hover:text-primary transition-colors'>
                {flowchart.name}
              </CardTitle>
            </Link>
            <CardDescription className='flex items-center gap-2 mt-1'>
              <Clock className='h-3 w-3' />
              <span>
                {formatDistanceToNow(new Date(flowchart.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild>
                <Link href={`/flowchart/${flowchart.id}`}>
                  <Eye className='mr-2 h-4 w-4' />
                  Open
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(flowchart)}>
                <Copy className='mr-2 h-4 w-4' />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive'
                onClick={() => onDelete(flowchart.id)}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className='px-6 pb-6'>
        {flowchart.description && (
          <p className='text-sm text-muted-foreground mb-3 line-clamp-2'>
            {flowchart.description}
          </p>
        )}

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <div className='h-1.5 w-1.5 rounded-full bg-blue-500' />
              {flowchart.data?.nodes?.length || 0} nodes
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
              {flowchart.data?.edges?.length || 0} edges
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// List Item Component
function FlowchartListItem({
  flowchart,
  onDelete,
  onDuplicate,
}: {
  flowchart: Flowchart;
  onDelete: (id: string) => void;
  onDuplicate: (flowchart: Flowchart) => void;
}) {
  return (
    <Card className='group hover:border-primary transition-all hover:shadow-md'>
      <CardContent className='p-4'>
        <div className='flex items-center gap-4'>
          {/* Thumbnail */}
          <Link href={`/flowchart/${flowchart.id}`}>
            <div className='w-24 h-16 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 flex items-center justify-center shrink-0'>
              <Workflow className='h-6 w-6 text-muted-foreground/40' />
            </div>
          </Link>

          {/* Info */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <Link href={`/flowchart/${flowchart.id}`}>
                <h3 className='font-semibold hover:text-primary transition-colors truncate'>
                  {flowchart.name}
                </h3>
              </Link>
              {flowchart.isPublic && (
                <Badge variant='secondary' className='gap-1'>
                  <Globe className='h-3 w-3' />
                  Shared
                </Badge>
              )}
            </div>
            {flowchart.description && (
              <p className='text-sm text-muted-foreground line-clamp-1 mb-2'>
                {flowchart.description}
              </p>
            )}
            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {formatDistanceToNow(new Date(flowchart.updatedAt), { addSuffix: true })}
              </span>
              <span className='flex items-center gap-1'>
                <div className='h-1.5 w-1.5 rounded-full bg-blue-500' />
                {flowchart.data?.nodes?.length || 0} nodes
              </span>
              <span className='flex items-center gap-1'>
                <div className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                {flowchart.data?.edges?.length || 0} edges
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center gap-2'>
            <Button asChild size='sm' variant='outline'>
              <Link href={`/flowchart/${flowchart.id}`}>
                <Eye className='h-4 w-4 mr-2' />
                Open
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-9 w-9'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => onDuplicate(flowchart)}>
                  <Copy className='mr-2 h-4 w-4' />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive'
                  onClick={() => onDelete(flowchart.id)}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
