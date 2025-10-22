import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo } from "lucide-react";

export default async function TasksPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Tasks</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            View and manage all your tasks
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Task
        </Button>
      </div>

      <Card>
        <CardContent className='flex flex-col items-center justify-center py-16'>
          <ListTodo className='h-16 w-16 text-neutral-400 mb-4' />
          <h3 className='text-lg font-semibold mb-2'>Task Management</h3>
          <p className='text-neutral-500 text-center max-w-md mb-4'>
            Tasks are managed within projects. Go to a specific project to view
            and manage its tasks on the Kanban board.
          </p>
          <Button asChild>
            <a href='/projects'>View Projects</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
