import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { invoices, invoiceLineItems, users, clients, projects } from "@/src/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
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
import { Download, ArrowLeft, Edit, Send, CheckCircle } from "lucide-react";
import Link from "next/link";
import { InvoiceStatusUpdater } from "@/components/invoices/invoice-status-updater";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch invoice with line items
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);

  if (!invoice) {
    notFound();
  }

  // Check permissions for CLIENT role
  if (session.user.role === "CLIENT") {
    const [clientRecord] = await db
      .select()
      .from(clients)
      .where(eq(clients.email, session.user.email || ""))
      .limit(1);

    if (clientRecord) {
      const clientProjects = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.clientId, clientRecord.id));

      const projectIds = clientProjects.map((p) => p.id);
      const hasAccess =
        invoice.clientId === clientRecord.id ||
        (invoice.projectId && projectIds.includes(invoice.projectId));

      if (!hasAccess) {
        redirect("/invoices");
      }
    } else {
      redirect("/invoices");
    }
  }

  // Fetch line items
  const lineItems = await db
    .select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, id));

  // Fetch client info
  const [client] = await db
    .select()
    .from(users)
    .where(eq(users.id, invoice.clientId))
    .limit(1);

  // Fetch project info if exists
  let project = null;
  if (invoice.projectId) {
    [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, invoice.projectId))
      .limit(1);
  }

  // Fetch creator info
  const [creator] = await db
    .select()
    .from(users)
    .where(eq(users.id, invoice.createdBy))
    .limit(1);

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
      case "VIEWED":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-700";
      default:
        return "bg-gray-500";
    }
  };

  const isClient = session.user.role === "CLIENT";

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/invoices'>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
              Created on {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
          {!isClient && (
            <InvoiceStatusUpdater invoiceId={invoice.id} currentStatus={invoice.status} />
          )}
          <a
            href={`/api/invoices/${invoice.id}/download`}
            download
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button variant='outline'>
              <Download className='mr-2 h-4 w-4' />
              Download
            </Button>
          </a>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* Invoice Details */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Parties */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <h3 className='font-semibold mb-2'>From:</h3>
                <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                  {creator?.name || "Your Company"}
                </p>
                <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                  {creator?.email}
                </p>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>Bill To:</h3>
                <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                  {client?.name || "Client"}
                </p>
                <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                  {client?.email}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <h3 className='font-semibold mb-1'>Issue Date:</h3>
                <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className='font-semibold mb-1'>Due Date:</h3>
                <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Project */}
            {project && (
              <div>
                <h3 className='font-semibold mb-1'>Project:</h3>
                <Link href={`/projects/${project.slug}`}>
                  <Button variant='link' className='p-0 h-auto'>
                    {project.name}
                  </Button>
                </Link>
              </div>
            )}

            {/* Line Items */}
            <div>
              <h3 className='font-semibold mb-3'>Items:</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className='text-right'>Quantity</TableHead>
                    <TableHead className='text-right'>Unit Price</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className='text-right'>{item.quantity}</TableCell>
                      <TableCell className='text-right'>
                        ${(item.unitPrice / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className='text-right'>
                        ${(item.amount / 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className='border-t pt-4 space-y-2'>
              <div className='flex justify-between'>
                <span>Subtotal:</span>
                <span className='font-medium'>
                  ${(invoice.subtotal / 100).toLocaleString()} {invoice.currency}
                </span>
              </div>
              {invoice.taxRate && invoice.taxRate > 0 && (
                <div className='flex justify-between'>
                  <span>Tax ({(invoice.taxRate / 100).toFixed(2)}%):</span>
                  <span className='font-medium'>
                    ${((invoice.taxAmount || 0) / 100).toLocaleString()}{" "}
                    {invoice.currency}
                  </span>
                </div>
              )}
              <div className='flex justify-between text-lg font-bold'>
                <span>Total:</span>
                <span>
                  ${(invoice.total / 100).toLocaleString()} {invoice.currency}
                </span>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div>
                <h3 className='font-semibold mb-1'>Notes:</h3>
                <p className='text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap'>
                  {invoice.notes}
                </p>
              </div>
            )}

            {/* Terms */}
            {invoice.terms && (
              <div>
                <h3 className='font-semibold mb-1'>Terms & Conditions:</h3>
                <p className='text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap'>
                  {invoice.terms}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className='space-y-4'>
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-neutral-500 mb-1'>Status</p>
                <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
              </div>
              <div>
                <p className='text-sm text-neutral-500 mb-1'>Amount Due</p>
                <p className='text-2xl font-bold'>
                  ${(invoice.total / 100).toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-sm text-neutral-500 mb-1'>Due Date</p>
                <p className='font-medium'>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              </div>
              {invoice.paidAt && (
                <div>
                  <p className='text-sm text-neutral-500 mb-1'>Paid On</p>
                  <p className='font-medium'>
                    {new Date(invoice.paidAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {!isClient && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                {invoice.status === "DRAFT" && (
                  <Button className='w-full' variant='default'>
                    <Send className='mr-2 h-4 w-4' />
                    Send Invoice
                  </Button>
                )}
                {invoice.status === "SENT" && (
                  <Button className='w-full' variant='default'>
                    <CheckCircle className='mr-2 h-4 w-4' />
                    Mark as Paid
                  </Button>
                )}
                <Button className='w-full' variant='outline'>
                  <Edit className='mr-2 h-4 w-4' />
                  Edit Invoice
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
