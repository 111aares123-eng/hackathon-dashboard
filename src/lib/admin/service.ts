import { eq, and, desc, sql, ilike } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import type { User, TeacherApprovalRequest, AuditLog } from "@/db/schema";
import { assertAdmin, ForbiddenError } from "../auth/guards";
import {
  reviewTeacherRequestSchema,
  revokeTeacherSchema,
  auditLogFilterSchema,
  type AuditLogFilterInput,
} from "@/validators/admin";

export interface AdminDashboardMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  pendingTeacherRequests: number;
  publishedEventsCount: number;
  draftEventsCount: number;
  completedEventsCount: number;
  cancelledEventsCount: number;
  recentAuditLogs: Array<
    AuditLog & {
      actor?: { name: string; email: string } | null;
    }
  >;
}

export interface TeacherApprovalWithUser extends TeacherApprovalRequest {
  user: {
    id: string;
    name: string;
    email: string;
    department: string;
    registerNumber: string | null;
    staffId: string | null;
    designation: string | null;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Sanitizes audit metadata to prevent accidental leakage of sensitive authentication
 * credentials (tokens, password hashes, secrets) in admin audit views.
 */
export function sanitizeAuditMetadata(metadata: unknown): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== "object") return null;

  const clone: Record<string, unknown> = {};
  const sensitivePatterns = ["password", "token", "secret", "hash", "key", "cookie", "auth"];

  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    const isSensitive = sensitivePatterns.some((pattern) =>
      key.toLowerCase().includes(pattern)
    );

    if (isSensitive) {
      clone[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      clone[key] = sanitizeAuditMetadata(value);
    } else {
      clone[key] = value;
    }
  }

  return clone;
}

/**
 * Retrieves aggregate governance metrics for the department administrator dashboard.
 * Requires administrator role.
 */
export async function getAdminDashboardMetrics(
  db: NodePgDatabase<typeof schema>,
  adminUser: User
): Promise<AdminDashboardMetrics> {
  assertAdmin(adminUser);

  // 1. User counts
  const [studentCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users)
    .where(eq(schema.users.role, "STUDENT"));

  const [teacherCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users)
    .where(eq(schema.users.role, "TEACHER"));

  const [adminCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users)
    .where(eq(schema.users.role, "ADMIN"));

  // 2. Pending faculty requests count
  const [pendingRequestsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.teacherApprovalRequests)
    .where(eq(schema.teacherApprovalRequests.status, "PENDING"));

  // 3. Event counts by status
  const [publishedEventsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(eq(schema.events.status, "PUBLISHED"));

  const [draftEventsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(eq(schema.events.status, "DRAFT"));

  const [completedEventsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(eq(schema.events.status, "COMPLETED"));

  const [cancelledEventsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(eq(schema.events.status, "CANCELLED"));

  // 4. Recent audit activity
  const recentLogs = await db.query.auditLogs.findMany({
    orderBy: [desc(schema.auditLogs.createdAt)],
    limit: 8,
    with: {
      actor: {
        columns: {
          name: true,
          email: true,
        },
      },
    },
  });

  const sanitizedRecentLogs = recentLogs.map((log) => ({
    ...log,
    metadata: sanitizeAuditMetadata(log.metadata),
  }));

  return {
    totalStudents: Number(studentCountResult?.count || 0),
    totalTeachers: Number(teacherCountResult?.count || 0),
    totalAdmins: Number(adminCountResult?.count || 0),
    pendingTeacherRequests: Number(pendingRequestsResult?.count || 0),
    publishedEventsCount: Number(publishedEventsResult?.count || 0),
    draftEventsCount: Number(draftEventsResult?.count || 0),
    completedEventsCount: Number(completedEventsResult?.count || 0),
    cancelledEventsCount: Number(cancelledEventsResult?.count || 0),
    recentAuditLogs: sanitizedRecentLogs,
  };
}

/**
 * Lists teacher approval requests with applicant profile details.
 */
export async function listTeacherApprovalRequests(
  db: NodePgDatabase<typeof schema>,
  adminUser: User,
  statusFilter?: string
): Promise<TeacherApprovalWithUser[]> {
  assertAdmin(adminUser);

  const whereClause =
    statusFilter && statusFilter !== "ALL"
      ? eq(
          schema.teacherApprovalRequests.status,
          statusFilter as "PENDING" | "APPROVED" | "REJECTED"
        )
      : undefined;

  const requests = await db.query.teacherApprovalRequests.findMany({
    where: whereClause,
    orderBy: [desc(schema.teacherApprovalRequests.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          department: true,
          registerNumber: true,
          staffId: true,
          designation: true,
        },
      },
      reviewer: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return requests as unknown as TeacherApprovalWithUser[];
}

/**
 * Lists active faculty members (approved teachers and administrators).
 */
export async function listFacultyMembers(
  db: NodePgDatabase<typeof schema>,
  adminUser: User
): Promise<User[]> {
  assertAdmin(adminUser);

  const faculty = await db.query.users.findMany({
    where: eq(schema.users.isApprovedTeacher, true),
    orderBy: [schema.users.name],
  });

  return faculty;
}

/**
 * Processes an administrator decision (APPROVE or REJECT) for a teacher approval request.
 * Enforces atomic database transaction and logs audit entry.
 */
export async function processTeacherApprovalDecision(
  db: NodePgDatabase<typeof schema>,
  adminUser: User,
  rawInput: unknown
): Promise<TeacherApprovalRequest> {
  assertAdmin(adminUser);

  const parsed = reviewTeacherRequestSchema.parse(rawInput);

  const request = await db.query.teacherApprovalRequests.findFirst({
    where: eq(schema.teacherApprovalRequests.id, parsed.requestId),
  });

  if (!request) {
    throw new Error("Teacher approval request not found.");
  }

  if (request.status !== "PENDING") {
    throw new Error(`Request has already been processed with status: ${request.status}`);
  }

  // Self-approval protection: an administrator cannot approve their own teacher request
  if (adminUser.id === request.userId) {
    throw new ForbiddenError(
      "Self-approval is forbidden. An administrator cannot approve their own faculty request."
    );
  }

  const reviewedAt = new Date();

  return await db.transaction(async (tx) => {
    if (parsed.decision === "APPROVE") {
      const [updatedRequest] = await tx
        .update(schema.teacherApprovalRequests)
        .set({
          status: "APPROVED",
          reviewedBy: adminUser.id,
          reviewNotes: parsed.reviewNotes,
          reviewedAt,
          updatedAt: reviewedAt,
        })
        .where(eq(schema.teacherApprovalRequests.id, parsed.requestId))
        .returning();

      await tx
        .update(schema.users)
        .set({
          role: "TEACHER",
          isApprovedTeacher: true,
          staffId: request.staffId,
          designation: request.designation,
          department: request.department,
          updatedAt: reviewedAt,
        })
        .where(eq(schema.users.id, request.userId));

      await tx.insert(schema.auditLogs).values({
        actorId: adminUser.id,
        action: "TEACHER_APPROVED",
        targetType: "TEACHER_APPROVAL",
        targetId: parsed.requestId,
        metadata: {
          applicantUserId: request.userId,
          staffId: request.staffId,
          designation: request.designation,
          notes: parsed.reviewNotes || null,
        },
      });

      return updatedRequest;
    } else {
      const [updatedRequest] = await tx
        .update(schema.teacherApprovalRequests)
        .set({
          status: "REJECTED",
          reviewedBy: adminUser.id,
          reviewNotes: parsed.reviewNotes,
          reviewedAt,
          updatedAt: reviewedAt,
        })
        .where(eq(schema.teacherApprovalRequests.id, parsed.requestId))
        .returning();

      await tx.insert(schema.auditLogs).values({
        actorId: adminUser.id,
        action: "TEACHER_REJECTED",
        targetType: "TEACHER_APPROVAL",
        targetId: parsed.requestId,
        metadata: {
          applicantUserId: request.userId,
          staffId: request.staffId,
          notes: parsed.reviewNotes || null,
        },
      });

      return updatedRequest;
    }
  });
}

/**
 * Revokes publishing privileges for a faculty member.
 * Protects against self-revocation and removing the last administrator.
 */
export async function revokeTeacherPrivileges(
  db: NodePgDatabase<typeof schema>,
  adminUser: User,
  rawInput: unknown
): Promise<User> {
  assertAdmin(adminUser);

  const parsed = revokeTeacherSchema.parse(rawInput);

  const targetUser = await db.query.users.findFirst({
    where: eq(schema.users.id, parsed.targetUserId),
  });

  if (!targetUser) {
    throw new Error("Target faculty member not found.");
  }

  // Prevent self-demotion
  if (targetUser.id === adminUser.id) {
    throw new ForbiddenError("You cannot revoke your own administrative privileges.");
  }

  // Prevent removing the final administrator
  if (targetUser.role === "ADMIN") {
    const [adminCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.role, "ADMIN"));

    const adminCount = Number(adminCountResult?.count || 0);
    if (adminCount <= 1) {
      throw new ForbiddenError(
        "Cannot revoke privileges of the only remaining system administrator."
      );
    }
  }

  return await db.transaction(async (tx) => {
    const [updatedUser] = await tx
      .update(schema.users)
      .set({
        role: "STUDENT",
        isApprovedTeacher: false,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, parsed.targetUserId))
      .returning();

    await tx.insert(schema.auditLogs).values({
      actorId: adminUser.id,
      action: "TEACHER_REVOKED",
      targetType: "USER",
      targetId: parsed.targetUserId,
      metadata: {
        revokedByName: adminUser.name,
        revokedByEmail: adminUser.email,
        previousRole: targetUser.role,
        reason: parsed.reason || "Privileges revoked by department administrator",
      },
    });

    return updatedUser;
  });
}

/**
 * Retrieves paginated audit logs for governance oversight.
 * Automatically redacts sensitive metadata. Strictly append-only.
 */
export async function listAuditLogs(
  db: NodePgDatabase<typeof schema>,
  adminUser: User,
  rawFilters?: AuditLogFilterInput
): Promise<
  PaginatedResult<
    AuditLog & {
      actor?: { name: string; email: string; role: string } | null;
    }
  >
> {
  assertAdmin(adminUser);

  const filters = auditLogFilterSchema.parse(rawFilters || {});
  const offset = (filters.page - 1) * filters.pageSize;

  const conditions = [];

  if (filters.action && filters.action !== "ALL") {
    conditions.push(eq(schema.auditLogs.action, filters.action));
  }

  if (filters.search && filters.search.trim() !== "") {
    conditions.push(ilike(schema.auditLogs.targetId, `%${filters.search.trim()}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.auditLogs)
    .where(whereClause);

  const total = Number(totalResult?.count || 0);

  const logs = await db.query.auditLogs.findMany({
    where: whereClause,
    orderBy: [desc(schema.auditLogs.createdAt)],
    limit: filters.pageSize,
    offset,
    with: {
      actor: {
        columns: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  const sanitizedLogs = logs.map((log) => ({
    ...log,
    metadata: sanitizeAuditMetadata(log.metadata),
  }));

  return {
    items: sanitizedLogs,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(total / filters.pageSize) || 1,
  };
}
