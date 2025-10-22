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
import { Save } from "lucide-react";

export default async function ProfileSettingsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className='space-y-6 max-w-2xl'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Profile Settings</h1>
        <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
          Manage your personal information and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
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
            <p className='text-xs text-neutral-500'>Email cannot be changed</p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number</Label>
            <Input id='phone' type='tel' placeholder='+1 (555) 123-4567' />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='bio'>Bio</Label>
            <Textarea
              id='bio'
              placeholder='Tell us about yourself...'
              rows={4}
            />
          </div>

          <Button>
            <Save className='mr-2 h-4 w-4' />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
