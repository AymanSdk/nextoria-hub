import { getSession } from "@/src/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Send, MoreHorizontal } from "lucide-react";
import Link from "next/link";

// Mock data
const mockInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    clientName: "ACME Corporation",
    projectName: "Website Redesign",
    total: 550000, // in cents
    status: "PAID",
    issueDate: new Date("2025-09-15"),
    dueDate: new Date("2025-10-15"),
    paidAt: new Date("2025-10-14"),
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    clientName: "TechStart Inc",
    projectName: "Mobile App",
    total: 320000,
    status: "SENT",
    issueDate: new Date("2025-10-01"),
    dueDate: new Date("2025-10-30"),
    paidAt: null,
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    clientName: "Global Corp",
    projectName: "Brand Strategy",
    total: 125000,
    status: "DRAFT",
    issueDate: new Date("2025-10-20"),
    dueDate: new Date("2025-11-15"),
    paidAt: null,
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    clientName: "StartupXYZ",
    projectName: "Marketing Campaign",
    total: 80000,
    status: "OVERDUE",
    issueDate: new Date("2025-09-10"),
    dueDate: new Date("2025-10-10"),
    paidAt: null,
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    VIEWED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    CANCELLED: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  };
  return colors[status] || colors.DRAFT;
};

export default async function InvoicesPage() {
  const session = await getSession();

  // Calculate stats
  const totalRevenue = mockInvoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = mockInvoices
    .filter((inv) => inv.status === "SENT" || inv.status === "VIEWED")
    .reduce((sum, inv) => sum + inv.total, 0);

  const overdueAmount = mockInvoices
    .filter((inv) => inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Manage and track all your invoices
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 100).toLocaleString()}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              From {mockInvoices.filter((i) => i.status === "PAID").length} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(pendingAmount / 100).toLocaleString()}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${(overdueAmount / 100).toLocaleString()}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {mockInvoices.filter((i) => i.status === "OVERDUE").length} overdue invoices
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
          <div className="space-y-3">
            {mockInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold">{invoice.invoiceNumber}</p>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {invoice.clientName} • {invoice.projectName}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Issued {invoice.issueDate.toLocaleDateString()} • Due{" "}
                    {invoice.dueDate.toLocaleDateString()}
                    {invoice.paidAt &&
                      ` • Paid ${invoice.paidAt.toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      ${(invoice.total / 100).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {invoice.status === "DRAFT" && (
                      <Button variant="outline" size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

