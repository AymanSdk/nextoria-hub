"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Users,
  Calendar as CalendarIcon,
  DollarSign,
  Palette,
  AlertCircle,
  CheckCircle2,
  Building2,
  Flag,
  Activity,
} from "lucide-react";

const COLORS = [
  { name: "Blue", value: "#0070f3" },
  { name: "Purple", value: "#7928ca" },
  { name: "Pink", value: "#ff0080" },
  { name: "Green", value: "#00d924" },
  { name: "Orange", value: "#ff6b35" },
  { name: "Red", value: "#f43f5e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Rose", value: "#fb7185" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Lime", value: "#84cc16" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Sky", value: "#0ea5e9" },
];

const STATUS_OPTIONS = [
  {
    value: "DRAFT",
    label: "Draft",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    ringColor: "ring-slate-200",
  },
  {
    value: "ACTIVE",
    label: "Active",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    ringColor: "ring-emerald-200",
  },
  {
    value: "ON_HOLD",
    label: "On Hold",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    ringColor: "ring-amber-200",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    ringColor: "ring-blue-200",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    ringColor: "ring-rose-200",
  },
];

const PRIORITY_OPTIONS = [
  {
    value: "0",
    label: "Low",
    color: "text-slate-600",
    iconColor: "text-slate-400",
    bgColor: "bg-slate-50",
    ringColor: "ring-slate-200",
  },
  {
    value: "1",
    label: "Medium",
    color: "text-sky-700",
    iconColor: "text-sky-500",
    bgColor: "bg-sky-50",
    ringColor: "ring-sky-200",
  },
  {
    value: "2",
    label: "High",
    color: "text-amber-700",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
    ringColor: "ring-amber-200",
  },
  {
    value: "3",
    label: "Critical",
    color: "text-rose-700",
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50",
    ringColor: "ring-rose-200",
  },
];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD", symbol: "$" },
  { value: "EUR", label: "EUR", symbol: "€" },
  { value: "GBP", label: "GBP", symbol: "£" },
  { value: "CAD", label: "CAD", symbol: "C$" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<
    Array<{ id: string; name: string; companyName: string | null }>
  >([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    clientId: "",
    status: "DRAFT",
    priority: "0",
    color: "#0070f3",
    startDate: "",
    dueDate: "",
    budgetAmount: "",
    budgetCurrency: "USD",
  });

  const [startDate, setStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const workspaceRes = await fetch("/api/workspaces");
      const workspaceData = await workspaceRes.json();
      const workspaceId = workspaceData.workspaces[0]?.id;

      if (!workspaceId) return;

      const res = await fetch(`/api/clients?workspaceId=${workspaceId}`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // First, get the workspace ID
      const workspaceRes = await fetch("/api/workspaces");
      const workspaceData = await workspaceRes.json();

      if (!workspaceData.workspaces || workspaceData.workspaces.length === 0) {
        setError("No workspace found. Please create a workspace first.");
        setLoading(false);
        return;
      }

      const workspaceId = workspaceData.workspaces[0].id;

      const projectData = {
        ...formData,
        workspaceId,
        clientId: formData.clientId || undefined,
        priority: parseInt(formData.priority),
        budgetAmount: formData.budgetAmount
          ? parseInt(formData.budgetAmount) * 100 // Convert to cents
          : undefined,
        startDate: formData.startDate || undefined,
        dueDate: formData.dueDate || undefined,
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      router.push(`/projects/${data.project.slug}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Header */}
      <div className='mb-8 space-y-4'>
        <Link href='/projects'>
          <Button variant='ghost' size='sm' className='gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Back to Projects
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Create New Project</h1>
          <p className='text-muted-foreground mt-2'>
            Set up a new project to organize your work and collaborate with your team
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className='mb-6 rounded-lg border border-destructive bg-destructive/10 p-4'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
            <div>
              <h3 className='font-semibold text-destructive'>Error</h3>
              <p className='text-sm text-destructive/90 mt-1'>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Information Section */}
        <Card className='border-border/60'>
          <CardHeader className='pb-5'>
            <div className='flex items-center gap-3.5'>
              <div className='rounded-lg bg-muted/60 p-2.5 ring-1 ring-border/50'>
                <FileText className='h-4.5 w-4.5 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-lg'>Basic Information</CardTitle>
                <CardDescription className='text-sm mt-1'>
                  Start with the project name and description
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              {/* Project Name */}
              <div className='space-y-2'>
                <Label htmlFor='name'>
                  Project Name <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder='e.g., Website Redesign'
                  required
                />
              </div>

              {/* Slug */}
              <div className='space-y-2'>
                <Label htmlFor='slug'>
                  Project URL Slug <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='slug'
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder='e.g., website-redesign'
                  required
                  pattern='^[a-z0-9-]+$'
                  className='font-mono'
                />
                <p className='text-xs text-muted-foreground'>
                  Only lowercase letters, numbers, and hyphens
                </p>
              </div>
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Provide a brief description of the project goals, scope, and deliverables...'
                rows={4}
                className='resize-none'
              />
            </div>
          </CardContent>
        </Card>

        {/* Client & Project Settings Section */}
        <Card className='border-border/60'>
          <CardHeader className='pb-5'>
            <div className='flex items-center gap-3.5'>
              <div className='rounded-lg bg-muted/60 p-2.5 ring-1 ring-border/50'>
                <Users className='h-4.5 w-4.5 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-lg'>Client & Project Settings</CardTitle>
                <CardDescription className='text-sm mt-1'>
                  Assign a client and configure project status and priority
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-7'>
            {/* Client Selection */}
            <div className='space-y-4'>
              <Label
                htmlFor='clientId'
                className='flex items-center gap-2 text-sm font-medium text-muted-foreground'
              >
                <Building2 className='h-4 w-4' />
                Client Assignment
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger
                  id='clientId'
                  className='h-11 bg-background border-border/50 hover:border-border hover:bg-muted/30 transition-colors'
                >
                  <SelectValue placeholder='Select a client (optional)' />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className='flex items-center gap-2.5'>
                        <div className='flex h-7 w-7 items-center justify-center rounded-md bg-muted'>
                          <Building2 className='h-3.5 w-3.5 text-muted-foreground' />
                        </div>
                        <span>
                          {client.name}
                          {client.companyName && (
                            <span className='text-muted-foreground/70 ml-1.5 text-xs'>
                              ({client.companyName})
                            </span>
                          )}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clients.length === 0 && (
                <div className='flex items-start gap-2.5 rounded-lg bg-muted/40 p-3 border border-border/50'>
                  <AlertCircle className='h-4 w-4 text-muted-foreground mt-0.5 shrink-0' />
                  <p className='text-sm text-muted-foreground'>
                    No clients available.{" "}
                    <Link
                      href='/clients'
                      className='text-foreground hover:underline font-medium'
                    >
                      Add one now
                    </Link>
                  </p>
                </div>
              )}
            </div>

            <div className='h-px bg-border/60' />

            {/* Project Status */}
            <div className='space-y-4'>
              <Label className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Activity className='h-4 w-4' />
                Project Status
              </Label>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5'>
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => setFormData({ ...formData, status: option.value })}
                    className={`group relative flex flex-col items-center justify-center gap-2 p-3.5 rounded-lg border transition-all duration-200 ${
                      formData.status === option.value
                        ? `${option.bgColor} border-transparent ring-1 ${option.ringColor} shadow-sm`
                        : "bg-background border-border/50 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    {formData.status === option.value && (
                      <CheckCircle2 className={`h-4 w-4 ${option.color}`} />
                    )}
                    <span
                      className={`text-xs font-medium transition-colors ${
                        formData.status === option.value
                          ? option.color
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className='h-px bg-border' />

            {/* Project Priority */}
            <div className='space-y-4'>
              <Label className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Flag className='h-4 w-4' />
                Project Priority
              </Label>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5'>
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => setFormData({ ...formData, priority: option.value })}
                    className={`group relative flex flex-col items-center justify-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                      formData.priority === option.value
                        ? `${option.bgColor} border-transparent ring-1 ${option.ringColor} shadow-sm`
                        : "bg-background border-border/50 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <Flag
                      className={`h-5 w-5 transition-colors ${
                        formData.priority === option.value
                          ? option.iconColor
                          : "text-muted-foreground/40 group-hover:text-muted-foreground/60"
                      }`}
                    />
                    <div className='flex flex-col items-center gap-1.5'>
                      <span
                        className={`text-xs font-medium transition-colors ${
                          formData.priority === option.value
                            ? option.color
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {option.label}
                      </span>
                      {formData.priority === option.value && (
                        <CheckCircle2 className={`h-3.5 w-3.5 ${option.color}`} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Section */}
        <Card className='border-border/60'>
          <CardHeader className='pb-5'>
            <div className='flex items-center gap-3.5'>
              <div className='rounded-lg bg-muted/60 p-2.5 ring-1 ring-border/50'>
                <CalendarIcon className='h-4.5 w-4.5 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-lg'>Timeline</CardTitle>
                <CardDescription className='text-sm mt-1'>
                  Define the project schedule and key dates
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2'>
              {/* Start Date */}
              <div className='space-y-2'>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      className={`w-full justify-start text-left font-normal ${
                        !startDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setFormData({
                          ...formData,
                          startDate: date ? format(date, "yyyy-MM-dd") : "",
                        });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Due Date */}
              <div className='space-y-2'>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      className={`w-full justify-start text-left font-normal ${
                        !dueDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date);
                        setFormData({
                          ...formData,
                          dueDate: date ? format(date, "yyyy-MM-dd") : "",
                        });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Section */}
        <Card className='border-border/60'>
          <CardHeader className='pb-5'>
            <div className='flex items-center gap-3.5'>
              <div className='rounded-lg bg-muted/60 p-2.5 ring-1 ring-border/50'>
                <DollarSign className='h-4.5 w-4.5 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-lg'>Budget</CardTitle>
                <CardDescription className='text-sm mt-1'>
                  Set the project budget and currency
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Label htmlFor='budgetAmount'>Budget Amount</Label>
              <ButtonGroup className='w-full'>
                <InputGroup className='flex-1'>
                  <InputGroupAddon align='inline-start'>
                    <InputGroupText>
                      {
                        CURRENCY_OPTIONS.find((c) => c.value === formData.budgetCurrency)
                          ?.symbol
                      }
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id='budgetAmount'
                    type='number'
                    value={formData.budgetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, budgetAmount: e.target.value })
                    }
                    placeholder='0.00'
                    step='0.01'
                    min='0'
                    className='rounded-r-none'
                  />
                </InputGroup>
                <Select
                  value={formData.budgetCurrency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, budgetCurrency: value })
                  }
                >
                  <SelectTrigger
                    id='budgetCurrency'
                    className='w-32 rounded-l-none border-l-0'
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.symbol} {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </ButtonGroup>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className='border-border/60'>
          <CardHeader className='pb-5'>
            <div className='flex items-center gap-3.5'>
              <div className='rounded-lg bg-muted/60 p-2.5 ring-1 ring-border/50'>
                <Palette className='h-4.5 w-4.5 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-lg'>Appearance</CardTitle>
                <CardDescription className='text-sm mt-1'>
                  Choose a color to identify this project
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-5'>
            <div className='space-y-4'>
              <Label className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Palette className='h-4 w-4' />
                Project Color Theme
              </Label>
              <div className='grid grid-cols-8 gap-2.5'>
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type='button'
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`group relative w-full aspect-square rounded-md border transition-all duration-200 hover:scale-105 ${
                      formData.color === color.value
                        ? "border-border ring-2 ring-offset-1 ring-border/40 scale-105 shadow-sm"
                        : "border-border/40 hover:border-border"
                    }`}
                    title={color.name}
                  >
                    <div
                      className='absolute inset-0.5 rounded-sm transition-all'
                      style={{ backgroundColor: color.value }}
                    />
                    {formData.color === color.value && (
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <CheckCircle2 className='h-4 w-4 text-white drop-shadow-lg' />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Color Input */}
              <div className='space-y-2.5 pt-1'>
                <Label className='text-sm text-muted-foreground'>
                  Or enter custom color
                </Label>
                <ButtonGroup className='w-full'>
                  <label
                    htmlFor='customColor'
                    className='w-14 border rounded-l-md cursor-pointer hover:opacity-90 transition-opacity'
                    style={{ backgroundColor: formData.color }}
                  >
                    <input
                      id='customColor'
                      type='color'
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className='sr-only'
                    />
                  </label>
                  <Input
                    type='text'
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder='#0070f3'
                    className='rounded-l-none border-l-0 font-mono'
                  />
                </ButtonGroup>
              </div>

              <div className='flex items-start gap-2 rounded-lg bg-muted/50 p-3'>
                <AlertCircle className='h-4 w-4 text-muted-foreground shrink-0 mt-0.5' />
                <p className='text-xs text-muted-foreground'>
                  The selected color will be used for visual identification across the
                  project, including tags, labels, and project cards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className='flex items-center justify-end gap-3 pt-4'>
          <Link href='/projects'>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </Link>
          <Button type='submit' disabled={loading}>
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
