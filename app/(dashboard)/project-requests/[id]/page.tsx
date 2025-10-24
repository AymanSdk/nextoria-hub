import { getSession } from "@/src/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/src/db";
import { projectRequests, clients, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectRequestDetail } from "@/components/project-requests/project-request-detail";

interface ProjectRequestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectRequestPage({ params }: ProjectRequestPageProps) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  // Fetch the request with related data
  const [requestData] = await db
    .select({
      request: projectRequests,
      client: clients,
      requestedByUser: users,
    })
    .from(projectRequests)
    .leftJoin(clients, eq(projectRequests.clientId, clients.id))
    .leftJoin(users, eq(projectRequests.requestedBy, users.id))
    .where(eq(projectRequests.id, id))
    .limit(1);

  if (!requestData) {
    notFound();
  }

  const { request, client, requestedByUser } = requestData;

  // Clients can only view their own requests
  if (session.user.role === "CLIENT" && request.requestedBy !== session.user.id) {
    redirect("/project-requests");
  }

  return (
    <div className='w-full'>
      <div className='max-w-5xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/project-requests'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='h-5 w-5' />
            </Button>
          </Link>
          <div className='flex-1'>
            <h1 className='text-3xl font-bold tracking-tight'>Project Request Details</h1>
            <p className='text-muted-foreground mt-1'>
              {session.user.role === "CLIENT"
                ? "View your project request status"
                : "Review and manage this project request"}
            </p>
          </div>
        </div>

        {/* Request Detail */}
        <ProjectRequestDetail
          request={request}
          client={client}
          requestedByUser={requestedByUser}
          currentUserRole={session.user.role}
        />
      </div>
    </div>
  );
}
