"use client";

import { useState, useEffect } from "react";
import { FolderKanban, Loader2, Check, Plus, X, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DriveFolder {
  id: string;
  name: string;
  shared?: boolean;
}

interface GoogleDriveFolderSelectorProps {
  allowedFolderIds: string[];
  onUpdate: (folderIds: string[]) => Promise<void>;
}

export function GoogleDriveFolderSelector({
  allowedFolderIds,
  onUpdate,
}: GoogleDriveFolderSelectorProps) {
  const [open, setOpen] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>(allowedFolderIds);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      fetchFolders();
    }
  }, [open]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/integrations/google-drive/folders");

      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }

      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Failed to load folders");
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderId: string) => {
    setSelectedFolders((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate(selectedFolders);
      setOpen(false);
      toast.success("Folder permissions updated");
    } catch (error) {
      console.error("Error updating folders:", error);
      toast.error("Failed to update folder permissions");
    } finally {
      setSaving(false);
    }
  };

  const selectedFolderNames = folders
    .filter((f) => allowedFolderIds.includes(f.id))
    .map((f) => f.name);

  // Filter folders based on search query
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <FolderKanban className='h-4 w-4 mr-2' />
          Manage Folders
          {allowedFolderIds.length > 0 && (
            <Badge variant='secondary' className='ml-2'>
              {allowedFolderIds.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Select Accessible Folders</DialogTitle>
          <DialogDescription>
            Choose which Google Drive folders should be accessible. Only files from these
            folders will be shown. Leave empty to access all files.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {allowedFolderIds.length === 0 ? (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                All files are currently accessible. Select specific folders below to
                restrict access.
              </AlertDescription>
            </Alert>
          ) : (
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Currently accessible folders:</p>
              <div className='flex flex-wrap gap-2'>
                {selectedFolderNames.map((name) => (
                  <Badge key={name} variant='secondary'>
                    <FolderKanban className='h-3 w-3 mr-1' />
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center space-y-3'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto text-neutral-400' />
                <p className='text-sm text-neutral-500'>Loading folders...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Search input */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400' />
                <Input
                  placeholder='Search folders...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-9'
                />
              </div>

              <ScrollArea className='h-[400px] border rounded-md p-4'>
                <div className='space-y-2'>
                  {filteredFolders.length === 0 ? (
                    <p className='text-sm text-neutral-500 text-center py-8'>
                      {searchQuery
                        ? `No folders matching "${searchQuery}"`
                        : "No folders found in your Google Drive"}
                    </p>
                  ) : (
                    filteredFolders.map((folder) => {
                      const isSelected = selectedFolders.includes(folder.id);
                      return (
                        <Card
                          key={folder.id}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                          }`}
                          onClick={() => toggleFolder(folder.id)}
                        >
                          <CardContent className='p-3'>
                            <div className='flex items-center gap-3'>
                              <div
                                className={`h-10 w-10 rounded flex items-center justify-center ${
                                  isSelected
                                    ? "bg-blue-100 dark:bg-blue-900"
                                    : "bg-neutral-100 dark:bg-neutral-800"
                                }`}
                              >
                                {isSelected ? (
                                  <Check className='h-5 w-5 text-blue-600' />
                                ) : (
                                  <FolderKanban className='h-5 w-5 text-yellow-500' />
                                )}
                              </div>
                              <div className='flex-1 min-w-0'>
                                <h4 className='font-medium text-sm truncate'>
                                  {folder.name}
                                </h4>
                                {folder.shared && (
                                  <Badge variant='secondary' className='text-xs mt-1'>
                                    Shared
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => {
              setSelectedFolders(allowedFolderIds);
              setOpen(false);
            }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant='outline'
            onClick={() => setSelectedFolders([])}
            disabled={saving}
          >
            <X className='h-4 w-4 mr-2' />
            Clear All
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Check className='h-4 w-4 mr-2' />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
