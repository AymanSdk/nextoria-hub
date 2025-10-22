import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { users, projects, invoices } from "@/src/db/schema";
import { eq, count, sql } from "drizzle-orm";
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
import { Plus, Users, DollarSign, Briefcase, Mail, Eye } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ClientsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch all clients (users with role CLIENT)
  const allClients = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "CLIENT"));

  // Get project and invoice counts for each client
  const clientsWithData = await Promise.all(
    allClients.map(async (client) => {
      // Count projects
      const [projectCount] = await db
        .select({ count: count() })
        .from(projects)
        .innerJoin(invoices, eq(projects.id, invoices.projectId))
        .where(eq(invoices.clientId, client.id));

      // Calculate total revenue from invoices
      const [revenue] = await db
        .select({
          total: sql<number>`COALESCE(SUM(${invoices.total}), 0)`,
          paid: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'PAID' THEN ${invoices.total} ELSE 0 END), 0)`,
        })
        .from(invoices)
        .where(eq(invoices.clientId, client.id));

      // Count invoices
      const [invoiceCount] = await db
        .select({ count: count() })
        .from(invoices)
        .where(eq(invoices.clientId, client.id));

      return {
        ...client,
        projectsCount: projectCount?.count || 0,
        invoicesCount: invoiceCount?.count || 0,
        totalRevenue: revenue?.total || 0,
        paidRevenue: revenue?.paid || 0,
      };
    })
  );

  // Calculate statistics
  const totalClients = clientsWithData.length;
  const activeClients = clientsWithData.filter((c) => c.isActive).length;
  const totalRevenue = clientsWithData.reduce(
    (acc, c) => acc + c.totalRevenue,
    0
  );
  const totalProjects = clientsWithData.reduce(
    (acc, c) => acc + c.projectsCount,
    0
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Clients</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Manage your clients and their projects
          </p>
        </div>
        <Link href='/clients/new'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Add Client
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Clients</CardTitle>
            <Users className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalClients}</div>
            <p className='text-xs text-neutral-500 mt-1'>
              {activeClients} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(totalRevenue / 100).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>From all clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Projects
            </CardTitle>
            <Briefcase className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalProjects}</div>
            <p className='text-xs text-neutral-500 mt-1'>
              Avg {Math.round(totalProjects / (totalClients || 1))} per client
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              $
              {Math.round(
                totalRevenue / (totalClients || 1) / 100
              ).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>Per client</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {clientsWithData.map((client) => (
          <Card
            key={client.id}
            className='hover:shadow-md transition-shadow cursor-pointer'>
            <CardHeader>
              <div className='flex items-start gap-4'>
                <Avatar className='h-12 w-12'>
                  <AvatarFallback className='bg-gradient-to-br from-purple-500 to-pink-600 text-white font-semibold'>
                    {client.name?.substring(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold truncate'>{client.name}</h3>
                      <p className='text-sm text-neutral-500 truncate flex items-center gap-1'>
                        <Mail className='h-3 w-3' />
                        {client.email}
                      </p>
                    </div>
                    <Badge
                      variant={client.isActive ? "default" : "secondary"}
                      className='text-xs'>
                      {client.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {/* Stats */}
                <div className='grid grid-cols-3 gap-2 text-center'>
                  <div className='p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg'>
                    <p className='text-xs text-neutral-500'>Projects</p>
                    <p className='text-lg font-bold'>{client.projectsCount}</p>
                  </div>
                  <div className='p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg'>
                    <p className='text-xs text-neutral-500'>Invoices</p>
                    <p className='text-lg font-bold'>{client.invoicesCount}</p>
                  </div>
                  <div className='p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg'>
                    <p className='text-xs text-neutral-500'>Revenue</p>
                    <p className='text-lg font-bold'>
                      ${Math.round(client.paidRevenue / 100)}k
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-2'>
                  <Link href={`/clients/${client.id}`} className='flex-1'>
                    <Button variant='outline' size='sm' className='w-full'>
                      <Eye className='h-3 w-3 mr-1' />
                      View
                    </Button>
                  </Link>
                  <Button variant='outline' size='sm' className='flex-1'>
                    <Mail className='h-3 w-3 mr-1' />
                    Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientsWithData.length === 0 && (
        <Card className='p-12'>
          <div className='text-center'>
            <Users className='mx-auto h-12 w-12 text-neutral-400' />
            <h3 className='mt-4 text-lg font-semibold'>No clients yet</h3>
            <p className='mt-2 text-neutral-500'>
              Add your first client to get started
            </p>
            <Link href='/clients/new'>
              <Button className='mt-4'>
                <Plus className='mr-2 h-4 w-4' />
                Add Client
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
