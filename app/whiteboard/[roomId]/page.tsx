import { WhiteboardRoomProvider } from "@/components/whiteboard/whiteboard-room-provider";
import { CollaborativeWhiteboard } from "@/components/whiteboard/collaborative-whiteboard";
import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";

interface WhiteboardPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function WhiteboardPage({ params }: WhiteboardPageProps) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { roomId } = await params;

  return (
    <div className='fixed inset-0 overflow-hidden bg-background'>
      <WhiteboardRoomProvider roomId={roomId}>
        <CollaborativeWhiteboard />
      </WhiteboardRoomProvider>
    </div>
  );
}
