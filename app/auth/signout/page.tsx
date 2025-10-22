"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SignOutPage() {
  useEffect(() => {
    // Automatically trigger sign out when this page loads
    signOut({ callbackUrl: "/auth/signin" });
  }, []);

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardContent className='flex flex-col items-center justify-center py-12 space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <h2 className='text-xl font-semibold'>Signing out...</h2>
          <p className='text-sm text-muted-foreground'>
            Please wait while we log you out.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
