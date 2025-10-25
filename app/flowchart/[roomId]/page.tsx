import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { FlowchartCanvas } from "@/components/flowchart/flowchart-canvas";
import Link from "next/link";
import { ChevronLeft, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import "../../flowchart-styles.css";

interface FlowchartPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function FlowchartPage({ params }: FlowchartPageProps) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { roomId } = await params;

  return (
    <div className='fixed inset-0 overflow-hidden bg-background'>
      {/* Enhanced Header */}
      <header className='h-14 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b flex items-center justify-between px-4 z-50 shadow-sm'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/flowchart' className='flex items-center gap-2'>
              <ChevronLeft className='h-4 w-4' />
              <span className='hidden sm:inline'>Back</span>
            </Link>
          </Button>

          <div className='h-6 w-px bg-border' />

          <div className='flex items-center gap-2'>
            <Workflow className='h-5 w-5 text-primary' />
            <div>
              <h1 className='text-sm font-semibold'>Collaborative Flowchart</h1>
              <p className='text-xs text-muted-foreground hidden sm:block'>
                Room: {roomId}
              </p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <div className='text-xs text-muted-foreground hidden md:block'>
            <kbd className='px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500'>
              Delete
            </kbd>{" "}
            to remove selected
          </div>
        </div>
      </header>

      {/* Canvas */}
      <div className='h-[calc(100vh-3.5rem)]'>
        <FlowchartCanvas />
      </div>
    </div>
  );
}
