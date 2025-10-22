import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, Clock, CheckCircle2 } from "lucide-react";
import { DeliverablesList } from "@/components/deliverables/deliverables-list";
import { DeliverableUpload } from "@/components/deliverables/deliverable-upload";
import { db } from "@/src/db";
import { clients, workspaces } from "@/src/db/schema";
import { eq } from "drizzle-orm";

// Mock data for client
const clientData = {
  workspace: {
    name: "ACME Corporation",
    logo: null,
  },
  projects: [
    {
      id: "1",
      name: "Website Redesign",
      status: "IN_PROGRESS",
      progress: 65,
      dueDate: new Date("2025-11-30"),
      lastUpdate: new Date("2025-10-20"),
    },
    {
      id: "2",
      name: "Brand Guidelines",
      status: "COMPLETED",
      progress: 100,
      dueDate: new Date("2025-10-15"),
      lastUpdate: new Date("2025-10-15"),
    },
  ],
  deliverables: [
    {
      id: "1",
      name: "Homepage Mockup v2",
      projectName: "Website Redesign",
      uploadedAt: new Date("2025-10-18"),
      fileSize: "2.4 MB",
      status: "PENDING_APPROVAL",
    },
    {
      id: "2",
      name: "Brand Colors PDF",
      projectName: "Brand Guidelines",
      uploadedAt: new Date("2025-10-10"),
      fileSize: "1.2 MB",
      status: "APPROVED",
    },
  ],
  invoices: [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      amount: 5500,
      status: "PAID",
      dueDate: new Date("2025-10-15"),
      paidAt: new Date("2025-10-14"),
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      amount: 3200,
      status: "SENT",
      dueDate: new Date("2025-10-30"),
      paidAt: null,
    },
  ],
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    PENDING_APPROVAL:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return colors[status] || "bg-neutral-100 text-neutral-700";
};

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const session = await getSession();

  // Only clients and admins can access client portal
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { workspaceId } = await params;

  // Fetch workspace and associated client
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });

  if (!workspace) {
    redirect("/");
  }

  // Find client by workspace or user email
  const clientRecord = await db.query.clients.findFirst({
    where: eq(clients.workspaceId, workspaceId),
  });

  const isClient = session.user.role === "CLIENT";

  return (
    <div className='min-h-screen bg-neutral-50 dark:bg-neutral-950'>
      {/* Header */}
      <div className='border-b bg-white dark:bg-neutral-900'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='h-12 w-12 rounded-lg bg-linear-to-br from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300' />
              <div>
                <h1 className='text-2xl font-bold'>{clientData.workspace.name}</h1>
                <p className='text-sm text-neutral-500'>Client Portal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-6 py-8 space-y-8'>
        {/* Welcome Section */}
        <div>
          <h2 className='text-xl font-semibold mb-2'>
            Welcome back, {session.user.name}!
          </h2>
          <p className='text-neutral-500'>
            Track your projects, view deliverables, and manage invoices
          </p>
        </div>

        {/* Projects */}
        <div>
          <h3 className='text-lg font-semibold mb-4'>Active Projects</h3>
          <div className='grid gap-4 md:grid-cols-2'>
            {clientData.projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <CardTitle className='text-base'>{project.name}</CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardDescription>
                    Last updated {project.lastUpdate.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-neutral-500'>Progress</span>
                      <span className='font-medium'>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                    <div className='flex items-center gap-2 text-sm text-neutral-500'>
                      <Clock className='h-4 w-4' />
                      Due {project.dueDate.toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Deliverables */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold'>Recent Deliverables</h3>
            {clientRecord && !isClient && (
              <DeliverableUpload
                clientId={clientRecord.id}
                triggerButton={
                  <Button size='sm'>
                    <Download className='mr-2 h-4 w-4' />
                    Upload File
                  </Button>
                }
              />
            )}
          </div>
          {clientRecord ? (
            <DeliverablesList clientId={clientRecord.id} canDelete={!isClient} />
          ) : (
            <Card>
              <CardContent className='p-8 text-center text-neutral-500'>
                <FileText className='mx-auto h-8 w-8 mb-2 text-neutral-400' />
                <p>No client record found for this workspace</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Invoices */}
        <div>
          <h3 className='text-lg font-semibold mb-4'>Invoices</h3>
          <div className='space-y-3'>
            {clientData.invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>{invoice.invoiceNumber}</p>
                      <p className='text-sm text-neutral-500'>
                        Due {invoice.dueDate.toLocaleDateString()}
                        {invoice.paidAt &&
                          ` • Paid ${invoice.paidAt.toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='text-right'>
                        <p className='text-lg font-bold'>
                          ${(invoice.amount / 100).toFixed(2)}
                        </p>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant='outline' size='sm'>
                        <Download className='mr-2 h-4 w-4' />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
