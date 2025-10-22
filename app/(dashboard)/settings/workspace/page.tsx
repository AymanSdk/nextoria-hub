import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { workspaces, workspaceSettings } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Palette,
  Globe,
  Mail,
  Bell,
  Link as LinkIcon,
  Shield,
  CreditCard,
  Save,
} from "lucide-react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/src/lib/auth/rbac";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function WorkspaceSettingsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only admins can access workspace settings
  if (!isAdmin(session.user.role)) {
    redirect("/");
  }

  // For now, get the first workspace (in production, get from session/context)
  const [workspace] = await db.select().from(workspaces).limit(1);

  if (!workspace) {
    return <div>No workspace found</div>;
  }

  const [settings] = await db
    .select()
    .from(workspaceSettings)
    .where(eq(workspaceSettings.workspaceId, workspace.id))
    .limit(1);

  return (
    <div className='space-y-6 max-w-4xl'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Workspace Settings</h1>
        <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
          Manage your workspace branding, features, and integrations
        </p>
      </div>

      <Tabs defaultValue='general' className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='general'>
            <Settings className='mr-2 h-4 w-4' />
            General
          </TabsTrigger>
          <TabsTrigger value='branding'>
            <Palette className='mr-2 h-4 w-4' />
            Branding
          </TabsTrigger>
          <TabsTrigger value='features'>
            <Shield className='mr-2 h-4 w-4' />
            Features
          </TabsTrigger>
          <TabsTrigger value='notifications'>
            <Bell className='mr-2 h-4 w-4' />
            Notifications
          </TabsTrigger>
          <TabsTrigger value='billing'>
            <CreditCard className='mr-2 h-4 w-4' />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value='general' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Workspace Information</CardTitle>
              <CardDescription>
                Update your workspace name, description, and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='workspace-name'>Workspace Name</Label>
                <Input
                  id='workspace-name'
                  defaultValue={workspace.name}
                  placeholder='Acme Agency'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='workspace-slug'>Workspace Slug</Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='workspace-slug'
                    defaultValue={workspace.slug}
                    placeholder='acme-agency'
                  />
                  <Badge variant='outline'>app.domain.com/{workspace.slug}</Badge>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='workspace-description'>Description</Label>
                <Textarea
                  id='workspace-description'
                  defaultValue={workspace.description || ""}
                  placeholder='Tell us about your agency...'
                  rows={4}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='workspace-website'>Website</Label>
                  <Input
                    id='workspace-website'
                    type='url'
                    defaultValue={workspace.website || ""}
                    placeholder='https://acmeagency.com'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='workspace-email'>Contact Email</Label>
                  <Input
                    id='workspace-email'
                    type='email'
                    defaultValue={workspace.email || ""}
                    placeholder='contact@acmeagency.com'
                  />
                </div>
              </div>

              <Button>
                <Save className='mr-2 h-4 w-4' />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value='branding' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Customize your workspace colors and logo</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='primary-color'>Primary Color</Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='primary-color'
                      type='color'
                      defaultValue={settings?.primaryColor || "#000000"}
                      className='w-20 h-10'
                    />
                    <Input
                      defaultValue={settings?.primaryColor || "#000000"}
                      placeholder='#000000'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='accent-color'>Accent Color</Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='accent-color'
                      type='color'
                      defaultValue={settings?.accentColor || "#0070f3"}
                      className='w-20 h-10'
                    />
                    <Input
                      defaultValue={settings?.accentColor || "#0070f3"}
                      placeholder='#0070f3'
                    />
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='logo-url'>Logo URL</Label>
                <Input
                  id='logo-url'
                  type='url'
                  defaultValue={workspace.logo || ""}
                  placeholder='https://yourdomain.com/logo.png'
                />
              </div>

              <Button>
                <Save className='mr-2 h-4 w-4' />
                Save Branding
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Domain</CardTitle>
              <CardDescription>Use your own domain for the client portal</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='custom-domain'>Custom Domain</Label>
                <div className='flex items-center gap-2'>
                  <Globe className='h-4 w-4 text-neutral-500' />
                  <Input
                    id='custom-domain'
                    type='text'
                    defaultValue={settings?.customDomain || ""}
                    placeholder='portal.yourdomain.com'
                  />
                </div>
                <p className='text-xs text-neutral-500'>
                  Add a CNAME record pointing to our servers
                </p>
              </div>

              <Button>
                <LinkIcon className='mr-2 h-4 w-4' />
                Connect Domain
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value='features' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable workspace features</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='client-portal'>Client Portal</Label>
                  <p className='text-sm text-neutral-500'>
                    Allow clients to view their projects and invoices
                  </p>
                </div>
                <Switch
                  id='client-portal'
                  defaultChecked={settings?.enableClientPortal ?? undefined}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='time-tracking'>Time Tracking</Label>
                  <p className='text-sm text-neutral-500'>
                    Track time spent on tasks and projects
                  </p>
                </div>
                <Switch
                  id='time-tracking'
                  defaultChecked={settings?.enableTimeTracking ?? undefined}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='invoicing'>Invoicing</Label>
                  <p className='text-sm text-neutral-500'>
                    Create and send invoices to clients
                  </p>
                </div>
                <Switch
                  id='invoicing'
                  defaultChecked={settings?.enableInvoicing ?? undefined}
                />
              </div>

              <Button>
                <Save className='mr-2 h-4 w-4' />
                Save Features
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value='notifications' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how your team receives notifications
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='email-notifications'>Email Notifications</Label>
                  <p className='text-sm text-neutral-500'>
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  id='email-notifications'
                  defaultChecked={settings?.emailNotifications ?? undefined}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='slack-integration'>Slack Integration</Label>
                  <p className='text-sm text-neutral-500'>
                    Send notifications to Slack channels
                  </p>
                </div>
                <Switch
                  id='slack-integration'
                  defaultChecked={settings?.slackIntegration ?? undefined}
                />
              </div>

              <Button>
                <Save className='mr-2 h-4 w-4' />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value='billing' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-lg border p-4 space-y-2'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-semibold'>Pro Plan</p>
                    <p className='text-sm text-neutral-500'>$49/month • Billed monthly</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <p className='text-sm text-neutral-500'>
                  Next billing date: January 1, 2025
                </p>
              </div>

              <div className='flex gap-2'>
                <Button variant='outline'>Change Plan</Button>
                <Button variant='outline'>Payment Methods</Button>
                <Button variant='outline'>Billing History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
