import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";

export default async function FilesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Files</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Manage and share files
          </p>
        </div>
        <Button>
          <Upload className='mr-2 h-4 w-4' />
          Upload Files
        </Button>
      </div>

      <Card>
        <CardContent className='flex flex-col items-center justify-center py-16'>
          <FileText className='h-16 w-16 text-neutral-400 mb-4' />
          <h3 className='text-lg font-semibold mb-2'>File Management</h3>
          <p className='text-neutral-500 text-center max-w-md mb-4'>
            File management system coming soon. Upload, organize, and share
            files with your team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
