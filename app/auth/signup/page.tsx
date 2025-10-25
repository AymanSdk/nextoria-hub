"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          invitationToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create account");
        return;
      }

      toast.success(data.message || "Account created successfully!");
      toast.info("Please check your email for the verification code", {
        duration: 5000,
      });

      // Redirect to verification page with email
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
      // Keep loading state active during navigation
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-8'>
      <Card className='w-full max-w-md shadow-xl relative overflow-hidden'>
        {/* Loading Overlay */}
        {isLoading && (
          <div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center'>
            <div className='space-y-4 text-center'>
              <Spinner className='h-12 w-12 text-primary mx-auto' />
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold'>Creating your account...</h3>
                <p className='text-sm text-muted-foreground'>Please wait a moment</p>
              </div>
            </div>
          </div>
        )}

        <CardHeader className='space-y-3 text-center'>
          <div className='mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2'>
            <UserPlus className='h-6 w-6 text-primary-foreground' />
          </div>
          <CardTitle className='text-3xl font-bold tracking-tight'>
            Create an account
          </CardTitle>
          <CardDescription className='text-base'>
            {invitationToken
              ? "Complete your invitation to join the workspace"
              : "Create your account and start managing your workspace"}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-sm font-medium'>
                Full Name
              </Label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='name'
                  type='text'
                  placeholder='John Doe'
                  className='pl-10'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium'>
                Email Address
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='email'
                  type='email'
                  placeholder='you@example.com'
                  className='pl-10'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password' className='text-sm font-medium'>
                Password
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  className='pl-10 pr-10'
                  placeholder='Min. 8 characters'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword' className='text-sm font-medium'>
                Confirm Password
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='confirmPassword'
                  type={showConfirmPassword ? "text" : "password"}
                  className='pl-10 pr-10'
                  placeholder='Re-enter password'
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>
            <Button type='submit' className='w-full h-11' disabled={isLoading}>
              {isLoading && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4 border-t pt-6'>
          <div className='text-sm text-center text-muted-foreground'>
            Already have an account?{" "}
            <Link
              href='/auth/signin'
              className='font-medium text-primary hover:underline'
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
