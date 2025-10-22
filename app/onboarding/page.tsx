import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ArrowRight } from "lucide-react";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // If user already has complete profile, redirect to dashboard
  // For now, we'll just show the onboarding for all users

  return (
    <div className='min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-2xl space-y-6'>
        {/* Progress */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold'>
              1
            </div>
            <span className='text-sm font-medium'>Profile Setup</span>
          </div>
          <div className='flex-1 mx-4 h-1 bg-neutral-200 dark:bg-neutral-800 rounded'>
            <div className='h-full w-1/3 bg-blue-600 rounded'></div>
          </div>
          <div className='flex items-center gap-2 opacity-50'>
            <div className='h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold'>
              2
            </div>
            <span className='text-sm font-medium'>Workspace</span>
          </div>
          <div className='flex-1 mx-4 h-1 bg-neutral-200 dark:bg-neutral-800 rounded'></div>
          <div className='flex items-center gap-2 opacity-50'>
            <div className='h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold'>
              3
            </div>
            <span className='text-sm font-medium'>Done</span>
          </div>
        </div>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>
              Welcome to Nextoria Hub! 🎉
            </CardTitle>
            <CardDescription>
              Let's get you set up in just a few steps
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Full Name</Label>
                <Input
                  id='name'
                  defaultValue={session.user.name || ""}
                  placeholder='John Doe'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  defaultValue={session.user.email || ""}
                  disabled
                  className='bg-neutral-100 dark:bg-neutral-800'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number (Optional)</Label>
                <Input id='phone' type='tel' placeholder='+1 (555) 123-4567' />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='bio'>Bio (Optional)</Label>
                <Textarea
                  id='bio'
                  placeholder='Tell us a bit about yourself...'
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='timezone'>Timezone</Label>
                <select
                  id='timezone'
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                  <option value='UTC'>UTC</option>
                  <option value='America/New_York'>Eastern Time (ET)</option>
                  <option value='America/Chicago'>Central Time (CT)</option>
                  <option value='America/Denver'>Mountain Time (MT)</option>
                  <option value='America/Los_Angeles'>Pacific Time (PT)</option>
                  <option value='Europe/London'>London (GMT)</option>
                  <option value='Europe/Paris'>Paris (CET)</option>
                </select>
              </div>
            </div>

            <div className='flex items-center justify-between pt-4'>
              <Button variant='outline' asChild>
                <a href='/'>Skip for now</a>
              </Button>
              <Button asChild>
                <a href='/'>
                  Continue to Dashboard
                  <ArrowRight className='ml-2 h-4 w-4' />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>What's Next?</CardTitle>
            <CardDescription>
              Here's what you can do with Nextoria Hub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-start gap-3'>
                <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
                <div>
                  <p className='font-medium'>Manage Projects</p>
                  <p className='text-sm text-neutral-500'>
                    Create and track projects with Kanban boards
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
                <div>
                  <p className='font-medium'>Campaign Tracking</p>
                  <p className='text-sm text-neutral-500'>
                    Monitor marketing campaigns and analytics
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
                <div>
                  <p className='font-medium'>Team Collaboration</p>
                  <p className='text-sm text-neutral-500'>
                    Chat, comment, and collaborate in real-time
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
                <div>
                  <p className='font-medium'>Invoice & Billing</p>
                  <p className='text-sm text-neutral-500'>
                    Create invoices and track payments
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
