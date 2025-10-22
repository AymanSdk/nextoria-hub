"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/upload/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
}

interface ClientFileUploadProps {
  onUploadComplete?: (file: any) => void;
}

export function ClientFileUpload({ onUploadComplete }: ClientFileUploadProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch clients");
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (file: any) => {
    toast.success("File uploaded to client successfully!");
    if (onUploadComplete) {
      onUploadComplete(file);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            <CardTitle>Upload Client File</CardTitle>
          </div>
          <CardDescription>Loading clients...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            <CardTitle>Upload Client File</CardTitle>
          </div>
          <CardDescription>
            No clients available. Create a client first to upload files.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Building2 className='h-5 w-5' />
          <CardTitle>Upload Client File</CardTitle>
        </div>
        <CardDescription>
          Upload files directly to a client (contracts, agreements, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <label className='text-sm font-medium mb-2 block'>Select Client</label>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger>
              <SelectValue placeholder='Choose a client...' />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  <div className='flex items-center gap-2'>
                    <Building2 className='h-4 w-4 text-blue-600' />
                    <span>{client.companyName || client.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClientId && (
          <ClientDirectUpload
            clientId={selectedClientId}
            onUploadComplete={handleUploadComplete}
          />
        )}

        {!selectedClientId && (
          <p className='text-sm text-neutral-500 text-center py-4'>
            Please select a client to upload files
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Separate component for direct client upload
interface ClientDirectUploadProps {
  clientId: string;
  onUploadComplete?: (file: any) => void;
}

function ClientDirectUpload({ clientId, onUploadComplete }: ClientDirectUploadProps) {
  const handleClientUpload = (fileData: any) => {
    // Called after FileUpload completes
    if (onUploadComplete) {
      onUploadComplete(fileData);
    }
  };

  return (
    <div>
      <p className='text-xs text-neutral-500 mb-3'>
        Use the deliverables upload below, or drag and drop files here
      </p>
      {/* Use DeliverableUpload component for direct client uploads */}
      <div className='border-2 border-dashed rounded-lg p-4'>
        <p className='text-sm text-neutral-600 dark:text-neutral-400 text-center mb-2'>
          Upload files directly to this client
        </p>
        <p className='text-xs text-neutral-500 text-center mb-4'>
          These files won't be linked to any project - perfect for contracts, agreements,
          etc.
        </p>
        <input
          type='file'
          id='client-file-upload'
          className='hidden'
          multiple
          accept='.png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv'
          onChange={async (e) => {
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

                const data = await response.json();
                toast.success(`${file.name} uploaded successfully`);
                handleClientUpload(data.file);
              } catch (error) {
                console.error("Upload error:", error);
                toast.error(`Failed to upload ${file.name}`);
              }
            }
            e.target.value = ""; // Reset input
          }}
        />
        <label
          htmlFor='client-file-upload'
          className='block w-full text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors'
        >
          Choose Files to Upload
        </label>
      </div>
    </div>
  );
}
