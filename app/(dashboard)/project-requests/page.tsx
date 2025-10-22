import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { projectRequests, clients } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";

const statusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: Eye,
  },
  APPROVED: {
    label: "Approved",
    color: "bg-green-500/10 text-green-700 dark:text-green-400",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-500/10 text-red-700 dark:text-red-400",
    icon: XCircle,
  },
};

const priorityConfig = {
  LOW: {
    label: "Low",
    color: "bg-neutral-500/10 text-neutral-700 dark:text-neutral-400",
  },
  MEDIUM: { label: "Medium", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  HIGH: { label: "High", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  URGENT: { label: "Urgent", color: "bg-red-500/10 text-red-700 dark:text-red-400" },
};

export default async function ProjectRequestsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const isClient = session.user.role === "CLIENT";

  let requests;

  if (isClient) {
    // Clients see only their own requests
    requests = await db
      .select()
      .from(projectRequests)
      .where(eq(projectRequests.requestedBy, session.user.id))
      .orderBy(desc(projectRequests.createdAt))
      .limit(50);
  } else {
    // Admins/Team see all requests with client info
    requests = await db
      .select({
        request: projectRequests,
        client: clients,
      })
      .from(projectRequests)
      .leftJoin(clients, eq(projectRequests.clientId, clients.id))
      .orderBy(desc(projectRequests.createdAt))
      .limit(50);
  }

  const pendingCount = isClient
    ? (requests as (typeof projectRequests.$inferSelect)[]).filter(
        (r) => r.status === "PENDING"
      ).length
    : (requests as any[]).filter((r) => r.request.status === "PENDING").length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {isClient ? "My Project Requests" : "Project Requests"}
          </h1>
          <p className='text-muted-foreground mt-2'>
            {isClient
              ? "View and manage your project requests"
              : "Review and manage client project requests"}
          </p>
        </div>
        {isClient && (
          <Link href='/project-requests/new'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              New Request
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{requests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending Review</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Approved</CardTitle>
            <CheckCircle2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isClient
                ? (requests as (typeof projectRequests.$inferSelect)[]).filter(
                    (r) => r.status === "APPROVED"
                  ).length
                : (requests as any[]).filter((r) => r.request.status === "APPROVED")
                    .length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Rejected</CardTitle>
            <XCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isClient
                ? (requests as (typeof projectRequests.$inferSelect)[]).filter(
                    (r) => r.status === "REJECTED"
                  ).length
                : (requests as any[]).filter((r) => r.request.status === "REJECTED")
                    .length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>{isClient ? "Your Requests" : "All Requests"}</CardTitle>
          <CardDescription>
            {isClient
              ? "Track the status of your project requests"
              : "Review and respond to client project requests"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-muted-foreground'>
                {isClient
                  ? "No project requests yet. Start by creating one!"
                  : "No project requests from clients yet."}
              </p>
              {isClient && (
                <Link href='/project-requests/new'>
                  <Button className='mt-4'>
                    <Plus className='mr-2 h-4 w-4' />
                    Create Request
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {isClient
                ? (requests as (typeof projectRequests.$inferSelect)[]).map((request) => {
                    const StatusIcon =
                      statusConfig[request.status as keyof typeof statusConfig].icon;
                    return (
                      <Link
                        key={request.id}
                        href={`/project-requests/${request.id}`}
                        className='block'
                      >
                        <div className='flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
                          <div className='flex-1'>
                            <div className='flex items-start gap-3'>
                              <div className='flex-1'>
                                <h3 className='font-semibold text-lg'>{request.title}</h3>
                                <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                  {request.description}
                                </p>
                                <div className='flex items-center gap-2 mt-3'>
                                  <Badge
                                    className={
                                      statusConfig[
                                        request.status as keyof typeof statusConfig
                                      ].color
                                    }
                                  >
                                    <StatusIcon className='mr-1 h-3 w-3' />
                                    {
                                      statusConfig[
                                        request.status as keyof typeof statusConfig
                                      ].label
                                    }
                                  </Badge>
                                  <Badge
                                    className={
                                      priorityConfig[
                                        request.priority as keyof typeof priorityConfig
                                      ].color
                                    }
                                  >
                                    {
                                      priorityConfig[
                                        request.priority as keyof typeof priorityConfig
                                      ].label
                                    }
                                  </Badge>
                                  <span className='text-xs text-muted-foreground'>
                                    {new Date(request.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                : (requests as any[]).map(({ request, client }) => {
                    const StatusIcon =
                      statusConfig[request.status as keyof typeof statusConfig].icon;
                    return (
                      <Link
                        key={request.id}
                        href={`/project-requests/${request.id}`}
                        className='block'
                      >
                        <div className='flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
                          <div className='flex-1'>
                            <div className='flex items-start gap-3'>
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <h3 className='font-semibold text-lg'>
                                    {request.title}
                                  </h3>
                                  {client && (
                                    <span className='text-sm text-muted-foreground'>
                                      by {client.name}
                                    </span>
                                  )}
                                </div>
                                <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                  {request.description}
                                </p>
                                <div className='flex items-center gap-2 mt-3'>
                                  <Badge
                                    className={
                                      statusConfig[
                                        request.status as keyof typeof statusConfig
                                      ].color
                                    }
                                  >
                                    <StatusIcon className='mr-1 h-3 w-3' />
                                    {
                                      statusConfig[
                                        request.status as keyof typeof statusConfig
                                      ].label
                                    }
                                  </Badge>
                                  <Badge
                                    className={
                                      priorityConfig[
                                        request.priority as keyof typeof priorityConfig
                                      ].color
                                    }
                                  >
                                    {
                                      priorityConfig[
                                        request.priority as keyof typeof priorityConfig
                                      ].label
                                    }
                                  </Badge>
                                  <span className='text-xs text-muted-foreground'>
                                    {new Date(request.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
