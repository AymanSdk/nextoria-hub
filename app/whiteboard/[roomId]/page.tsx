import { WhiteboardRoomProvider } from "@/components/whiteboard/whiteboard-room-provider";
import { CollaborativeWhiteboard } from "@/components/whiteboard/collaborative-whiteboard";
import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { whiteboards } from "@/src/db/schema";
import { eq } from "drizzle-orm";

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

  // Try to fetch saved whiteboard data if the roomId matches a saved whiteboard
  let savedData = null;
  const [savedWhiteboard] = await db
    .select()
    .from(whiteboards)
    .where(eq(whiteboards.id, roomId))
    .limit(1);

  if (savedWhiteboard) {
    savedData = savedWhiteboard.data as Record<string, any>;
    console.log("🟢 Loading saved whiteboard from database:", {
      id: savedWhiteboard.id,
      name: savedWhiteboard.name,
      recordCount: savedData ? Object.keys(savedData).length : 0,
      allKeys: savedData ? Object.keys(savedData) : [],
      shapes: savedData
        ? Object.keys(savedData).filter((k) => k.startsWith("shape:"))
        : [],
      hasData: !!savedData,
      dataType: typeof savedData,
    });
  } else {
    console.log(
      "🟡 No saved whiteboard found for roomId:",
      roomId,
      "- Creating new whiteboard"
    );
  }

  return (
    <div className='fixed inset-0 overflow-hidden bg-background'>
      <WhiteboardRoomProvider roomId={roomId} savedData={savedData}>
        <CollaborativeWhiteboard
          whiteboardId={savedWhiteboard?.id}
          whiteboardName={savedWhiteboard?.name}
          whiteboardDescription={savedWhiteboard?.description || undefined}
        />
      </WhiteboardRoomProvider>
    </div>
  );
}
