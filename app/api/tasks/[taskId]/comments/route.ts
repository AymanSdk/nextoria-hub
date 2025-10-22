import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { addTaskComment } from "@/src/lib/api/tasks";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
  parentCommentId: z.string().optional(),
});

/**
 * POST /api/tasks/[taskId]/comments
 * Add a comment to a task
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { taskId } = await params;
    const body = await req.json();

    const validated = createCommentSchema.parse(body);

    const comment = await addTaskComment({
      taskId,
      authorId: user.id,
      ...validated,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

