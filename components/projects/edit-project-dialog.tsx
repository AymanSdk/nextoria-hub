"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  Loader2,
  Type,
  AlignLeft,
  ListTodo,
  Flag,
  Calendar as CalendarIcon,
  DollarSign,
  User,
  Palette,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  companyName: string | null;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  priority: number | null;
  color: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  budgetAmount: number | null;
  budgetCurrency: string | null;
  clientId: string | null;
}

interface EditProjectDialogProps {
  project: Project;
  clients?: Client[];
  trigger?: React.ReactNode;
}

export function EditProjectDialog({
  project,
  clients = [],
  trigger,
}: EditProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    status: project.status,
    priority: project.priority?.toString() || "1",
    color: project.color || "#0070f3",
    startDate: project.startDate
      ? new Date(project.startDate).toISOString().split("T")[0]
      : "",
    dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : "",
    budgetAmount: project.budgetAmount?.toString() || "",
    budgetCurrency: project.budgetCurrency || "USD",
    clientId: project.clientId || "",
  });

  // Update form data when project changes
  useEffect(() => {
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority?.toString() || "1",
      color: project.color || "#0070f3",
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : "",
      dueDate: project.dueDate
        ? new Date(project.dueDate).toISOString().split("T")[0]
        : "",
      budgetAmount: project.budgetAmount?.toString() || "",
      budgetCurrency: project.budgetCurrency || "USD",
      clientId: project.clientId || "",
    });
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${project.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          priority: parseInt(formData.priority),
          budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : null,
          clientId: formData.clientId || null,
          startDate: formData.startDate || null,
          dueDate: formData.dueDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update project");
      }

      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant='outline' size='sm'>
              <Pencil className='h-4 w-4 mr-2' />
              Edit Project
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-semibold'>Edit Project</DialogTitle>
            <DialogDescription className='text-base'>
              Update project details and settings
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800'>
                {error}
              </div>
            )}

            {/* Project Details Section */}
            <div className='space-y-4'>
              <div className='space-y-3'>
                <Label
                  htmlFor='name'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <Type className='h-4 w-4' />
                  Project Name <span className='text-red-500'>*</span>
                </Label>
                <InputGroup>
                  <InputGroupInput
                    id='name'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='Enter a descriptive project name'
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
                    placeholder='Provide detailed information about the project'
                    rows={4}
                  />
                </InputGroup>
              </div>
            </div>

            <Separator />

            {/* Status & Priority Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                Project Configuration
              </h3>
              <ButtonGroup className='w-full gap-4'>
                <div className='flex-1 space-y-2'>
                  <Label
                    htmlFor='status'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <ListTodo className='h-3.5 w-3.5' />
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id='status' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='DRAFT'>📝 Draft</SelectItem>
                      <SelectItem value='ACTIVE'>✅ Active</SelectItem>
                      <SelectItem value='ON_HOLD'>⏸️ On Hold</SelectItem>
                      <SelectItem value='COMPLETED'>🎉 Completed</SelectItem>
                      <SelectItem value='CANCELLED'>❌ Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex-1 space-y-2'>
                  <Label
                    htmlFor='priority'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <Flag className='h-3.5 w-3.5' />
                    Priority (0-10)
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id='priority'
                      type='number'
                      min='0'
                      max='10'
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      placeholder='0-10'
                      required
                    />
                  </InputGroup>
                </div>
              </ButtonGroup>
            </div>

            <Separator />

            {/* Client & Timeline Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                Client & Timeline
              </h3>

              <div className='space-y-2'>
                <Label
                  htmlFor='clientId'
                  className='text-xs font-medium flex items-center gap-2'
                >
                  <User className='h-3.5 w-3.5' />
                  Client
                </Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger id='clientId'>
                    <SelectValue placeholder='No client (optional)' />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                        {client.companyName && ` (${client.companyName})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ButtonGroup className='w-full gap-4'>
                <div className='flex-1 space-y-2'>
                  <Label
                    htmlFor='startDate'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <CalendarIcon className='h-3.5 w-3.5' />
                    Start Date
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id='startDate'
                      type='date'
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </InputGroup>
                </div>

                <div className='flex-1 space-y-2'>
                  <Label
                    htmlFor='dueDate'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <CalendarIcon className='h-3.5 w-3.5' />
                    Due Date
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id='dueDate'
                      type='date'
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </InputGroup>
                </div>
              </ButtonGroup>
            </div>

            <Separator />

            {/* Budget Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                Budget
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='md:col-span-2 space-y-2'>
                  <Label
                    htmlFor='budgetAmount'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <DollarSign className='h-3.5 w-3.5' />
                    Amount
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id='budgetAmount'
                      type='number'
                      min='0'
                      step='0.01'
                      value={formData.budgetAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, budgetAmount: e.target.value })
                      }
                      placeholder='0.00'
                    />
                  </InputGroup>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='budgetCurrency'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <DollarSign className='h-3.5 w-3.5' />
                    Currency
                  </Label>
                  <Select
                    value={formData.budgetCurrency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, budgetCurrency: value })
                    }
                  >
                    <SelectTrigger id='budgetCurrency' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='USD'>💵 USD ($)</SelectItem>
                      <SelectItem value='EUR'>💶 EUR (€)</SelectItem>
                      <SelectItem value='GBP'>💷 GBP (£)</SelectItem>
                      <SelectItem value='MAD'>🇲🇦 MAD (DH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Branding Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                Branding
              </h3>
              <div className='space-y-2'>
                <Label
                  htmlFor='color'
                  className='text-xs font-medium flex items-center gap-2'
                >
                  <Palette className='h-3.5 w-3.5' />
                  Project Color
                </Label>
                <div className='flex gap-3'>
                  <input
                    id='color'
                    type='color'
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className='w-14 h-10 rounded-md border cursor-pointer'
                  />
                  <InputGroup className='flex-1'>
                    <InputGroupInput
                      type='text'
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      placeholder='#0070f3'
                    />
                  </InputGroup>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className='flex items-center justify-between gap-3 pt-2'>
              <Button
                type='button'
                variant='outline'
                size='lg'
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button type='submit' size='lg' disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Pencil className='h-4 w-4 mr-2' />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
