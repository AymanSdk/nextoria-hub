"use client";

import { useState, Suspense } from "react";
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
import { toast } from "sonner";
import { CheckCircle2, Loader2, Mail, Shield } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email");

  const [code, setCode] = useState("");
  const [email, setEmail] = useState(emailFromUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, email: email || undefined }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        setVerifiedEmail(data.email);
        toast.success("Email verified successfully!");
        setIsLoading(false);

        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to verify email");
        toast.error(data.error || "Failed to verify email");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    // Auto-submit when 6 digits entered
    if (value.length === 6) {
      setTimeout(() => {
        const form = document.getElementById("verify-form") as HTMLFormElement;
        form?.requestSubmit();
      }, 100);
    }
  };

  if (status === "success") {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-8'>
        <Card className='w-full max-w-md shadow-xl relative overflow-hidden'>
          <CardHeader className='space-y-3 text-center'>
            <div className='mx-auto bg-green-100 dark:bg-green-900/30 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-2'>
              <CheckCircle2 className='h-6 w-6 text-green-600 dark:text-green-400' />
            </div>
            <CardTitle className='text-3xl font-bold tracking-tight'>
              Email Verified!
            </CardTitle>
            <CardDescription className='text-base'>
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center'>
              <p className='text-sm text-green-800 dark:text-green-300 mb-2'>
                You can now sign in with:
              </p>
              {verifiedEmail && (
                <p className='text-sm font-semibold text-green-900 dark:text-green-200'>
                  {verifiedEmail}
                </p>
              )}
              <p className='text-xs text-green-700 dark:text-green-400 mt-3'>
                Redirecting you to sign in...
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className='w-full' size='lg'>
              <Link href='/auth/signin'>
                <Mail className='mr-2 h-4 w-4' />
                Continue to Sign In
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 px-4 py-8'>
      <Card className='w-full max-w-md shadow-xl relative overflow-hidden'>
        {/* Loading Overlay */}
        {isLoading && (
          <div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center'>
            <div className='space-y-4 text-center'>
              <Spinner className='h-12 w-12 text-primary mx-auto' />
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold'>Verifying your code...</h3>
                <p className='text-sm text-muted-foreground'>Please wait a moment</p>
              </div>
            </div>
          </div>
        )}

        <CardHeader className='space-y-3 text-center'>
          <div className='mx-auto bg-primary rounded-full p-3 w-12 h-12 flex items-center justify-center mb-2'>
            <Shield className='h-6 w-6 text-primary-foreground' />
          </div>
          <CardTitle className='text-3xl font-bold tracking-tight'>
            Verify Your Email
          </CardTitle>
          <CardDescription className='text-base'>
            Enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id='verify-form' onSubmit={handleSubmit} className='space-y-6'>
            {!emailFromUrl && (
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='your@email.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className='pl-10'
                  />
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='code' className='text-center block'>
                Verification Code
              </Label>
              <div className='flex justify-center'>
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={handleCodeChange}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className='text-xs text-center text-muted-foreground mt-2'>
                Check your email for the code
              </p>
            </div>

            {status === "error" && (
              <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
                <p className='text-sm text-red-800 dark:text-red-300 text-center'>
                  {message}
                </p>
              </div>
            )}

            <Button
              type='submit'
              className='w-full'
              size='lg'
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className='mr-2 h-4 w-4' />
                  Verify Email
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className='flex flex-col space-y-3 border-t pt-6'>
          <div className='text-sm text-center text-muted-foreground'>
            Didn&apos;t receive the code?{" "}
            <Link
              href='/auth/resend-verification'
              className='font-medium text-primary hover:underline'
            >
              Resend code
            </Link>
          </div>
          <Button asChild variant='ghost' className='w-full' size='sm'>
            <Link href='/auth/signin'>Back to Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
