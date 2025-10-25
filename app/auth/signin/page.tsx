"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
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
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const message = searchParams.get("message");

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Show message if redirected from signup
  useEffect(() => {
    if (message === "verify-email") {
      toast.info("Please verify your email address before signing in", {
        duration: 5000,
      });
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Sign in error:", result.error);

        // Check if error is about email verification
        if (result.error.includes("verify your email")) {
          toast.error("Please verify your email address first", {
            action: {
              label: "Resend Email",
              onClick: () => router.push("/auth/resend-verification"),
            },
            duration: 6000,
          });
        } else {
          toast.error("Invalid email or password");
        }
        setIsLoading(false);
      } else if (result?.ok) {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
        // Keep loading state active during navigation
      } else {
        console.error("Unexpected sign in result:", result);
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Sign in exception:", error);
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
                <h3 className='text-lg font-semibold'>Signing you in...</h3>
                <p className='text-sm text-muted-foreground'>Please wait a moment</p>
              </div>
            </div>
          </div>
        )}

        <CardHeader className='space-y-3 text-center'>
          <div className='mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2'>
            <Lock className='h-6 w-6 text-primary-foreground' />
          </div>
          <CardTitle className='text-3xl font-bold tracking-tight'>
            Welcome back
          </CardTitle>
          <CardDescription className='text-base'>
            Sign in to your Nextoria account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password' className='text-sm font-medium'>
                  Password
                </Label>
                <Link
                  href='/auth/reset-password'
                  className='text-xs text-primary hover:underline'
                >
                  Forgot password?
                </Link>
              </div>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  className='pl-10 pr-10'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='remember'
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label
                htmlFor='remember'
                className='text-sm font-normal cursor-pointer select-none'
              >
                Remember me for 30 days
              </Label>
            </div>
            <Button type='submit' className='w-full h-11' disabled={isLoading}>
              {isLoading && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4 border-t pt-6'>
          <div className='text-sm text-center text-muted-foreground'>
            Don&apos;t have an account?{" "}
            <Link
              href='/auth/signup'
              className='font-medium text-primary hover:underline'
            >
              Create one
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
