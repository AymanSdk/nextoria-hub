import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUser } from "@/src/lib/auth/session";

const f = createUploadthing();

export const ourFileRouter = {
  // Chat file upload - images, documents, etc.
  chatAttachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    pdf: { maxFileSize: "8MB", maxFileCount: 3 },
    video: { maxFileSize: "16MB", maxFileCount: 2 },
    audio: { maxFileSize: "8MB", maxFileCount: 3 },
    text: { maxFileSize: "2MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await getCurrentUser();
      return { userId: user.id, userName: user.name };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
