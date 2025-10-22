"use client";

import * as React from "react";
import { useState } from "react";
import { Lock, Loader2, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function PasswordChangeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { label: "", color: "", width: "0%" };
    if (password.length < 8) return { label: "Weak", color: "bg-red-500", width: "33%" };
    if (password.length < 12)
      return { label: "Medium", color: "bg-yellow-500", width: "66%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };

  const strength = getPasswordStrength(formData.newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New passwords do not match");
        setIsLoading(false);
        return;
      }

      // Validate password strength
      if (formData.newPassword.length < 8) {
        toast.error("Password must be at least 8 characters long");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='border-2 hover:border-primary/50 transition-colors'>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
            <Shield className='h-5 w-5 text-primary' />
          </div>
          <div>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-2'>
            <Label
              htmlFor='current-password'
              className='text-sm font-medium flex items-center gap-2'
            >
              <Key className='h-4 w-4 text-muted-foreground' />
              Current Password
            </Label>
            <Input
              id='current-password'
              type='password'
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              placeholder='Enter your current password'
              required
              className='h-11'
            />
          </div>

          <div className='pt-4 border-t space-y-5'>
            <div className='space-y-2'>
              <Label
                htmlFor='new-password'
                className='text-sm font-medium flex items-center gap-2'
              >
                <Lock className='h-4 w-4 text-muted-foreground' />
                New Password
              </Label>
              <Input
                id='new-password'
                type='password'
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                placeholder='Enter your new password'
                required
                minLength={8}
                className='h-11'
              />
              {formData.newPassword && (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-xs'>
                    <span className='text-muted-foreground'>Password strength:</span>
                    <span
                      className={`font-medium ${
                        strength.label === "Strong"
                          ? "text-green-600"
                          : strength.label === "Medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className='h-2 w-full bg-secondary rounded-full overflow-hidden'>
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}
              <p className='text-xs text-muted-foreground'>
                Must be at least 8 characters long
              </p>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='confirm-password'
                className='text-sm font-medium flex items-center gap-2'
              >
                <Lock className='h-4 w-4 text-muted-foreground' />
                Confirm New Password
              </Label>
              <Input
                id='confirm-password'
                type='password'
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder='Confirm your new password'
                required
                minLength={8}
                className='h-11'
              />
              {formData.confirmPassword && (
                <p
                  className={`text-xs ${
                    formData.newPassword === formData.confirmPassword
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formData.newPassword === formData.confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </p>
              )}
            </div>
          </div>

          <div className='pt-4 border-t flex justify-end'>
            <Button
              type='submit'
              disabled={isLoading}
              size='lg'
              className='min-w-[200px] h-12 text-base'
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  Updating Password...
                </>
              ) : (
                <>
                  <Shield className='mr-2 h-5 w-5' />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
