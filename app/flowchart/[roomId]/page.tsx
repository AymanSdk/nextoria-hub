"use client";

import { useParams, useSearchParams } from "next/navigation";
import { FlowchartPageClient } from "@/components/flowchart/flowchart-page-client";
import { getTemplateById } from "@/src/lib/flowchart/templates";
import "../../flowchart-styles.css";

export default function FlowchartPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomId = params.roomId as string;
  const templateId = searchParams.get("template");

  // For now, using placeholder workspace - you'll need to fetch from session
  const workspaceId = "placeholder-workspace";

  // Load template data if template parameter exists
  let initialData;
  let initialName = `Flowchart ${roomId}`;

  if (templateId) {
    const template = getTemplateById(templateId);
    if (template) {
      initialData = template.data;
      initialName = template.name;
    }
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
