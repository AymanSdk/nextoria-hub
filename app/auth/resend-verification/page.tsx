"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ResendVerificationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        toast.success("Verification email sent!");
      } else {
        toast.error(data.error || "Failed to send verification email");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-8'>
        <Card className='w-full max-w-md shadow-xl'>
          <CardHeader className='space-y-3 text-center'>
            <div className='mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2'>
              <CheckCircle2 className='h-6 w-6 text-green-600 dark:text-green-400' />
            </div>
            <CardTitle className='text-3xl font-bold tracking-tight'>
              Email Sent!
            </CardTitle>
            <CardDescription className='text-base'>
              Check your inbox for the verification link
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
              <p className='text-sm text-blue-800 dark:text-blue-300 mb-2'>
                We've sent a verification email to:
              </p>
              <p className='text-sm font-semibold text-blue-900 dark:text-blue-200 break-all'>
                {email}
              </p>
              <p className='text-xs text-blue-700 dark:text-blue-400 mt-3'>
                The link will expire in 24 hours
              </p>
            </div>
            <div className='text-center space-y-2'>
              <p className='text-sm text-muted-foreground'>Didn't receive the email?</p>
              <ul className='text-xs text-muted-foreground space-y-1'>
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and try again</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className='flex flex-col space-y-3'>
            <Button
              variant='outline'
              className='w-full'
              size='lg'
              onClick={() => setIsSuccess(false)}
            >
              Send to Different Email
            </Button>
            <Button asChild variant='ghost' className='w-full' size='lg'>
              <Link href='/auth/signin'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Sign In
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-8'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='space-y-3 text-center'>
          <div className='mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2'>
            <Mail className='h-6 w-6 text-primary-foreground' />
          </div>
          <CardTitle className='text-3xl font-bold tracking-tight'>
            Resend Verification
          </CardTitle>
          <CardDescription className='text-base'>
            Enter your email to receive a new verification link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='email'
                  type='email'
                  placeholder='name@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className='pl-10'
                  required
                />
              </div>
            </div>

            <Button type='submit' className='w-full' size='lg' disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className='mr-2 h-4 w-4' />
                  Send Verification Email
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex flex-col space-y-2'>
          <Button asChild variant='ghost' className='w-full' size='lg'>
            <Link href='/auth/signin'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Sign In
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
