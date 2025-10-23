import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { invoices, users, clients, projects } from "@/src/db/schema";
import { eq, desc, or, inArray, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, DollarSign, Download, Eye } from "lucide-react";
import { NewInvoiceDialog } from "@/components/invoices/new-invoice-dialog";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import Link from "next/link";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get user's current workspace
  const workspace = await getCurrentWorkspace(session.user.id);
  const workspaceId = workspace?.id;

  // Get filter params
  const statusFilter = params.status as string | undefined;
  const searchQuery = params.search as string | undefined;

  // Fetch invoices based on user role
  let userInvoices: (typeof invoices.$inferSelect)[] = [];

  // Build query conditions
  const conditions = [];

  if (session.user.role === "CLIENT") {
    // Find client record
    const [clientRecord] = await db
      .select()
      .from(clients)
      .where(eq(clients.email, session.user.email || ""))
      .limit(1);

    if (clientRecord) {
      // Get invoices for this client's projects
      const clientProjects = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.clientId, clientRecord.id));

      const projectIds = clientProjects.map((p) => p.id);

      if (projectIds.length > 0) {
        conditions.push(
          or(
            eq(invoices.clientId, clientRecord.id),
            inArray(invoices.projectId, projectIds)
          )
        );
      } else {
        conditions.push(eq(invoices.clientId, clientRecord.id));
      }
    } else {
      userInvoices = [];
    }
  }

  // Apply filters
  if (statusFilter) {
    conditions.push(eq(invoices.status, statusFilter as any));
  }

  if (searchQuery) {
    const { ilike } = await import("drizzle-orm");
    conditions.push(ilike(invoices.invoiceNumber, `%${searchQuery}%`));
  }

  // Fetch invoices
  if (session.user.role !== "CLIENT" || conditions.length > 0) {
    userInvoices = await db
      .select()
      .from(invoices)
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .orderBy(desc(invoices.createdAt))
      .limit(50);
  }

  const totalRevenue = userInvoices
    .filter((inv) => inv.status === "PAID")
    .reduce((acc, inv) => acc + inv.total, 0);

  const pendingRevenue = userInvoices
    .filter((inv) => inv.status === "SENT")
    .reduce((acc, inv) => acc + inv.total, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500";
      case "SENT":
        return "bg-blue-500";
      case "OVERDUE":
        return "bg-red-500";
      case "DRAFT":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {session.user.role === "CLIENT" ? "My Invoices" : "Invoices"}
          </h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            {session.user.role === "CLIENT"
              ? "View and download your invoices"
              : "Create, send, and track invoices"}
          </p>
        </div>
        {session.user.role !== "CLIENT" && (
          <NewInvoiceDialog workspaceId={workspaceId}>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              New Invoice
            </Button>
          </NewInvoiceDialog>
        )}
      </div>

      {/* Filters */}
      <InvoiceFilters />

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(totalRevenue / 100).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>
              {userInvoices.filter((i) => i.status === "PAID").length} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending Payment</CardTitle>
            <DollarSign className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(pendingRevenue / 100).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>
              {userInvoices.filter((i) => i.status === "SENT").length} sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Invoices</CardTitle>
            <DollarSign className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{userInvoices.length}</div>
            <p className='text-xs text-neutral-500 mt-1'>All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {userInvoices.length === 0 ? (
            <div className='text-center py-12 text-neutral-500'>
              <p>No invoices yet</p>
              {session.user.role !== "CLIENT" && (
                <NewInvoiceDialog workspaceId={workspaceId}>
                  <Button className='mt-4'>
                    <Plus className='mr-2 h-4 w-4' />
                    Create your first invoice
                  </Button>
                </NewInvoiceDialog>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className='font-medium'>{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      ${(invoice.total / 100).toLocaleString()} {invoice.currency}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Link href={`/invoices/${invoice.id}`}>
                          <Button variant='ghost' size='sm'>
                            <Eye className='h-4 w-4' />
                          </Button>
                        </Link>
                        <a
                          href={`/api/invoices/${invoice.id}/download`}
                          download
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <Button variant='ghost' size='sm'>
                            <Download className='h-4 w-4' />
                          </Button>
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
