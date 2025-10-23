"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, Loader2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { FilesBrowser } from "@/components/files/files-browser";
import { GoogleDriveBrowser } from "@/components/files/google-drive-browser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function FilesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [driveStatus, setDriveStatus] = useState<{
    connected: boolean;
    email?: string;
    loading: boolean;
  }>({ connected: false, loading: true });
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "local");

  useEffect(() => {
    checkDriveStatus();

    // Handle OAuth callback
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "true") {
      toast.success("Google Drive connected successfully!");
      setActiveTab("drive");
      // Clear URL params
      router.replace("/files?tab=drive");
    } else if (error) {
      const errorMessages: Record<string, string> = {
        unauthorized: "You must be logged in to connect Google Drive",
        access_denied: "Google Drive access was denied",
        no_code: "No authorization code received",
        invalid_state: "Invalid state parameter",
        config_missing: "Google Drive is not configured",
        token_exchange_failed: "Failed to exchange authorization code",
        callback_failed: "Failed to complete Google Drive connection",
      };
      toast.error(errorMessages[error] || "Failed to connect Google Drive");
      router.replace("/files");
    }
  }, [searchParams]);

  const checkDriveStatus = async () => {
    try {
      const response = await fetch("/api/integrations/google-drive/status");
      if (response.ok) {
        const data = await response.json();
        setDriveStatus({
          connected: data.connected,
          email: data.email,
          loading: false,
        });
      } else {
        setDriveStatus({ connected: false, loading: false });
      }
    } catch (error) {
      console.error("Error checking Google Drive status:", error);
      setDriveStatus({ connected: false, loading: false });
    }
  };

  const handleConnectDrive = () => {
    window.location.href = "/api/integrations/google-drive/auth";
  };

  const handleDisconnectDrive = async () => {
    try {
      const response = await fetch("/api/integrations/google-drive/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Google Drive disconnected successfully");
        setDriveStatus({ connected: false, loading: false });
        setShowDisconnectDialog(false);
        setActiveTab("local");
      } else {
        throw new Error("Failed to disconnect");
      }
    } catch (error) {
      console.error("Error disconnecting Google Drive:", error);
      toast.error("Failed to disconnect Google Drive");
    }
  };

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
          {driveStatus.loading ? (
            <Button variant='outline' disabled>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Checking...
            </Button>
          ) : driveStatus.connected ? (
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'>
                <CheckCircle2 className='h-4 w-4' />
                <span className='text-sm font-medium'>
                  Connected: {driveStatus.email}
                </span>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowDisconnectDialog(true)}
              >
                <XCircle className='mr-2 h-4 w-4' />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button variant='outline' onClick={handleConnectDrive}>
              <Cloud className='mr-2 h-4 w-4' />
              Connect Google Drive
            </Button>
          )}
        </div>
      </div>

      {/* Files Browser with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='local'>Local Files</TabsTrigger>
          <TabsTrigger value='drive' disabled={!driveStatus.connected}>
            Google Drive
            {!driveStatus.connected && (
              <Badge variant='secondary' className='ml-2 text-xs'>
                Not Connected
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='local' className='mt-6'>
          <FilesBrowser />
        </TabsContent>

        <TabsContent value='drive' className='mt-6'>
          {driveStatus.connected ? (
            <GoogleDriveBrowser />
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-center space-y-4'>
              <AlertCircle className='h-12 w-12 text-neutral-400' />
              <div>
                <h3 className='text-lg font-semibold'>Google Drive Not Connected</h3>
                <p className='text-sm text-neutral-500 mt-1'>
                  Connect your Google Drive to access your files
                </p>
              </div>
              <Button onClick={handleConnectDrive}>
                <Cloud className='mr-2 h-4 w-4' />
                Connect Google Drive
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Disconnect Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Google Drive?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove access to your Google Drive files from Nextoria Hub. You
              can reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnectDrive}>
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
