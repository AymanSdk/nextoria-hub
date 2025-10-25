"use client";

import { usePathname } from "next/navigation";

/**
 * Dashboard Layout Content Wrapper
 * Conditionally applies padding and max-width based on the current route
 * Full-screen pages (like chat) bypass the wrapper
 */
export function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that should take full available space without padding/max-width
  const fullScreenPages = ["/chat"];

  const isFullScreenPage = fullScreenPages.some((page) => pathname.startsWith(page));

  if (isFullScreenPage) {
    // For full-screen pages, render children directly without wrapper
    return <main className='flex-1 overflow-hidden'>{children}</main>;
  }

  // For regular pages, apply the standard padding and max-width wrapper
  return (
    <main className='flex-1 overflow-y-auto overflow-x-hidden'>
      <div className='w-full mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8'>{children}</div>
    </main>
  );
}
