import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { ProjectRequestForm } from "@/components/project-requests/project-request-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewProjectRequestPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only clients can create project requests
  if (session.user.role !== "CLIENT") {
    redirect("/projects");
  }

  return (
    <div className='w-full min-h-[calc(100vh-4rem)] flex items-start justify-center py-8 px-4'>
      <div className='w-full max-w-4xl space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/project-requests'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='h-5 w-5' />
            </Button>
          </Link>
          <div className='flex-1'>
            <h1 className='text-3xl font-bold tracking-tight'>New Project Request</h1>
            <p className='text-muted-foreground mt-1'>
              Submit a project request for our team to review
            </p>
          </div>
        </div>

        {/* Form */}
        <ProjectRequestForm />
      </div>
    </div>
  );
}
