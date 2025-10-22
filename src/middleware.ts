import { auth } from "@/src/lib/auth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/signout",
  "/auth/error",
  "/auth/verify",
  "/auth/reset-password",
  "/api/auth",
];

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = ["/dashboard", "/projects", "/tasks", "/settings"];

/**
 * Admin-only routes
 */
const ADMIN_ROUTES = ["/admin", "/settings/workspace"];

/**
 * Check if a path matches any route pattern
 */
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route.endsWith("*")) {
      return path.startsWith(route.slice(0, -1));
    }
    return path === route || path.startsWith(`${route}/`);
  });
}

/**
 * Middleware function
 */
export default auth(async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public routes
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Redirect to sign-in if not authenticated
  if (!session?.user && matchesRoute(pathname, PROTECTED_ROUTES)) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check admin routes
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirect authenticated users from auth pages to dashboard
  if (session?.user && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

/**
 * Middleware config
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
