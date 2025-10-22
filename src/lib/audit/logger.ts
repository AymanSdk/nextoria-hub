/**
 * Audit Logging Service
 * Track all critical actions across the system
 */

import { db } from "@/src/db";
import { auditLogs } from "@/src/db/schema";
import type { AuditLog, NewAuditLog } from "@/src/db/schema";

type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "DOWNLOAD"
  | "SHARE"
  | "LOGIN"
  | "LOGOUT"
  | "ROLE_CHANGE"
  | "PERMISSION_CHANGE"
  | "PAYMENT";

type AuditEntityType =
  | "USER"
  | "WORKSPACE"
  | "PROJECT"
  | "TASK"
  | "INVOICE"
  | "FILE"
  | "ROLE"
  | "INTEGRATION"
  | "SETTING";

interface AuditLogParams {
  workspaceId?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  params: AuditLogParams
): Promise<AuditLog> {
  const newLog: NewAuditLog = {
    workspaceId: params.workspaceId,
    userId: params.userId,
    userEmail: params.userEmail,
    userRole: params.userRole,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    description: params.description,
    metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  };

  const [log] = await db.insert(auditLogs).values(newLog).returning();
  return log;
}

/**
 * Log user authentication
 */
export async function logAuth(params: {
  userId: string;
  userEmail: string;
  action: "LOGIN" | "LOGOUT";
  ipAddress?: string;
  userAgent?: string;
}) {
  return createAuditLog({
    userId: params.userId,
    userEmail: params.userEmail,
    action: params.action,
    entityType: "USER",
    entityId: params.userId,
    description: `User ${params.action.toLowerCase()}`,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Log role changes
 */
export async function logRoleChange(params: {
  workspaceId: string;
  adminId: string;
  adminEmail: string;
  targetUserId: string;
  targetUserEmail: string;
  oldRole: string;
  newRole: string;
  ipAddress?: string;
}) {
  return createAuditLog({
    workspaceId: params.workspaceId,
    userId: params.adminId,
    userEmail: params.adminEmail,
    action: "ROLE_CHANGE",
    entityType: "USER",
    entityId: params.targetUserId,
    description: `Changed role for ${params.targetUserEmail} from ${params.oldRole} to ${params.newRole}`,
    metadata: {
      targetUserId: params.targetUserId,
      targetUserEmail: params.targetUserEmail,
      oldRole: params.oldRole,
      newRole: params.newRole,
    },
    ipAddress: params.ipAddress,
  });
}

/**
 * Log file access
 */
export async function logFileAccess(params: {
  workspaceId: string;
  userId: string;
  userEmail: string;
  fileId: string;
  fileName: string;
  action: "VIEW" | "DOWNLOAD";
  ipAddress?: string;
}) {
  return createAuditLog({
    workspaceId: params.workspaceId,
    userId: params.userId,
    userEmail: params.userEmail,
    action: params.action,
    entityType: "FILE",
    entityId: params.fileId,
    description: `User ${params.action.toLowerCase()}ed file: ${
      params.fileName
    }`,
    metadata: {
      fileName: params.fileName,
    },
    ipAddress: params.ipAddress,
  });
}

/**
 * Log invoice payments
 */
export async function logPayment(params: {
  workspaceId: string;
  userId?: string;
  userEmail?: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  ipAddress?: string;
}) {
  return createAuditLog({
    workspaceId: params.workspaceId,
    userId: params.userId,
    userEmail: params.userEmail,
    action: "PAYMENT",
    entityType: "INVOICE",
    entityId: params.invoiceId,
    description: `Payment of ${params.amount / 100} ${
      params.currency
    } for invoice ${params.invoiceNumber}`,
    metadata: {
      invoiceNumber: params.invoiceNumber,
      amount: params.amount,
      currency: params.currency,
    },
    ipAddress: params.ipAddress,
  });
}

/**
 * Log entity creation
 */
export async function logCreate(params: {
  workspaceId: string;
  userId: string;
  userEmail: string;
  userRole: string;
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  ipAddress?: string;
}) {
  return createAuditLog({
    workspaceId: params.workspaceId,
    userId: params.userId,
    userEmail: params.userEmail,
    userRole: params.userRole,
    action: "CREATE",
    entityType: params.entityType,
    entityId: params.entityId,
    description: `Created ${params.entityType.toLowerCase()}: ${
      params.entityName
    }`,
    metadata: {
      entityName: params.entityName,
    },
    ipAddress: params.ipAddress,
  });
}

/**
 * Log entity update
 */
export async function logUpdate(params: {
  workspaceId: string;
  userId: string;
  userEmail: string;
  userRole: string;
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress?: string;
}) {
  return createAuditLog({
    workspaceId: params.workspaceId,
    userId: params.userId,
    userEmail: params.userEmail,
    userRole: params.userRole,
    action: "UPDATE",
    entityType: params.entityType,
    entityId: params.entityId,
    description: `Updated ${params.entityType.toLowerCase()}: ${
      params.entityName
    }`,
    metadata: {
      entityName: params.entityName,
      changes: params.changes,
    },
    ipAddress: params.ipAddress,
  });
}

/**
 * Log entity deletion
 */
export async function logDelete(params: {
  workspaceId: string;
  userId: string;
  userEmail: string;
  userRole: string;
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  ipAddress?: string;
}) {
  return createAuditLog({
    workspaceId: params.workspaceId,
    userId: params.userId,
    userEmail: params.userEmail,
    userRole: params.userRole,
    action: "DELETE",
    entityType: params.entityType,
    entityId: params.entityId,
    description: `Deleted ${params.entityType.toLowerCase()}: ${
      params.entityName
    }`,
    metadata: {
      entityName: params.entityName,
    },
    ipAddress: params.ipAddress,
  });
}
