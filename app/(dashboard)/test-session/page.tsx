"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkUserInDatabase } from "./actions";

export default function TestSessionPage() {
  const { data: session, status, update } = useSession();
  const [dbData, setDbData] = React.useState<any>(null);

  const handleRefreshSession = async () => {
    console.log("Before update:", session);
    console.log("Calling update({})...");
    const result = await update({});
    console.log("Update result:", result);
    console.log("After update:", session);
  };

  const handleCheckDatabase = async () => {
    const data = await checkUserInDatabase();
    console.log("Database data:", data);
    setDbData(data);
  };

  const testImageUrl = async (url: string) => {
    console.log("Testing image URL:", url);

    try {
      const response = await fetch(url, { method: "HEAD" });
      console.log("Image URL test - Status:", response.status);
      console.log(
        "Image URL test - Headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        console.log("✅ Image URL is accessible");
      } else {
        console.error("❌ Image URL returned error status:", response.status);
      }
    } catch (error) {
      console.error("❌ Failed to fetch image URL:", error);
    }
  };

  React.useEffect(() => {
    if (session?.user?.image) {
      testImageUrl(session.user.image);
    }
  }, [session?.user?.image]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className='container mx-auto p-6'>
      <Card>
        <CardHeader>
          <CardTitle>Session Debug</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <strong>Status:</strong> {status}
          </div>

          <div>
            <strong>User ID:</strong> {session?.user?.id || "N/A"}
          </div>

          <div>
            <strong>Name:</strong> {session?.user?.name || "N/A"}
          </div>

          <div>
            <strong>Email:</strong> {session?.user?.email || "N/A"}
          </div>

          <div>
            <strong>Image:</strong> {session?.user?.image || "NULL"}
          </div>

          {session?.user?.image && (
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>Direct img tag test:</p>
              <img
                src={session.user.image}
                alt='User avatar'
                className='w-20 h-20 rounded-full border-2 border-green-500'
                onLoad={() => console.log("✅ Direct img loaded successfully")}
                onError={(e) => console.error("❌ Direct img failed to load:", e)}
              />
              <p className='text-xs text-muted-foreground break-all'>
                URL: {session.user.image}
              </p>
            </div>
          )}

          <div>
            <strong>Role:</strong> {session?.user?.role || "N/A"}
          </div>

          <div className='flex gap-2'>
            <Button onClick={handleRefreshSession}>Refresh Session</Button>
            <Button onClick={handleCheckDatabase} variant='secondary'>
              Check Database
            </Button>
            <Button onClick={handleSignOut} variant='destructive'>
              Sign Out & Sign Back In
            </Button>
          </div>

          {dbData && (
            <div>
              <strong>Database vs Session Comparison:</strong>
              <pre className='bg-muted p-4 rounded-md overflow-auto text-xs mt-2'>
                {JSON.stringify(dbData, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <strong>Full Session Object:</strong>
            <pre className='bg-muted p-4 rounded-md overflow-auto text-xs mt-2'>
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
