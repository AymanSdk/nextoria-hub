import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { users, projects, invoices, invoiceLineItems } from "@/src/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

export default async function ClientDetailPage({
  params,
}: {
  params: { clientId: string };
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch client details
  const [client] = await db
    .select()
    .from(users)
    .where(eq(users.id, params.clientId))
    .limit(1);

  if (!client) {
    notFound();
  }

  // Fetch client's projects
  const clientProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      status: projects.status,
      color: projects.color,
      startDate: projects.startDate,
      dueDate: projects.dueDate,
    })
    .from(projects)
    .innerJoin(invoices, eq(projects.id, invoices.projectId))
    .where(eq(invoices.clientId, client.id));

  // Fetch client's invoices
  const clientInvoices = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      total: invoices.total,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      paidAt: invoices.paidAt,
      projectName: projects.name,
    })
    .from(invoices)
    .leftJoin(projects, eq(invoices.projectId, projects.id))
    .where(eq(invoices.clientId, client.id));

  // Calculate stats
  const totalRevenue = clientInvoices.reduce((acc, inv) => acc + inv.total, 0);
  const paidRevenue = clientInvoices
    .filter((inv) => inv.status === "PAID")
    .reduce((acc, inv) => acc + inv.total, 0);
  const pendingRevenue = totalRevenue - paidRevenue;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT:
        "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
      SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || colors.DRAFT;
  };

  return (
    <div className='space-y-6'>
      {/* Client Header */}
      <div className='flex items-start justify-between flex-wrap gap-4'>
        <div className='flex items-start gap-4'>
          <Avatar className='h-20 w-20'>
            <AvatarFallback className='bg-gradient-to-br from-purple-500 to-pink-600 text-white font-semibold text-2xl'>
              {client.name?.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>{client.name}</h1>
            <div className='flex flex-col gap-1 mt-2'>
              <p className='text-neutral-500 dark:text-neutral-400 flex items-center gap-2'>
                <Mail className='h-4 w-4' />
                {client.email}
              </p>
              <p className='text-neutral-500 dark:text-neutral-400 flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Client since {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline'>
            <Mail className='mr-2 h-4 w-4' />
            Email Client
          </Button>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(totalRevenue / 100).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Paid</CardTitle>
            <DollarSign className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(paidRevenue / 100).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>
              {Math.round((paidRevenue / totalRevenue) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Projects</CardTitle>
            <Briefcase className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{clientProjects.length}</div>
            <p className='text-xs text-neutral-500 mt-1'>Total projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Invoices</CardTitle>
            <FileText className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{clientInvoices.length}</div>
            <p className='text-xs text-neutral-500 mt-1'>Total invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Client's active and completed projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientProjects.length > 0 ? (
              <div className='space-y-3'>
                {clientProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className='flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors'>
                    <div className='flex items-center gap-3'>
                      <div
                        className='h-8 w-8 rounded-lg flex items-center justify-center'
                        style={{ backgroundColor: project.color || "#0070f3" }}>
                        <Briefcase className='h-4 w-4 text-white' />
                      </div>
                      <div>
                        <p className='font-semibold'>{project.name}</p>
                        <p className='text-xs text-neutral-500'>
                          {project.dueDate
                            ? `Due ${new Date(
                                project.dueDate
                              ).toLocaleDateString()}`
                            : "No due date"}
                        </p>
                      </div>
                    </div>
                    <Badge>{project.status}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className='text-neutral-500 text-center py-4'>
                No projects yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Recent invoices and payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientInvoices.length > 0 ? (
              <div className='space-y-3'>
                {clientInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <div className='flex items-center gap-2 mb-1'>
                        <p className='font-semibold text-sm'>
                          {invoice.invoiceNumber}
                        </p>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className='text-xs text-neutral-500'>
                        {invoice.projectName || "No project"} • Due{" "}
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-bold'>
                        ${(invoice.total / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-neutral-500 text-center py-4'>
                No invoices yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
