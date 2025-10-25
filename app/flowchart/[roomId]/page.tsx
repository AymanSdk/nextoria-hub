"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FlowchartPageClient } from "@/components/flowchart/flowchart-page-client";
import { getTemplateById } from "@/src/lib/flowchart/templates";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import "../../flowchart-styles.css";

export default function FlowchartPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const roomId = params.roomId as string;
  const templateId = searchParams.get("template");

  // Fetch workspace ID from user
  useEffect(() => {
    fetch("/api/user/workspace")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data?.id) {
          setWorkspaceId(result.data.id);
        } else {
          console.error("Invalid workspace response:", result);
          toast.error("Failed to load workspace");
        }
      })
      .catch((error) => {
        console.error("Error fetching workspace:", error);
        toast.error("Failed to load workspace");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Load template data if template parameter exists
  let initialData;
  let initialName: string | undefined;

  if (templateId) {
    const template = getTemplateById(templateId);
    if (template) {
      initialData = template.data;
      initialName = template.name;
    }
  }

  // For existing flowcharts (no template), don't set initialName
  // Let the hook load the name from the database
  // Only set a default name if it's a new flowchart (will be determined by the hook)

  // Show loading state while fetching workspace
  if (isLoading || !workspaceId) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-neutral-400' />
          <p className='text-neutral-500'>Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <FlowchartPageClient
      roomId={roomId}
      workspaceId={workspaceId}
      initialName={initialName}
      initialData={initialData}
    />
  );
}
