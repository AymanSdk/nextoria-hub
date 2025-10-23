"use client";

import * as React from "react";
import { Shield, Lock, Activity } from "lucide-react";
import { SettingsCard } from "./settings-card";
import { PasswordChangeForm } from "./password-change-form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface SecuritySectionProps {
  hasPassword: boolean;
  user: {
    id: string;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function SecuritySection({ hasPassword, user }: SecuritySectionProps) {
  return (
    <div className='space-y-6'>
      {/* Password Management */}
      {hasPassword ? (
        <PasswordChangeForm />
      ) : (
        <SettingsCard
          title='Password'
          description="You're signed in with an OAuth provider"
          icon={Lock}
        >
          <Alert>
            <Shield className='h-4 w-4' />
            <AlertDescription>
              Your account is authenticated via an external provider (Google, GitHub,
              etc.). Password management is not available for OAuth accounts.
            </AlertDescription>
          </Alert>
        </SettingsCard>
      )}

      {/* Account Security Status */}
      <SettingsCard
        title='Security Status'
        description='Overview of your account security'
        icon={Shield}
      >
        <div className='space-y-4'>
          <div className='flex items-center justify-between py-2'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>Password Protection</p>
              <p className='text-xs text-muted-foreground'>
                {hasPassword
                  ? "Your account is protected with a password"
                  : "OAuth authentication enabled"}
              </p>
            </div>
            <Badge variant={hasPassword ? "default" : "secondary"}>
              {hasPassword ? "Active" : "OAuth"}
            </Badge>
          </div>

          <Separator />

          <div className='flex items-center justify-between py-2'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>Email Verification</p>
              <p className='text-xs text-muted-foreground'>Your email is verified</p>
            </div>
            <Badge variant='default'>Verified</Badge>
          </div>

          <Separator />

          <div className='flex items-center justify-between py-2'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>Two-Factor Authentication</p>
              <p className='text-xs text-muted-foreground'>
                Add an extra layer of security (Coming soon)
              </p>
            </div>
            <Badge variant='outline'>Not Available</Badge>
          </div>
        </div>
      </SettingsCard>

      {/* Account Activity */}
      <SettingsCard
        title='Account Activity'
        description='Recent security events'
        icon={Activity}
      >
        <div className='space-y-3'>
          <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 shrink-0'>
              <Activity className='h-4 w-4 text-green-600 dark:text-green-400' />
            </div>
            <div className='flex-1 space-y-1'>
              <p className='text-sm font-medium'>Account Created</p>
              <p className='text-xs text-muted-foreground'>
                {format(new Date(user.createdAt), "PPP 'at' p")}
              </p>
            </div>
          </div>

          <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 shrink-0'>
              <Activity className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='flex-1 space-y-1'>
              <p className='text-sm font-medium'>Last Profile Update</p>
              <p className='text-xs text-muted-foreground'>
                {format(new Date(user.updatedAt), "PPP 'at' p")}
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
