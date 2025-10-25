"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Calendar as CalendarIcon,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  Mail,
  Image,
  Mic,
  BookOpen,
  Share2,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  Sparkles,
  Target,
  Zap,
  X,
  Type,
  AlignLeft,
  Tag,
  Hash,
  Loader2,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  parseISO,
  parse,
} from "date-fns";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  platform: string | null;
  publishDate: string | null;
  contentBody: string | null;
  tags: string | null;
  createdAt: string;
  assignedTo?: string | null;
  views?: string;
  engagement?: string;
}

type ViewMode = "calendar" | "list" | "kanban";

const CONTENT_TYPES = [
  { value: "BLOG_POST", label: "Blog Post", icon: FileText, color: "text-blue-500" },
  { value: "SOCIAL_POST", label: "Social Post", icon: Share2, color: "text-purple-500" },
  { value: "EMAIL", label: "Email", icon: Mail, color: "text-green-500" },
  { value: "VIDEO", label: "Video", icon: Video, color: "text-red-500" },
  { value: "INFOGRAPHIC", label: "Infographic", icon: Image, color: "text-yellow-500" },
  { value: "PODCAST", label: "Podcast", icon: Mic, color: "text-pink-500" },
  { value: "EBOOK", label: "eBook", icon: BookOpen, color: "text-indigo-500" },
  { value: "WEBINAR", label: "Webinar", icon: Video, color: "text-orange-500" },
  { value: "OTHER", label: "Other", icon: Sparkles, color: "text-gray-500" },
];

const CONTENT_STATUSES = [
  { value: "IDEA", label: "Idea", color: "bg-slate-500", variant: "secondary" as const },
  {
    value: "PLANNING",
    label: "Planning",
    color: "bg-gray-500",
    variant: "secondary" as const,
  },
  {
    value: "WRITING",
    label: "Writing",
    color: "bg-orange-500",
    variant: "default" as const,
  },
  {
    value: "REVIEW",
    label: "Review",
    color: "bg-yellow-500",
    variant: "default" as const,
  },
  {
    value: "APPROVED",
    label: "Approved",
    color: "bg-purple-500",
    variant: "default" as const,
  },
  {
    value: "SCHEDULED",
    label: "Scheduled",
    color: "bg-blue-500",
    variant: "default" as const,
  },
  {
    value: "PUBLISHED",
    label: "Published",
    color: "bg-green-500",
    variant: "default" as const,
  },
  {
    value: "ARCHIVED",
    label: "Archived",
    color: "bg-gray-400",
    variant: "outline" as const,
  },
];

const PLATFORMS = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "TWITTER", label: "Twitter" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "PINTEREST", label: "Pinterest" },
  { value: "OTHER", label: "Other" },
];

export default function ContentCalendarPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [error, setError] = useState("");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "BLOG_POST",
    status: "IDEA",
    platform: "",
    publishDate: "",
    publishTime: "",
    contentBody: "",
    tags: "",
  });

  useEffect(() => {
    fetchWorkspace();
  }, []);

  useEffect(() => {
    if (workspaceId) {
      fetchContentItems();
    }
  }, [currentDate, workspaceId]);

  const fetchWorkspace = async () => {
    try {
      // Fetch user's workspaces
      const response = await fetch("/api/user/workspace");
      const data = await response.json();

      if (data.success && data.data) {
        setWorkspaceId(data.data.id);
      }
    } catch (error) {
      console.error("Failed to fetch workspace:", error);
      setError("Failed to load workspace. Please refresh the page.");
    }
  };

  const fetchContentItems = async () => {
    if (!workspaceId) return;

    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const response = await fetch(
        `/api/content-calendar?workspaceId=${workspaceId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      const data = await response.json();

      if (data.success) {
        setContentItems(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch content calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    if (!workspaceId) {
      setError("Workspace not loaded. Please refresh the page.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Combine date and time if both are provided
      let publishDatetime = null;
      if (selectedDate) {
        if (formData.publishTime) {
          const [hours, minutes] = formData.publishTime.split(":");
          const datetime = new Date(selectedDate);
          datetime.setHours(parseInt(hours), parseInt(minutes));
          publishDatetime = datetime.toISOString();
        } else {
          publishDatetime = selectedDate.toISOString();
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        status: formData.status,
        platform: formData.platform || null,
        publishDate: publishDatetime,
        contentBody: formData.contentBody || null,
        tags: formData.tags || null,
        workspaceId: workspaceId,
      };

      console.log("Creating content with payload:", payload);

      const response = await fetch("/api/content-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        // More detailed error handling
        if (response.status === 401) {
          throw new Error("You need to be logged in to create content");
        } else if (response.status === 403) {
          throw new Error(
            data.error ||
              "You don't have permission to create content. Required role: ADMIN, DESIGNER, or MARKETER"
          );
        } else {
          throw new Error(data.error || `Server error (${response.status})`);
        }
      }

      if (data.success) {
        setIsCreateDialogOpen(false);
        resetForm();
        fetchContentItems();
      } else {
        throw new Error(data.error || "Failed to create content");
      }
    } catch (error: any) {
      console.error("Failed to create content:", error);
      setError(error.message || "Failed to create content. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateContent = async () => {
    if (!editingItem) return;
    setSubmitting(true);
    setError("");

    try {
      // Combine date and time if both are provided
      let publishDatetime = null;
      if (selectedDate) {
        if (formData.publishTime) {
          const [hours, minutes] = formData.publishTime.split(":");
          const datetime = new Date(selectedDate);
          datetime.setHours(parseInt(hours), parseInt(minutes));
          publishDatetime = datetime.toISOString();
        } else {
          publishDatetime = selectedDate.toISOString();
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        status: formData.status,
        platform: formData.platform || null,
        publishDate: publishDatetime,
        contentBody: formData.contentBody || null,
        tags: formData.tags || null,
      };

      console.log("Updating content with payload:", payload);

      const response = await fetch(`/api/content-calendar/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update content");
      }

      if (data.success) {
        setEditingItem(null);
        resetForm();
        fetchContentItems();
      } else {
        throw new Error(data.error || "Failed to update content");
      }
    } catch (error: any) {
      console.error("Failed to update content:", error);
      setError(error.message || "Failed to update content. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    try {
      const response = await fetch(`/api/content-calendar/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchContentItems();
      }
    } catch (error) {
      console.error("Failed to delete content:", error);
    }
  };

  const handleEditContent = (item: ContentItem) => {
    setEditingItem(item);

    // Parse publish date
    if (item.publishDate) {
      const date = parseISO(item.publishDate);
      setSelectedDate(date);
      setFormData({
        title: item.title,
        description: item.description || "",
        type: item.type,
        status: item.status,
        platform: item.platform || "",
        publishDate: "",
        publishTime: format(date, "HH:mm"),
        contentBody: item.contentBody || "",
        tags: item.tags || "",
      });
    } else {
      setSelectedDate(undefined);
      setFormData({
        title: item.title,
        description: item.description || "",
        type: item.type,
        status: item.status,
        platform: item.platform || "",
        publishDate: "",
        publishTime: "",
        contentBody: item.contentBody || "",
        tags: item.tags || "",
      });
    }

    setIsCreateDialogOpen(true);
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/content-calendar/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchContentItems();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "BLOG_POST",
      status: "IDEA",
      platform: "",
      publishDate: "",
      publishTime: "",
      contentBody: "",
      tags: "",
    });
    setSelectedDate(undefined);
    setError("");
  };

  const getStatusConfig = (status: string) => {
    return CONTENT_STATUSES.find((s) => s.value === status) || CONTENT_STATUSES[0];
  };

  const getTypeConfig = (type: string) => {
    return CONTENT_TYPES.find((t) => t.value === type) || CONTENT_TYPES[0];
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const getItemsForDate = (date: Date) => {
    return contentItems.filter(
      (item) => item.publishDate && isSameDay(new Date(item.publishDate), date)
    );
  };

  const filteredItems = contentItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || item.type === filterType;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesPlatform = filterPlatform === "all" || item.platform === filterPlatform;

    return matchesSearch && matchesType && matchesStatus && matchesPlatform;
  });

  const stats = {
    total: filteredItems.length,
    scheduled: filteredItems.filter((i) => i.status === "SCHEDULED").length,
    published: filteredItems.filter((i) => i.status === "PUBLISHED").length,
    inProgress: filteredItems.filter((i) => ["WRITING", "REVIEW"].includes(i.status))
      .length,
  };

  const groupedByStatus = CONTENT_STATUSES.map((status) => ({
    ...status,
    items: filteredItems.filter((item) => item.status === status.value),
  }));

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text'>
            Content Calendar
          </h1>
          <p className='text-muted-foreground mt-2 flex items-center gap-2'>
            <Target className='h-4 w-4' />
            Plan, schedule, and track your content across all channels
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2 shadow-lg'>
              <Plus className='h-4 w-4' />
              New Content
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-semibold'>
                {editingItem ? "Edit Content" : "Create New Content"}
              </DialogTitle>
              <DialogDescription className='text-base'>
                {editingItem
                  ? "Update your content item details and settings"
                  : "Add a new content item to your calendar and start planning"}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingItem ? handleUpdateContent() : handleCreateContent();
              }}
              className='space-y-6'
            >
              {error && (
                <div className='p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800'>
                  {error}
                </div>
              )}

              {/* Content Details Section */}
              <div className='space-y-4'>
                <div className='space-y-3'>
                  <Label
                    htmlFor='title'
                    className='text-sm font-medium flex items-center gap-2'
                  >
                    <Type className='h-4 w-4' />
                    Content Title <span className='text-destructive'>*</span>
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id='title'
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder='Enter a descriptive content title'
                      required
                    />
                  </InputGroup>
                </div>

                <div className='space-y-3'>
                  <Label
                    htmlFor='description'
                    className='text-sm font-medium flex items-center gap-2'
                  >
                    <AlignLeft className='h-4 w-4' />
                    Description
                  </Label>
                  <InputGroup>
                    <InputGroupTextarea
                      id='description'
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder='Brief description of the content piece'
                      rows={3}
                    />
                  </InputGroup>
                </div>
              </div>

              <Separator />

              {/* Content Configuration Section */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                  Content Configuration
                </h3>
                <ButtonGroup className='w-full gap-4'>
                  <div className='flex-1 space-y-2'>
                    <Label
                      htmlFor='type'
                      className='text-xs font-medium flex items-center gap-2'
                    >
                      <FileText className='h-3.5 w-3.5' />
                      Content Type <span className='text-destructive'>*</span>
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id='type' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className='flex items-center gap-2'>
                              <type.icon className={cn("h-4 w-4", type.color)} />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex-1 space-y-2'>
                    <Label
                      htmlFor='status'
                      className='text-xs font-medium flex items-center gap-2'
                    >
                      <Target className='h-3.5 w-3.5' />
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id='status' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className='flex items-center gap-2'>
                              <div className={cn("h-2 w-2 rounded-full", status.color)} />
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </ButtonGroup>

                <div className='space-y-2'>
                  <Label
                    htmlFor='platform'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <Share2 className='h-3.5 w-3.5' />
                    Platform
                  </Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) =>
                      setFormData({ ...formData, platform: value })
                    }
                  >
                    <SelectTrigger id='platform'>
                      <SelectValue placeholder='Select platform (optional)' />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Publishing Schedule Section */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                  Publishing Schedule
                </h3>
                <ButtonGroup className='w-full gap-4'>
                  <div className='flex-1 space-y-2'>
                    <Label className='text-xs font-medium flex items-center gap-2'>
                      <CalendarIcon className='h-3.5 w-3.5' />
                      Publish Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {selectedDate ? (
                            format(selectedDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className='flex-1 space-y-2'>
                    <Label
                      htmlFor='publishTime'
                      className='text-xs font-medium flex items-center gap-2'
                    >
                      <Clock className='h-3.5 w-3.5' />
                      Publish Time
                    </Label>
                    <InputGroup>
                      <InputGroupInput
                        id='publishTime'
                        type='time'
                        value={formData.publishTime}
                        onChange={(e) =>
                          setFormData({ ...formData, publishTime: e.target.value })
                        }
                      />
                    </InputGroup>
                  </div>
                </ButtonGroup>
              </div>

              <Separator />

              {/* Content Body Section */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                  Content & Metadata
                </h3>
                <div className='space-y-3'>
                  <Label
                    htmlFor='contentBody'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <AlignLeft className='h-3.5 w-3.5' />
                    Content Draft
                  </Label>
                  <InputGroup>
                    <InputGroupTextarea
                      id='contentBody'
                      value={formData.contentBody}
                      onChange={(e) =>
                        setFormData({ ...formData, contentBody: e.target.value })
                      }
                      placeholder='Start writing your content here...'
                      rows={8}
                    />
                  </InputGroup>
                </div>

                <div className='space-y-3'>
                  <Label
                    htmlFor='tags'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <Tag className='h-3.5 w-3.5' />
                    Tags
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id='tags'
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder='marketing, seo, tutorial (comma-separated)'
                    />
                  </InputGroup>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className='flex items-center justify-between gap-3 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='lg'
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <Button type='submit' size='lg' disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      {editingItem ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingItem ? (
                        <>
                          <Edit className='h-4 w-4 mr-2' />
                          Update Content
                        </>
                      ) : (
                        <>
                          <Plus className='h-4 w-4 mr-2' />
                          Create Content
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-border/60 hover:shadow-lg transition-all hover:border-primary/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Content</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-xs text-muted-foreground mt-1'>This month</p>
          </CardContent>
        </Card>

        <Card className='border-border/60 hover:shadow-lg transition-all hover:border-blue-500/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Scheduled</CardTitle>
            <Clock className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              {stats.scheduled}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>Ready to publish</p>
          </CardContent>
        </Card>

        <Card className='border-border/60 hover:shadow-lg transition-all hover:border-green-500/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Published</CardTitle>
            <CheckCircle2 className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
              {stats.published}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>Live content</p>
          </CardContent>
        </Card>

        <Card className='border-border/60 hover:shadow-lg transition-all hover:border-orange-500/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
            <AlertCircle className='h-4 w-4 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
              {stats.inProgress}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>Being created</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className='border-border/60'>
        <CardContent className='p-4'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search content...'
                className='pl-9'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className='w-full md:w-[180px]'>
                <Filter className='h-4 w-4 mr-2' />
                <SelectValue placeholder='Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                {CONTENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                {CONTENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder='Platform' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Platforms</SelectItem>
                {PLATFORMS.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={(v) => setViewMode(v as ViewMode)}
        className='space-y-4'
      >
        <div className='flex items-center justify-between'>
          <TabsList className='grid w-full max-w-md grid-cols-3'>
            <TabsTrigger value='calendar' className='gap-2'>
              <CalendarIcon className='h-4 w-4' />
              Calendar
            </TabsTrigger>
            <TabsTrigger value='kanban' className='gap-2'>
              <Grid3x3 className='h-4 w-4' />
              Kanban
            </TabsTrigger>
            <TabsTrigger value='list' className='gap-2'>
              <List className='h-4 w-4' />
              List
            </TabsTrigger>
          </TabsList>

          {viewMode === "calendar" && (
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
              <span className='ml-2 text-lg font-semibold min-w-[160px] text-center'>
                {format(currentDate, "MMMM yyyy")}
              </span>
            </div>
          )}
        </div>

        {/* Calendar View */}
        <TabsContent value='calendar' className='space-y-4 mt-0'>
          <Card className='border-border/60 overflow-hidden p-0'>
            <CardContent className='p-6'>
              <div className='grid grid-cols-7 gap-2'>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className='text-center font-semibold text-sm text-muted-foreground py-3 border-b'
                  >
                    {day}
                  </div>
                ))}

                {daysInMonth.map((day, idx) => {
                  const items = getItemsForDate(day);
                  const isCurrentDay = isToday(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "min-h-[120px] p-2 border rounded-lg transition-all hover:shadow-md cursor-pointer",
                        isCurrentDay
                          ? "bg-primary/5 border-primary/30 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/20",
                        !isCurrentMonth && "opacity-40"
                      )}
                    >
                      <div
                        className={cn(
                          "text-sm font-medium mb-2 flex items-center justify-center w-6 h-6 rounded-full",
                          isCurrentDay && "bg-primary text-primary-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                      <div className='space-y-1'>
                        {items.slice(0, 2).map((item) => {
                          const typeConfig = getTypeConfig(item.type);
                          const statusConfig = getStatusConfig(item.status);
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "text-xs p-1.5 rounded border-l-2 cursor-pointer transition-colors",
                                "bg-card hover:bg-accent group"
                              )}
                              style={{
                                borderLeftColor:
                                  statusConfig.color.replace("bg-", "var(--") + ")",
                              }}
                              title={item.title}
                            >
                              <div className='flex items-center gap-1 mb-0.5'>
                                <typeConfig.icon
                                  className={cn("h-3 w-3 shrink-0", typeConfig.color)}
                                />
                                <span className='font-medium truncate text-[10px]'>
                                  {statusConfig.label}
                                </span>
                              </div>
                              <div className='truncate text-[11px] font-medium'>
                                {item.title}
                              </div>
                            </div>
                          );
                        })}
                        {items.length > 2 && (
                          <div className='text-[10px] text-muted-foreground pl-1 font-medium'>
                            +{items.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kanban View */}
        <TabsContent value='kanban' className='space-y-4 mt-0'>
          <ScrollArea className='w-full'>
            <div className='flex gap-4 pb-4 min-w-max'>
              {groupedByStatus.map((statusGroup) => (
                <Card
                  key={statusGroup.value}
                  className='w-[320px] border-border/60 shrink-0'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className={cn("h-2 w-2 rounded-full", statusGroup.color)} />
                        <CardTitle className='text-sm font-semibold'>
                          {statusGroup.label}
                        </CardTitle>
                      </div>
                      <Badge variant='secondary' className='rounded-full'>
                        {statusGroup.items.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className='h-[600px] pr-4'>
                      <div className='space-y-2'>
                        {statusGroup.items.map((item) => {
                          const typeConfig = getTypeConfig(item.type);
                          return (
                            <Card
                              key={item.id}
                              className='p-3 cursor-pointer hover:shadow-md transition-all border-border/60 hover:border-primary/20'
                            >
                              <div className='space-y-2'>
                                <div className='flex items-start justify-between gap-2'>
                                  <div className='flex items-center gap-2'>
                                    <typeConfig.icon
                                      className={cn("h-4 w-4", typeConfig.color)}
                                    />
                                    <Badge variant='outline' className='text-[10px]'>
                                      {typeConfig.label}
                                    </Badge>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        className='h-6 w-6 p-0'
                                      >
                                        <MoreVertical className='h-3 w-3' />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleEditContent(item)}
                                      >
                                        <Edit className='mr-2 h-4 w-4' />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuLabel className='text-xs font-normal text-muted-foreground px-2 py-1.5'>
                                        Change Status
                                      </DropdownMenuLabel>
                                      {CONTENT_STATUSES.filter(
                                        (s) => s.value !== item.status
                                      )
                                        .slice(0, 3)
                                        .map((status) => (
                                          <DropdownMenuItem
                                            key={status.value}
                                            onClick={() =>
                                              handleQuickStatusChange(
                                                item.id,
                                                status.value
                                              )
                                            }
                                          >
                                            <div
                                              className={cn(
                                                "mr-2 h-2 w-2 rounded-full",
                                                status.color
                                              )}
                                            />
                                            Move to {status.label}
                                          </DropdownMenuItem>
                                        ))}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteContent(item.id)}
                                        className='text-destructive'
                                      >
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <h4 className='font-semibold text-sm line-clamp-2'>
                                  {item.title}
                                </h4>
                                {item.description && (
                                  <p className='text-xs text-muted-foreground line-clamp-2'>
                                    {item.description}
                                  </p>
                                )}
                                <div className='flex items-center justify-between pt-2 border-t'>
                                  {item.publishDate && (
                                    <div className='flex items-center gap-1 text-[10px] text-muted-foreground'>
                                      <Clock className='h-3 w-3' />
                                      {format(parseISO(item.publishDate), "MMM d")}
                                    </div>
                                  )}
                                  {item.platform && (
                                    <Badge variant='secondary' className='text-[10px]'>
                                      {item.platform}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                        {statusGroup.items.length === 0 && (
                          <div className='text-center py-8 text-muted-foreground text-sm'>
                            No content in {statusGroup.label.toLowerCase()}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* List View */}
        <TabsContent value='list' className='space-y-3 mt-0'>
          {loading ? (
            <Card>
              <CardContent className='text-center py-12'>
                <p className='text-muted-foreground'>Loading content...</p>
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className='border-dashed border-2'>
              <CardContent className='text-center py-16'>
                <Sparkles className='h-12 w-12 mx-auto text-muted-foreground/50 mb-4' />
                <h3 className='font-semibold text-lg mb-2'>No content found</h3>
                <p className='text-muted-foreground mb-4'>
                  {searchQuery || filterType !== "all" || filterStatus !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by creating your first content item"}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => {
              const typeConfig = getTypeConfig(item.type);
              const statusConfig = getStatusConfig(item.status);
              return (
                <Card
                  key={item.id}
                  className='border-border/60 hover:shadow-lg transition-all hover:border-primary/20 cursor-pointer group'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='space-y-2 flex-1'>
                        <div className='flex items-center gap-2'>
                          <typeConfig.icon className={cn("h-5 w-5", typeConfig.color)} />
                          <CardTitle className='text-lg group-hover:text-primary transition-colors'>
                            {item.title}
                          </CardTitle>
                        </div>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <Badge
                            variant={statusConfig.variant}
                            className={cn("gap-1", statusConfig.color)}
                          >
                            {statusConfig.label}
                          </Badge>
                          <Badge variant='outline'>{typeConfig.label}</Badge>
                          {item.platform && (
                            <Badge variant='secondary'>{item.platform}</Badge>
                          )}
                          {item.publishDate && (
                            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                              <Clock className='h-3 w-3' />
                              {format(
                                parseISO(item.publishDate),
                                "MMM d, yyyy 'at' h:mm a"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditContent(item)}>
                            <Edit className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuLabel className='text-xs font-normal text-muted-foreground px-2 py-1.5'>
                            Change Status
                          </DropdownMenuLabel>
                          {CONTENT_STATUSES.filter((s) => s.value !== item.status)
                            .slice(0, 3)
                            .map((status) => (
                              <DropdownMenuItem
                                key={status.value}
                                onClick={() =>
                                  handleQuickStatusChange(item.id, status.value)
                                }
                              >
                                <div
                                  className={cn(
                                    "mr-2 h-2 w-2 rounded-full",
                                    status.color
                                  )}
                                />
                                Move to {status.label}
                              </DropdownMenuItem>
                            ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteContent(item.id)}
                            className='text-destructive'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  {item.description && (
                    <CardContent className='pt-0'>
                      <p className='text-sm text-muted-foreground line-clamp-2'>
                        {item.description}
                      </p>
                      {item.tags && (
                        <div className='flex items-center gap-1 mt-3 flex-wrap'>
                          {item.tags.split(",").map((tag, idx) => (
                            <Badge key={idx} variant='outline' className='text-[10px]'>
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
