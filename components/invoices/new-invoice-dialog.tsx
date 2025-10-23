"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Loader2,
  User,
  FolderKanban,
  Calendar,
  Receipt,
  FileText,
  Percent,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
}

export function NewInvoiceDialog({
  children,
  workspaceId,
}: {
  children?: React.ReactNode;
  workspaceId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

  // Log workspaceId on component mount/update
  useEffect(() => {
    console.log("NewInvoiceDialog - workspaceId:", workspaceId);
  }, [workspaceId]);

  // Form state
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "SENT">("DRAFT");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const fetchClientsAndProjects = useCallback(async () => {
    setLoadingData(true);
    try {
      // Try to fetch from clients table first
      if (workspaceId) {
        const clientsRes = await fetch(`/api/clients?workspaceId=${workspaceId}`);
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          console.log("Fetched clients from /api/clients:", clientsData.clients);
          if (clientsData.clients && clientsData.clients.length > 0) {
            const formattedClients = clientsData.clients.map(
              (client: {
                id: string;
                name: string;
                email: string;
                companyName?: string;
              }) => ({
                id: client.id,
                name: client.companyName || client.name,
                email: client.email,
              })
            );
            setClients(formattedClients);
          } else {
            // Fallback to users with CLIENT role if no clients in clients table
            console.log("No clients in clients table, trying users with CLIENT role");
            await fetchClientUsers();
          }
        } else {
          console.error("Failed to fetch clients:", clientsRes.status);
          // Fallback to users with CLIENT role
          await fetchClientUsers();
        }
      } else {
        // If no workspaceId, fetch users with CLIENT role
        console.log("No workspaceId provided, fetching users with CLIENT role");
        await fetchClientUsers();
      }

      // Fetch projects (only if workspaceId is provided)
      if (workspaceId) {
        console.log("Fetching projects for workspaceId:", workspaceId);
        const projectsRes = await fetch(`/api/projects?workspaceId=${workspaceId}`);
        console.log("Projects API response status:", projectsRes.status);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          console.log("Fetched projects data:", projectsData);
          console.log("Projects array:", projectsData.projects);
          console.log("Number of projects:", projectsData.projects?.length || 0);

          if (projectsData.projects && Array.isArray(projectsData.projects)) {
            const formattedProjects = projectsData.projects.map(
              (project: { id: string; name: string; slug?: string }) => ({
                id: project.id,
                name: project.name,
              })
            );
            console.log("Formatted projects:", formattedProjects);
            setProjects(formattedProjects);
          } else {
            console.warn("Projects data is not in expected format");
            setProjects([]);
          }
        } else {
          const errorText = await projectsRes.text();
          console.error("Failed to fetch projects:", projectsRes.status, errorText);
        }
      } else {
        console.warn("No workspaceId provided, cannot fetch projects");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load clients and projects");
    } finally {
      setLoadingData(false);
    }
  }, [workspaceId]);

  const fetchClientUsers = async () => {
    const usersRes = await fetch("/api/users?role=CLIENT");
    if (usersRes.ok) {
      const usersData = await usersRes.json();
      const clientUsers =
        usersData.users
          ?.filter((user: { role: string }) => user.role === "CLIENT")
          ?.map((user: { id: string; name: string; email: string }) => ({
            id: user.id,
            name: user.name || user.email,
            email: user.email,
          })) || [];
      console.log("Fetched client users from /api/users:", clientUsers);
      setClients(clientUsers);
    } else {
      console.error("Failed to fetch client users:", usersRes.status);
    }
  };

  // Fetch clients and projects when dialog opens
  useEffect(() => {
    if (open) {
      if (!workspaceId) {
        console.error("Cannot fetch data: workspaceId is missing!");
        toast.error("Workspace not found. Please refresh the page.");
        return;
      }
      fetchClientsAndProjects();
    }
  }, [open, fetchClientsAndProjects, workspaceId]);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return Math.round((subtotal * taxRate) / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast.error("Please select a client");
      return;
    }

    if (lineItems.some((item) => !item.description || item.unitPrice <= 0)) {
      toast.error("All line items must have a description and unit price");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          projectId: projectId || null,
          lineItems: lineItems.map((item) => ({
            ...item,
            unitPrice: Math.round(item.unitPrice * 100), // Convert to cents
          })),
          dueDate: dueDate || null,
          taxRate: Math.round(taxRate * 100), // Convert to basis points
          notes,
          terms,
          status,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create invoice");
      }

      const { invoice } = await response.json();

      toast.success("Invoice created successfully");

      setOpen(false);
      router.refresh();

      // Reset form
      setClientId("");
      setProjectId("");
      setDueDate("");
      setTaxRate(0);
      setNotes("");
      setTerms("");
      setStatus("DRAFT");
      setLineItems([{ description: "", quantity: 1, unitPrice: 0 }]);

      // Navigate to invoice detail page
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create invoice";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-4 border-b'>
          <DialogTitle className='text-2xl font-bold flex items-center gap-2'>
            <Receipt className='h-6 w-6 text-primary' />
            Create New Invoice
            {loadingData && (
              <Loader2 className='h-4 w-4 animate-spin text-muted-foreground ml-2' />
            )}
          </DialogTitle>
          <DialogDescription className='text-base'>
            {loadingData
              ? "Loading clients and projects..."
              : "Fill in the details below to generate a professional invoice"}
          </DialogDescription>
          {/* Debug info - remove after testing */}
          {!loadingData && (
            <div className='text-xs text-muted-foreground mt-2'>
              Debug: {clients.length} clients, {projects.length} projects, workspaceId:{" "}
              {workspaceId || "missing"}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-8 py-4'>
          {/* Basic Information Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2 text-sm font-semibold text-foreground/80 uppercase tracking-wide'>
              <FileText className='h-4 w-4' />
              Basic Information
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border'>
              {/* Client Selection */}
              <div className='space-y-2'>
                <Label htmlFor='client' className='flex items-center gap-2 font-medium'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  Client *
                </Label>
                <Select
                  value={clientId}
                  onValueChange={setClientId}
                  disabled={loadingData}
                >
                  <SelectTrigger className='bg-background'>
                    <SelectValue
                      placeholder={loadingData ? "Loading clients..." : "Select client"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length > 0 ? (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name || client.email}
                        </SelectItem>
                      ))
                    ) : (
                      <div className='px-2 py-6 text-center text-sm text-muted-foreground'>
                        No clients found. Add clients in Team page.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {!loadingData && clients.length === 0 && (
                  <p className='text-xs text-muted-foreground'>
                    No clients available. Please add clients with CLIENT role in the Team
                    page.
                  </p>
                )}
              </div>

              {/* Project Selection (Optional) */}
              <div className='space-y-2'>
                <Label htmlFor='project' className='flex items-center gap-2 font-medium'>
                  <FolderKanban className='h-4 w-4 text-muted-foreground' />
                  Project (Optional)
                </Label>
                <Select
                  value={projectId}
                  onValueChange={setProjectId}
                  disabled={loadingData || !workspaceId}
                >
                  <SelectTrigger className='bg-background'>
                    <SelectValue
                      placeholder={
                        !workspaceId
                          ? "Workspace not found"
                          : loadingData
                          ? "Loading projects..."
                          : "Select project (optional)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className='px-2 py-6 text-center text-sm text-muted-foreground'>
                        {!workspaceId ? "Workspace not found" : "No projects found"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {!loadingData && workspaceId && projects.length === 0 && (
                  <p className='text-xs text-muted-foreground'>
                    No projects available in this workspace. Create a project first.
                  </p>
                )}
                {!workspaceId && (
                  <p className='text-xs text-destructive'>
                    Workspace not found. Please refresh the page.
                  </p>
                )}
              </div>

              {/* Due Date */}
              <div className='space-y-2'>
                <Label htmlFor='dueDate' className='flex items-center gap-2 font-medium'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  Due Date
                </Label>
                <Input
                  id='dueDate'
                  type='date'
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className='bg-background'
                />
              </div>

              {/* Tax Rate */}
              <div className='space-y-2'>
                <Label htmlFor='taxRate' className='flex items-center gap-2 font-medium'>
                  <Percent className='h-4 w-4 text-muted-foreground' />
                  Tax Rate (%)
                </Label>
                <Input
                  id='taxRate'
                  type='number'
                  min='0'
                  max='100'
                  step='0.01'
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder='0.00'
                  className='bg-background'
                />
              </div>

              {/* Status */}
              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='status' className='flex items-center gap-2 font-medium'>
                  <Receipt className='h-4 w-4 text-muted-foreground' />
                  Invoice Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as "DRAFT" | "SENT")}
                >
                  <SelectTrigger className='bg-background'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='DRAFT'>Draft</SelectItem>
                    <SelectItem value='SENT'>Sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Line Items Section */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-sm font-semibold text-foreground/80 uppercase tracking-wide'>
                <Receipt className='h-4 w-4' />
                Line Items *
              </div>
              <Button type='button' variant='outline' size='sm' onClick={addLineItem}>
                <Plus className='mr-2 h-4 w-4' />
                Add Item
              </Button>
            </div>

            <div className='rounded-lg border bg-muted/20 overflow-hidden'>
              {/* Table Header */}
              <div className='grid grid-cols-12 gap-2 px-4 py-3 bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase'>
                <div className='col-span-5'>Description</div>
                <div className='col-span-2 text-center'>Quantity</div>
                <div className='col-span-2 text-right'>Unit Price</div>
                <div className='col-span-2 text-right'>Amount</div>
                <div className='col-span-1'></div>
              </div>

              {/* Line Items */}
              <div className='divide-y bg-background'>
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    className='grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/20 transition-colors'
                  >
                    <div className='col-span-5'>
                      <Input
                        placeholder='Item description'
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, "description", e.target.value)
                        }
                        className='h-9 border-0 bg-transparent focus-visible:ring-1'
                      />
                    </div>
                    <div className='col-span-2'>
                      <Input
                        type='number'
                        placeholder='1'
                        min='1'
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(index, "quantity", parseInt(e.target.value) || 1)
                        }
                        className='h-9 text-center border-0 bg-transparent focus-visible:ring-1'
                      />
                    </div>
                    <div className='col-span-2'>
                      <div className='relative'>
                        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm'>
                          $
                        </span>
                        <Input
                          type='number'
                          placeholder='0.00'
                          min='0'
                          step='0.01'
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(
                              index,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className='h-9 pl-6 text-right border-0 bg-transparent focus-visible:ring-1'
                        />
                      </div>
                    </div>
                    <div className='col-span-2 text-right'>
                      <span className='text-sm font-semibold'>
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className='col-span-1 flex justify-end'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-muted-foreground hover:text-destructive'
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className='px-4 py-4 bg-muted/30 border-t space-y-2'>
                <div className='flex justify-between text-sm text-muted-foreground'>
                  <span>Subtotal</span>
                  <span className='font-medium text-foreground'>
                    ${calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between text-sm text-muted-foreground'>
                  <span>Tax ({taxRate}%)</span>
                  <span className='font-medium text-foreground'>
                    ${calculateTax().toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className='flex justify-between text-lg font-bold pt-1'>
                  <span>Total</span>
                  <span className='text-primary'>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2 text-sm font-semibold text-foreground/80 uppercase tracking-wide'>
              <FileText className='h-4 w-4' />
              Additional Information
            </div>

            <div className='space-y-4 p-4 bg-muted/30 rounded-lg border'>
              {/* Notes */}
              <div className='space-y-2'>
                <Label htmlFor='notes' className='font-medium'>
                  Notes
                </Label>
                <Textarea
                  id='notes'
                  placeholder='Additional notes or special instructions for the client...'
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className='bg-background resize-none'
                />
              </div>

              {/* Terms */}
              <div className='space-y-2'>
                <Label htmlFor='terms' className='font-medium'>
                  Terms & Conditions
                </Label>
                <Textarea
                  id='terms'
                  placeholder='Payment terms, due dates, late fees, etc...'
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className='bg-background resize-none'
                />
              </div>
            </div>
          </div>

          <DialogFooter className='pt-6 border-t gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={loading}
              className='min-w-[100px]'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading} className='min-w-[140px]'>
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <Receipt className='mr-2 h-4 w-4' />
                  Create Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
