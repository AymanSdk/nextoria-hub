import { ReactNode } from "react";

// Full-screen layout for whiteboard (no dashboard wrapper)
export default function WhiteboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
