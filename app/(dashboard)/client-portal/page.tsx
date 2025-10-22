import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import {
  projects,
  projectMembers,
  tasks,
  invoices,
  files,
  approvals,
} from "@/src/db/schema";
import { eq, and, count } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FolderKanban,
  FileText,
  DollarSign,
  CheckCircle,
  Download,
  MessageSquare,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ClientPortalPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // This is a simplified client portal view
  // In production, you'd check if user role is CLIENT and show only their projects

  const isClient = session.user.role === "CLIENT";

  // Fetch projects (for clients, only their assigned projects)
  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      description: projects.description,
      status: projects.status,
      color: projects.color,
      dueDate: projects.dueDate,
    })
    .from(projects)
    .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
    .where(eq(projectMembers.userId, session.user.id))
    .limit(10);

  // Get project stats
  const projectStats = await Promise.all(
    userProjects.map(async (project) => {
      const [taskCount] = await db
        .select({ count: count() })
        .from(tasks)
        .where(eq(tasks.projectId, project.id));

      const [completedCount] = await db
        .select({ count: count() })
        .from(tasks)
        .where(and(eq(tasks.projectId, project.id), eq(tasks.status, "DONE")));

      return {
        ...project,
        totalTasks: taskCount.count,
        completedTasks: completedCount.count,
        progress:
          taskCount.count > 0
            ? Math.round((completedCount.count / taskCount.count) * 100)
            : 0,
      };
    })
  );

  // Fetch invoices (for clients, only their invoices)
  const userInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.clientId, session.user.id))
    .limit(10);

  // Fetch pending approvals
  const pendingApprovals = await db
    .select()
    .from(approvals)
    .where(
      and(
        eq(approvals.approverId, session.user.id),
        eq(approvals.status, "PENDING")
      )
    )
    .limit(5);

  // Fetch deliverable files (files from user's projects)
  const projectIds = userProjects.map((p) => p.id);
  const deliverables =
    projectIds.length > 0
      ? await db.select().from(files).where(eq(files.isPublic, true)).limit(10)
      : [];

  // Calculate totals
  const totalInvoiced = userInvoices.reduce((acc, inv) => acc + inv.total, 0);
  const paidInvoices = userInvoices.filter((inv) => inv.status === "PAID");
  const totalPaid = paidInvoices.reduce((acc, inv) => acc + inv.total, 0);
  const pendingAmount = totalInvoiced - totalPaid;

  const getInvoiceStatusColor = (status: string) => {
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
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          {isClient ? "My Projects" : "Client Portal"}
        </h1>
        <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
          {isClient
            ? "View your projects, invoices, and deliverables"
            : "Overview of client projects and deliverables"}
        </p>
      </div>

      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Projects
            </CardTitle>
            <FolderKanban className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {projectStats.filter((p) => p.status === "ACTIVE").length}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>
              {projectStats.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Invoiced
            </CardTitle>
            <DollarSign className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(totalInvoiced / 100).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>
              ${(totalPaid / 100).toLocaleString()} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Deliverables</CardTitle>
            <FileText className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{deliverables.length}</div>
            <p className='text-xs text-neutral-500 mt-1'>Files ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Approvals
            </CardTitle>
            <AlertCircle className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{pendingApprovals.length}</div>
            <p className='text-xs text-neutral-500 mt-1'>Need your review</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Alert */}
      {pendingApprovals.length > 0 && (
        <Card className='border-orange-200 dark:border-orange-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-orange-600 dark:text-orange-400'>
              <AlertCircle className='h-5 w-5' />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm mb-4'>
              You have {pendingApprovals.length} item(s) waiting for your
              approval
            </p>
            <div className='space-y-2'>
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <p className='font-medium'>{approval.title}</p>
                    <p className='text-sm text-neutral-500'>
                      {approval.type} • Due{" "}
                      {approval.dueDate
                        ? new Date(approval.dueDate).toLocaleDateString()
                        : "ASAP"}
                    </p>
                  </div>
                  <Button size='sm'>Review</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>
            Track the progress of your ongoing projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {projectStats.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className='block'>
                <div className='p-4 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                      <div
                        className='h-10 w-10 rounded-lg flex items-center justify-center'
                        style={{ backgroundColor: project.color || "#0070f3" }}>
                        <FolderKanban className='h-5 w-5 text-white' />
                      </div>
                      <div>
                        <h3 className='font-semibold'>{project.name}</h3>
                        <p className='text-sm text-neutral-500'>
                          {project.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <Badge>{project.status}</Badge>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-neutral-500'>Progress</span>
                      <span className='font-medium'>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                    <p className='text-xs text-neutral-500'>
                      {project.completedTasks} of {project.totalTasks} tasks
                      completed
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {projectStats.length === 0 && (
              <div className='text-center py-12 text-neutral-500'>
                <FolderKanban className='mx-auto h-12 w-12 mb-4 text-neutral-400' />
                <p>No projects assigned yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>View and pay your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userInvoices.slice(0, 5).map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div>
                        <p className='font-medium'>{invoice.invoiceNumber}</p>
                        <p className='text-xs text-neutral-500'>
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      ${(invoice.total / 100).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getInvoiceStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.status === "SENT" && (
                        <Button size='sm' variant='outline'>
                          Pay Now
                        </Button>
                      )}
                      {invoice.status === "PAID" && (
                        <Button size='sm' variant='ghost'>
                          <Download className='h-4 w-4' />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {userInvoices.length === 0 && (
              <div className='text-center py-8 text-neutral-500'>
                <p>No invoices yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle>Deliverables</CardTitle>
            <CardDescription>Download your project files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {deliverables.slice(0, 5).map((file) => (
                <div
                  key={file.id}
                  className='flex items-center justify-between p-3 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <FileText className='h-4 w-4 text-neutral-500' />
                    <div>
                      <p className='font-medium text-sm'>{file.name}</p>
                      <p className='text-xs text-neutral-500'>
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button size='sm' variant='ghost'>
                    <Download className='h-4 w-4' />
                  </Button>
                </div>
              ))}

              {deliverables.length === 0 && (
                <div className='text-center py-8 text-neutral-500'>
                  <FileText className='mx-auto h-8 w-8 mb-2 text-neutral-400' />
                  <p>No deliverables yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Get in touch with your project manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4'>
            <Button>
              <MessageSquare className='mr-2 h-4 w-4' />
              Start Chat
            </Button>
            <Button variant='outline'>View All Messages</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
