"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link as LinkIcon, Loader2 } from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  size?: string;
}

interface LinkDriveFileDialogProps {
  file: DriveFile;
  children?: React.ReactNode;
}

export function LinkDriveFileDialog({ file, children }: LinkDriveFileDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkType, setLinkType] = useState<"project" | "client" | "task">("project");
  const [entityId, setEntityId] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const handleLink = async () => {
    if (!entityId) {
      toast.error("Please select an entity to link to");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/integrations/google-drive/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.id,
          fileName: file.name,
          mimeType: file.mimeType,
          webViewLink: file.webViewLink,
          size: file.size,
          linkType,
          entityId,
          description,
          tags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to link file");
      }

      toast.success(`File linked to ${linkType} successfully!`);
      setOpen(false);
      setEntityId("");
      setDescription("");
      setTags("");
    } catch (error) {
      console.error("Error linking file:", error);
      toast.error("Failed to link file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant='outline' size='sm'>
            <LinkIcon className='h-4 w-4 mr-2' />
            Link to Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Link Drive File</DialogTitle>
          <DialogDescription>
            Link {file.name} to a project, client, or task
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='link-type'>Link To</Label>
            <Select value={linkType} onValueChange={(value: any) => setLinkType(value)}>
              <SelectTrigger id='link-type'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='project'>Project</SelectItem>
                <SelectItem value='client'>Client</SelectItem>
                <SelectItem value='task'>Task</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='entity-id'>
              {linkType.charAt(0).toUpperCase() + linkType.slice(1)} ID
            </Label>
            <Input
              id='entity-id'
              placeholder={`Enter ${linkType} ID`}
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
            />
            <p className='text-xs text-neutral-500'>
              You can find the ID in the URL of the {linkType} page
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description (Optional)</Label>
            <Textarea
              id='description'
              placeholder='Add a description for this file...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='tags'>Tags (Optional)</Label>
            <Input
              id='tags'
              placeholder='design, final, v2'
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className='text-xs text-neutral-500'>Separate tags with commas</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleLink} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Linking...
              </>
            ) : (
              <>
                <LinkIcon className='h-4 w-4 mr-2' />
                Link File
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
