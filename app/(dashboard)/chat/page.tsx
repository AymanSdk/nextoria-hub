import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default async function ChatPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className='h-[calc(100vh-8rem)]'>
      <Card className='h-full'>
        <CardContent className='flex flex-col items-center justify-center h-full'>
          <MessageSquare className='h-16 w-16 text-neutral-400 mb-4' />
          <h3 className='text-lg font-semibold mb-2'>Chat Coming Soon</h3>
          <p className='text-neutral-500 text-center max-w-md'>
            Real-time chat functionality is being developed. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
