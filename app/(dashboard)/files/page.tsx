"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud } from "lucide-react";
import { FilesBrowser } from "@/components/files/files-browser";

export default function FilesPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Files</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Centralized file management for all your projects, clients, and team
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' disabled>
            <Cloud className='mr-2 h-4 w-4' />
            Connect Google Drive
            <Badge variant='secondary' className='ml-2'>
              Coming Soon
            </Badge>
          </Button>
        </div>
      </div>

      {/* Files Browser Component */}
      <FilesBrowser />
    </div>
  );
}
