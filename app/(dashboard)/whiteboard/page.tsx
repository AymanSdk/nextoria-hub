import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { nanoid } from "nanoid";

export default async function WhiteboardIndexPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Generate a random room ID for quick start
  const randomRoomId = nanoid(10);

  return (
    <div>
      {/* Page Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight mb-2'>
          Collaborative Whiteboard
        </h1>
        <p className='text-muted-foreground'>
          Draw, brainstorm, and collaborate in real-time with your team
        </p>
      </div>

      {/* Create and Join Cards */}
      <div className='grid gap-6 md:grid-cols-2 mb-8'>
        {/* Create New Whiteboard */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Whiteboard</CardTitle>
            <CardDescription>
              Start a new collaborative whiteboard session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/whiteboard/${randomRoomId}`}>
              <Button className='w-full' size='lg'>
                Create Whiteboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Join Existing Whiteboard */}
        <Card>
          <CardHeader>
            <CardTitle>Join Whiteboard</CardTitle>
            <CardDescription>
              Enter a room ID to join an existing whiteboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                "use server";
                const roomId = formData.get("roomId") as string;
                if (roomId) {
                  redirect(`/whiteboard/${roomId}`);
                }
              }}
            >
              <div className='flex gap-2'>
                <input
                  type='text'
                  name='roomId'
                  placeholder='Enter room ID'
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  required
                />
                <Button type='submit' size='lg'>
                  Join
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className='grid gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Real-Time Collaboration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              See your teammates' changes instantly with CRDT-based sync
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Professional Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Access shapes, text, arrows, sticky notes, and more with tldraw
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Full-Screen Canvas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Canvas opens in full-screen mode for distraction-free work
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
