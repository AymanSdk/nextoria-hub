import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectsLoadingPage() {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <Skeleton className='h-9 w-48 mb-2' />
          <Skeleton className='h-5 w-96' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-28' />
          <Skeleton className='h-9 w-32' />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <Tabs defaultValue='projects' className='space-y-6'>
        <TabsList className='grid w-full max-w-md grid-cols-2'>
          <TabsTrigger value='projects' disabled>
            <Skeleton className='h-4 w-24' />
          </TabsTrigger>
          <TabsTrigger value='analytics' disabled>
            <Skeleton className='h-4 w-24' />
          </TabsTrigger>
        </TabsList>

        {/* Stats Cards Skeleton */}
        <div className='grid gap-4 md:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-8 w-16' />
                  </div>
                  <Skeleton className='h-12 w-12 rounded-full' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Bar Skeleton */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex flex-col lg:flex-row gap-4'>
              <Skeleton className='h-9 flex-1' />
              <Skeleton className='h-9 w-full lg:w-[180px]' />
              <Skeleton className='h-9 w-full lg:w-[180px]' />
              <Skeleton className='h-9 w-full lg:w-[120px]' />
              <div className='flex border rounded-md'>
                <Skeleton className='h-9 w-9 rounded-r-none' />
                <Skeleton className='h-9 w-9 rounded-l-none' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count Skeleton */}
        <Skeleton className='h-5 w-48' />

        {/* Project Cards Skeleton */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className='h-full border-l-4 border-l-neutral-200 dark:border-l-neutral-800'
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <Skeleton className='h-12 w-12 rounded-lg' />
                  <div className='space-y-2'>
                    <Skeleton className='h-5 w-16' />
                    <Skeleton className='h-5 w-14' />
                  </div>
                </div>
                <Skeleton className='h-6 w-3/4 mt-4' />
                <div className='space-y-1'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-2/3' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <Skeleton className='h-4 w-16' />
                      <Skeleton className='h-4 w-8' />
                    </div>
                    <Skeleton className='h-2 w-full rounded-full' />
                    <Skeleton className='h-3 w-32 mt-1' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <Skeleton className='h-4 w-12' />
                      <Skeleton className='h-4 w-20' />
                    </div>
                    <Skeleton className='h-4 w-16' />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
