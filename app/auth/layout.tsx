import { ReactNode } from "react";

// Force all auth pages to be dynamically rendered
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
