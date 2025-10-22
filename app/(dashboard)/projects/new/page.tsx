"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const COLORS = [
  { name: "Blue", value: "#0070f3" },
  { name: "Purple", value: "#7928ca" },
  { name: "Pink", value: "#ff0080" },
  { name: "Green", value: "#00d924" },
  { name: "Orange", value: "#ff6b35" },
  { name: "Red", value: "#f43f5e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Indigo", value: "#6366f1" },
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
    <div className='max-w-3xl mx-auto space-y-6'>
      {/* Header */}
      <div>
        <Link href='/projects'>
          <Button variant='ghost' size='sm' className='mb-4'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Projects
          </Button>
        </Link>
        <h1 className='text-3xl font-bold tracking-tight'>
          Create New Project
        </h1>
        <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
          Set up a new project to organize your work and collaborate with your
          team
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {error && (
              <div className='bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg'>
                {error}
              </div>
            )}

            {/* Project Name */}
            <div className='space-y-2'>
              <Label htmlFor='name'>
                Project Name <span className='text-red-500'>*</span>
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
                Project Slug <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='slug'
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder='e.g., website-redesign'
                required
                pattern='^[a-z0-9-]+$'
              />
              <p className='text-xs text-neutral-500'>
                Used in URLs. Only lowercase letters, numbers, and hyphens.
              </p>
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
                placeholder='Brief description of the project...'
                rows={4}
              />
            </div>

            {/* Client Selection */}
            <div className='space-y-2'>
              <Label htmlFor='clientId'>Client (Optional)</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) =>
                  setFormData({ ...formData, clientId: value })
                }>
                <SelectTrigger id='clientId'>
                  <SelectValue placeholder='No client (optional)' />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.companyName || client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clients.length === 0 && (
                <p className='text-xs text-neutral-500'>
                  No clients yet.{" "}
                  <Link
                    href='/clients'
                    className='text-blue-600 hover:underline'>
                    Add a client
                  </Link>
                </p>
              )}
            </div>

            {/* Status and Priority */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }>
                  <SelectTrigger id='status'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='DRAFT'>Draft</SelectItem>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='ON_HOLD'>On Hold</SelectItem>
                    <SelectItem value='COMPLETED'>Completed</SelectItem>
                    <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='priority'>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }>
                  <SelectTrigger id='priority'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Low</SelectItem>
                    <SelectItem value='1'>Medium</SelectItem>
                    <SelectItem value='2'>High</SelectItem>
                    <SelectItem value='3'>Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='startDate'>Start Date</Label>
                <Input
                  id='startDate'
                  type='date'
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='dueDate'>Due Date</Label>
                <Input
                  id='dueDate'
                  type='date'
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Budget */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='budgetAmount'>Budget Amount</Label>
                <Input
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
              </div>

              <div className='space-y-2'>
                <Label htmlFor='budgetCurrency'>Currency</Label>
                <Select
                  value={formData.budgetCurrency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, budgetCurrency: value })
                  }>
                  <SelectTrigger id='budgetCurrency'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='USD'>USD ($)</SelectItem>
                    <SelectItem value='EUR'>EUR (€)</SelectItem>
                    <SelectItem value='GBP'>GBP (£)</SelectItem>
                    <SelectItem value='CAD'>CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Color */}
            <div className='space-y-2'>
              <Label>Project Color</Label>
              <div className='flex flex-wrap gap-2'>
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type='button'
                    onClick={() =>
                      setFormData({ ...formData, color: color.value })
                    }
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? "border-neutral-900 dark:border-neutral-100 scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className='flex items-center gap-3 pt-4'>
              <Button type='submit' disabled={loading} className='flex-1'>
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Create Project
              </Button>
              <Link href='/projects' className='flex-1'>
                <Button type='button' variant='outline' className='w-full'>
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
