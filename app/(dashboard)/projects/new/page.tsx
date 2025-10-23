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
  { value: "DRAFT", label: "Draft", color: "text-slate-600", bgColor: "bg-slate-100" },
  { value: "ACTIVE", label: "Active", color: "text-green-600", bgColor: "bg-green-100" },
  {
    value: "ON_HOLD",
    label: "On Hold",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
];

const PRIORITY_OPTIONS = [
  { value: "0", label: "Low", color: "text-slate-600", bgColor: "bg-slate-100" },
  { value: "1", label: "Medium", color: "text-blue-600", bgColor: "bg-blue-100" },
  { value: "2", label: "High", color: "text-orange-600", bgColor: "bg-orange-100" },
  { value: "3", label: "Critical", color: "text-red-600", bgColor: "bg-red-100" },
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
    <div className='container max-w-5xl mx-auto py-8 px-4 md:px-6'>
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
        <Card>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-primary/10 p-2 text-primary'>
                <FileText className='h-5 w-5' />
              </div>
              <div>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
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

        {/* Client & Status Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-primary/10 p-2 text-primary'>
                <Users className='h-5 w-5' />
              </div>
              <div>
                <CardTitle>Client & Project Settings</CardTitle>
                <CardDescription>
                  Assign a client and configure project status and priority
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 lg:grid-cols-[2fr_1fr_1fr]'>
              {/* Client Selection */}
              <div className='space-y-2'>
                <Label htmlFor='clientId' className='flex items-center gap-2'>
                  <Building2 className='h-3.5 w-3.5 text-muted-foreground' />
                  Client
                </Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger id='clientId'>
                    <SelectValue placeholder='Select client' />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className='flex items-center gap-2'>
                          <Building2 className='h-3.5 w-3.5 text-muted-foreground' />
                          {client.companyName || client.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clients.length === 0 && (
                  <p className='text-xs text-muted-foreground'>
                    No clients.{" "}
                    <Link
                      href='/clients'
                      className='text-primary hover:underline font-medium'
                    >
                      Add one
                    </Link>
                  </p>
                )}
              </div>

              {/* Status */}
              <div className='space-y-2'>
                <Label htmlFor='status' className='flex items-center gap-2'>
                  <Activity className='h-3.5 w-3.5 text-muted-foreground' />
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id='status'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`inline-flex w-2 h-2 rounded-full ${option.bgColor}`}
                          />
                          <span className={option.color}>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className='space-y-2'>
                <Label htmlFor='priority' className='flex items-center gap-2'>
                  <Flag className='h-3.5 w-3.5 text-muted-foreground' />
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id='priority'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className='flex items-center gap-2'>
                          <Flag className={`h-3.5 w-3.5 ${option.color}`} />
                          <span className={option.color}>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-primary/10 p-2 text-primary'>
                <CalendarIcon className='h-5 w-5' />
              </div>
              <div>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>
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
        <Card>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-primary/10 p-2 text-primary'>
                <DollarSign className='h-5 w-5' />
              </div>
              <div>
                <CardTitle>Budget</CardTitle>
                <CardDescription>Set the project budget and currency</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-[1fr_auto]'>
              {/* Budget Amount with Currency Symbol */}
              <div className='space-y-2'>
                <Label htmlFor='budgetAmount'>Budget Amount</Label>
                <InputGroup>
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
                  />
                </InputGroup>
              </div>

              {/* Currency */}
              <div className='space-y-2'>
                <Label htmlFor='budgetCurrency'>Currency</Label>
                <Select
                  value={formData.budgetCurrency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, budgetCurrency: value })
                  }
                >
                  <SelectTrigger id='budgetCurrency' className='w-[120px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-primary/10 p-2 text-primary'>
                <Palette className='h-5 w-5' />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Choose a color to identify this project</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Palette className='h-4 w-4 text-muted-foreground' />
                <Label className='text-sm font-semibold'>Project Color Theme</Label>
              </div>
              <div className='grid grid-cols-8 gap-3'>
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type='button'
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`group relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md ${
                      formData.color === color.value
                        ? "border-primary ring-2 ring-primary/30 scale-105 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                    title={color.name}
                  >
                    <div
                      className='absolute inset-1 rounded-md transition-all'
                      style={{ backgroundColor: color.value }}
                    />
                    {formData.color === color.value && (
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <CheckCircle2 className='h-5 w-5 text-white drop-shadow-lg' />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className='flex items-start gap-2 rounded-lg bg-muted/50 p-3 mt-4'>
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
