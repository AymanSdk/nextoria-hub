/**
 * API Middleware
 * Authentication, authorization, and request handling
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { hasPermission } from "@/src/lib/auth/rbac";
import { Role } from "@/src/lib/constants/roles";

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    workspaceId?: string;
  };
}

/**
 * Require authentication
 */
export async function requireAuth(request: NextRequest) {
  const session = await getSession();

  if (!session?.user) {
    return {
      error: "Unauthorized",
      status: 401,
    };
  }

  return {
    user: session.user,
  };
}

/**
 * Require specific role
 */
export async function requireRole(request: NextRequest, allowedRoles: Role[]) {
  const auth = await requireAuth(request);

  if ("error" in auth) {
    return auth;
  }

  if (!allowedRoles.includes(auth.user.role)) {
    return {
      error: "Forbidden: Insufficient permissions",
      status: 403,
    };
  }

  return { user: auth.user };
}

/**
 * Require specific permission
 */
export async function requirePermission(
  request: NextRequest,
  resource: Parameters<typeof hasPermission>[1],
  action: string
) {
  const auth = await requireAuth(request);

  if ("error" in auth) {
    return auth;
  }

  if (!hasPermission(auth.user.role, resource, action)) {
    return {
      error: `Forbidden: You don't have permission to ${action} ${resource}`,
      status: 403,
    };
  }

  return { user: auth.user };
}

/**
 * API Response helpers
 */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string | undefined, status = 400) {
  return NextResponse.json(
    { success: false, error: message || "An error occurred" },
    { status }
  );
}

export function apiValidationError(errors: Record<string, string>) {
  return NextResponse.json(
    { success: false, error: "Validation failed", errors },
    { status: 422 }
  );
}

/**
 * Get client IP address
 */
export function getClientIp(request: NextRequest): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    undefined
  );
}

/**
 * Get user agent
 */
export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get("user-agent") || undefined;
}

/**
 * Parse request body safely
 */
export async function parseRequestBody<T = unknown>(
  request: NextRequest
): Promise<T | null> {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or a dedicated service
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Apply rate limiting to request
 */
export function rateLimit(
  request: NextRequest,
  identifier: string,
  maxRequests = 100,
  windowMs = 60000
) {
  const result = checkRateLimit(identifier, maxRequests, windowMs);

  if (!result.allowed) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
        },
      }
    );
  }

  return null; // No error, proceed
}
