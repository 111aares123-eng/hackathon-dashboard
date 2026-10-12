import { eq, and } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import type { User, TeacherApprovalRequest } from "@/db/schema";
import { assertAdmin, ForbiddenError } from "./guards";

export interface SubmitTeacherRequestParams {
  userId: string;
  staffId: string;
  department: string;
  designation: string;
  proofUrl?: string;
}

export interface ReviewTeacherRequestParams {
  adminUser: User;
  requestId: string;
  decision: "APPROVE" | "REJECT";
  reviewNotes?: string;
}

/**
 * Submits a faculty verification request.
 * Creates an entry with status strictly set to 'PENDING'.
 */
export async function submitTeacherApprovalRequest(
  db: NodePgDatabase<typeof schema>,
  params: SubmitTeacherRequestParams
): Promise<TeacherApprovalRequest> {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, params.userId),
  });

  if (!user) {
    throw new Error("Target user does not exist.");
  }

  if (user.isApprovedTeacher && user.role === "TEACHER") {
    throw new Error("User is already an approved faculty member.");
  }

  // Check for existing pending request
  const existingPending = await db.query.teacherApprovalRequests.findFirst({
    where: and(
      eq(schema.teacherApprovalRequests.userId, params.userId),
      eq(schema.teacherApprovalRequests.status, "PENDING")
    ),
  });

  if (existingPending) {
    throw new Error("A faculty approval request is already pending review.");
  }

  const [request] = await db
    .insert(schema.teacherApprovalRequests)
    .values({
      userId: params.userId,
      staffId: params.staffId.trim(),
      department: params.department.trim(),
      designation: params.designation.trim(),
      proofUrl: params.proofUrl?.trim(),
      status: "PENDING",
    })
    .returning();

  await db.insert(schema.auditLogs).values({
    actorId: params.userId,
    action: "TEACHER_APPROVAL_REQUESTED",
    targetType: "TEACHER_APPROVAL",
    targetId: request.id,
    metadata: {
      staffId: params.staffId,
      department: params.department,
      designation: params.designation,
    },
  });

  return request;
}

/**
 * Reviews a faculty verification request.
 *
 * Security Requirements:
 * 1. Actor must be an active administrator (enforced by assertAdmin).
 * 2. An administrator cannot approve their own teacher request.
 * 3. Actions are logged in audit_logs immutably.
 */
export async function reviewTeacherApprovalRequest(
  db: NodePgDatabase<typeof schema>,
  params: ReviewTeacherRequestParams
): Promise<TeacherApprovalRequest> {
  // 1. Enforce administrative role
  assertAdmin(params.adminUser);

  const request = await db.query.teacherApprovalRequests.findFirst({
    where: eq(schema.teacherApprovalRequests.id, params.requestId),
  });

  if (!request) {
    throw new Error("Faculty approval request not found.");
  }

  if (request.status !== "PENDING") {
    throw new Error(`Request has already been processed with status: ${request.status}`);
  }

  // 2. Prevent self-approval (actor cannot be the applicant)
  if (params.adminUser.id === request.userId) {
    throw new ForbiddenError(
      "Self-approval is forbidden. An administrator cannot approve their own faculty request."
    );
  }

  const reviewedAt = new Date();

  if (params.decision === "APPROVE") {
    // Transactional update: request -> APPROVED and user -> TEACHER + isApprovedTeacher
    const [updatedRequest] = await db
      .update(schema.teacherApprovalRequests)
      .set({
        status: "APPROVED",
        reviewedBy: params.adminUser.id,
        reviewNotes: params.reviewNotes,
        reviewedAt,
      })
      .where(eq(schema.teacherApprovalRequests.id, params.requestId))
      .returning();

    await db
      .update(schema.users)
      .set({
        role: "TEACHER",
        isApprovedTeacher: true,
        staffId: request.staffId,
        designation: request.designation,
      })
      .where(eq(schema.users.id, request.userId));

    await db.insert(schema.auditLogs).values({
      actorId: params.adminUser.id,
      action: "TEACHER_APPROVED",
      targetType: "TEACHER_APPROVAL",
      targetId: params.requestId,
      metadata: {
        userId: request.userId,
        staffId: request.staffId,
        notes: params.reviewNotes,
      },
    });

    return updatedRequest;
  } else {
    const [updatedRequest] = await db
      .update(schema.teacherApprovalRequests)
      .set({
        status: "REJECTED",
        reviewedBy: params.adminUser.id,
        reviewNotes: params.reviewNotes,
        reviewedAt,
      })
      .where(eq(schema.teacherApprovalRequests.id, params.requestId))
      .returning();

    await db.insert(schema.auditLogs).values({
      actorId: params.adminUser.id,
      action: "TEACHER_REJECTED",
      targetType: "TEACHER_APPROVAL",
      targetId: params.requestId,
      metadata: {
        userId: request.userId,
        notes: params.reviewNotes,
      },
    });

    return updatedRequest;
  }
}
