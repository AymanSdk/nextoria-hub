"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { DeliverablesList } from "@/components/deliverables/deliverables-list";
import { toast } from "sonner";

interface ClientFilesSectionProps {
  clientId: string;
}

export function ClientFilesSection({ clientId }: ClientFilesSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("clientId", clientId);

        const response = await fetch("/api/deliverables", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        toast.success(`${file.name} uploaded successfully`);
        // Trigger refresh of the file list
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    e.target.value = ""; // Reset input
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Client Files
            </CardTitle>
            <CardDescription>
              Upload and manage files for this client (contracts, agreements, etc.)
            </CardDescription>
          </div>
          <div>
            <input
              type='file'
              id='client-file-input'
              className='hidden'
              multiple
              accept='.png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv'
              onChange={handleUpload}
            />
            <label
              htmlFor='client-file-input'
              className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors'
            >
              <Upload className='h-4 w-4' />
              Upload Files
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DeliverablesList key={refreshKey} clientId={clientId} canDelete={true} />
      </CardContent>
    </Card>
  );
}
