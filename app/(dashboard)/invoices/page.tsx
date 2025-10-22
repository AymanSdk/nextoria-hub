import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { invoices, users, projects } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Download,
  Send,
  MoreHorizontal,
  DollarSign,
  AlertCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    VIEWED:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    CANCELLED:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  };
  return colors[status] || colors.DRAFT;
};

export default async function InvoicesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch all invoices with client and project details
  const allInvoices = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      total: invoices.total,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      paidAt: invoices.paidAt,
      currency: invoices.currency,
      clientName: users.name,
      projectName: projects.name,
    })
    .from(invoices)
    .leftJoin(users, eq(invoices.clientId, users.id))
    .leftJoin(projects, eq(invoices.projectId, projects.id));

  // Calculate stats
  const totalRevenue = allInvoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const pendingAmount = allInvoices
    .filter((inv) => inv.status === "SENT" || inv.status === "VIEWED")
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const overdueAmount = allInvoices
    .filter((inv) => inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const paidCount = allInvoices.filter((i) => i.status === "PAID").length;
  const overdueCount = allInvoices.filter((i) => i.status === "OVERDUE").length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Invoices</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Manage and track all your invoices
          </p>
        </div>
        <Link href='/invoices/new'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Total Revenue
            </CardTitle>
            <DollarSign className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              $
              {(totalRevenue / 100).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>
              From {paidCount} paid invoice{paidCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Pending
            </CardTitle>
            <Clock className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              $
              {(pendingAmount / 100).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Overdue
            </CardTitle>
            <AlertCircle className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
              $
              {(overdueAmount / 100).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>
              {overdueCount} overdue invoice{overdueCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Recent invoices and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {allInvoices.length > 0 ? (
            <div className='space-y-3'>
              {allInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className='flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-1'>
                      <p className='font-semibold'>{invoice.invoiceNumber}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                      {invoice.clientName || "Unknown Client"} •{" "}
                      {invoice.projectName || "No Project"}
                    </p>
                    <p className='text-xs text-neutral-500 mt-1'>
                      Issued{" "}
                      {invoice.issueDate
                        ? new Date(invoice.issueDate).toLocaleDateString()
                        : "N/A"}{" "}
                      • Due{" "}
                      {invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString()
                        : "N/A"}
                      {invoice.paidAt &&
                        ` • Paid ${new Date(
                          invoice.paidAt
                        ).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='text-right'>
                      <p className='text-xl font-bold'>
                        {invoice.currency} $
                        {((invoice.total || 0) / 100).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      {invoice.status === "DRAFT" && (
                        <Button variant='outline' size='sm'>
                          <Send className='mr-2 h-4 w-4' />
                          Send
                        </Button>
                      )}
                      <Button variant='ghost' size='sm'>
                        <Download className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='sm'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <DollarSign className='mx-auto h-12 w-12 text-neutral-400' />
              <h3 className='mt-4 text-lg font-semibold'>No invoices yet</h3>
              <p className='mt-2 text-neutral-500'>
                Get started by creating your first invoice
              </p>
              <Link href='/invoices/new'>
                <Button className='mt-4'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Invoice
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
