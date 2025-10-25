"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Link2Off, MoreVertical } from "lucide-react";
import { FaGoogleDrive } from "react-icons/fa6";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function FilesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [driveStatus, setDriveStatus] = useState<{
    connected: boolean;
    email?: string;
    loading: boolean;
    isAdmin?: boolean;
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
        forbidden: "Only workspace admins can connect integrations",
        no_workspace: "No workspace found",
      };
      toast.error(errorMessages[error] || "Failed to connect Google Drive");
      router.replace("/files");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          isAdmin: data.isAdmin,
        });
      } else {
        setDriveStatus({ connected: false, loading: false, isAdmin: false });
      }
    } catch (error) {
      console.error("Error checking Google Drive status:", error);
      setDriveStatus({ connected: false, loading: false, isAdmin: false });
    }
  };

  const handleConnectDrive = () => {
    if (!driveStatus.isAdmin) {
      toast.error("Only workspace admins can connect integrations");
      return;
    }
    window.location.href = "/api/integrations/google-drive/auth";
  };

  const handleDisconnectDrive = async () => {
    if (!driveStatus.isAdmin) {
      toast.error("Only workspace admins can disconnect integrations");
      return;
    }

    try {
      const response = await fetch("/api/integrations/google-drive/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Google Drive disconnected successfully");
        setDriveStatus({
          connected: false,
          loading: false,
          isAdmin: driveStatus.isAdmin,
        });
        setShowDisconnectDialog(false);
        setActiveTab("local");
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to disconnect");
      }
    } catch (error: any) {
      console.error("Error disconnecting Google Drive:", error);
      toast.error(error.message || "Failed to disconnect Google Drive");
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
              <div className='flex items-center gap-2.5 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 shadow-sm'>
                <FaGoogleDrive className='h-4 w-4' style={{ color: "#4285F4" }} />
                <div className='flex flex-col'>
                  <span className='text-xs text-blue-600 dark:text-blue-400 font-medium'>
                    Google Drive
                  </span>
                  <span className='text-xs text-blue-700 dark:text-blue-300'>
                    {driveStatus.email}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  >
                    <MoreVertical className='h-4 w-4 text-neutral-500' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        driveStatus.email ? `https://drive.google.com` : "#",
                        "_blank"
                      )
                    }
                    className='cursor-pointer'
                  >
                    <FaGoogleDrive
                      className='mr-2 h-4 w-4'
                      style={{ color: "#4285F4" }}
                    />
                    Open Google Drive
                  </DropdownMenuItem>
                  {/* 🔒 Only show disconnect option to admins */}
                  {driveStatus.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowDisconnectDialog(true)}
                        className='cursor-pointer text-destructive focus:text-destructive'
                      >
                        <Link2Off className='mr-2 h-4 w-4 text-destructive' />
                        Disconnect
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : // 🔒 Only show connect button to admins
          driveStatus.isAdmin ? (
            <Button variant='outline' onClick={handleConnectDrive}>
              <FaGoogleDrive className='mr-2 h-4 w-4' style={{ color: "#4285F4" }} />
              Connect Google Drive
            </Button>
          ) : (
            <div className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'>
              <span className='text-xs text-neutral-600 dark:text-neutral-400'>
                Contact admin to connect Google Drive
              </span>
            </div>
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
              <FaGoogleDrive
                className='h-16 w-16'
                style={{ color: "#4285F4", opacity: 0.5 }}
              />
              <div>
                <h3 className='text-lg font-semibold'>Google Drive Not Connected</h3>
                <p className='text-sm text-neutral-500 mt-1'>
                  {driveStatus.isAdmin
                    ? "Connect your Google Drive to access your files"
                    : "Contact your workspace admin to connect Google Drive"}
                </p>
              </div>
              {/* 🔒 Only show connect button to admins */}
              {driveStatus.isAdmin && (
                <Button onClick={handleConnectDrive}>
                  <FaGoogleDrive className='mr-2 h-4 w-4' style={{ color: "#4285F4" }} />
                  Connect Google Drive
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Disconnect Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className='flex items-center gap-3 mb-2'>
              <div className='p-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'>
                <FaGoogleDrive className='h-5 w-5' style={{ color: "#4285F4" }} />
              </div>
              <AlertDialogTitle className='m-0'>
                Disconnect Google Drive?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className='space-y-2'>
              <p>This will remove access to your Google Drive files from Nextoria Hub.</p>
              {driveStatus.email && (
                <div className='flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'>
                  <span className='text-sm text-neutral-700 dark:text-neutral-300'>
                    {driveStatus.email}
                  </span>
                </div>
              )}
              <p className='text-xs text-neutral-500'>You can reconnect at any time.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnectDrive}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              <Link2Off className='mr-2 h-4 w-4' />
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
