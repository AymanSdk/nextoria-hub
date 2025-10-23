"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

interface WorkspaceGeneralSettingsProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    website: string | null;
    email: string | null;
  };
}

export function WorkspaceGeneralSettings({ workspace }: WorkspaceGeneralSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: workspace.name,
    description: workspace.description || "",
    website: workspace.website || "",
    email: workspace.email || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update workspace");
      }

      toast.success("Workspace updated successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    formData.name !== workspace.name ||
    formData.description !== (workspace.description || "") ||
    formData.website !== (workspace.website || "") ||
    formData.email !== (workspace.email || "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Update your workspace name, description, and contact information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Workspace Name</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder='My Workspace'
              required
              disabled={isLoading}
            />
            <p className='text-xs text-muted-foreground'>
              The name of your workspace (visible to all members)
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder='A brief description of your workspace...'
              rows={3}
              disabled={isLoading}
            />
            <p className='text-xs text-muted-foreground'>
              A short description to help members understand your workspace
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='website'>Website</Label>
              <Input
                id='website'
                type='url'
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder='https://example.com'
                disabled={isLoading}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Contact Email</Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder='contact@example.com'
                disabled={isLoading}
              />
            </div>
          </div>

          <div className='flex items-center gap-2 pt-4'>
            <Button type='submit' disabled={isLoading || !hasChanges}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  Save Changes
                </>
              )}
            </Button>
            {hasChanges && (
              <p className='text-sm text-muted-foreground'>You have unsaved changes</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
