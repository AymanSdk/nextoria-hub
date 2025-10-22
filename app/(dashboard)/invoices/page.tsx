import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { invoices, users, clients, projects } from "@/src/db/schema";
import { eq, desc, or, inArray } from "drizzle-orm";
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

export default async function InvoicesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch invoices based on user role
  let userInvoices;

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
        userInvoices = await db
          .select()
          .from(invoices)
          .where(
            or(
              eq(invoices.clientId, clientRecord.id),
              inArray(invoices.projectId, projectIds)
            )
          )
          .orderBy(desc(invoices.createdAt))
          .limit(20);
      } else {
        userInvoices = [];
      }
    } else {
      userInvoices = [];
    }
  } else {
    // For non-clients, show all invoices
    userInvoices = await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.createdAt))
      .limit(20);
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
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Invoice
          </Button>
        )}
      </div>

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
                <Button className='mt-4'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create your first invoice
                </Button>
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
                        <Button variant='ghost' size='sm'>
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm'>
                          <Download className='h-4 w-4' />
                        </Button>
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
