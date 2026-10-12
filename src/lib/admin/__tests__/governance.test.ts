import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeAuditMetadata,
  processTeacherApprovalDecision,
  revokeTeacherPrivileges,
  listAuditLogs,
  getAdminDashboardMetrics,
} from "../service";
import { cancelEvent } from "../../events/service";
import {
  assertAdmin,
  ForbiddenError,
  UnauthorizedError,
} from "../../auth/guards";
import {
  reviewTeacherRequestSchema,
  revokeTeacherSchema,
  adminCancelEventSchema,
} from "../../../validators/admin";
import type { User, TeacherApprovalRequest } from "@/db/schema";
import { createMockUser, createMockEvent } from "../../events/__tests__/test-fixtures";

type MockAdminDb = Parameters<typeof processTeacherApprovalDecision>[0];

describe("Administrative Governance, Approvals & Oversight Tests", () => {
  const adminUser = createMockUser({
    id: "a0000000-0000-4000-a000-000000000001",
    name: "Dr. Admin",
    email: "admin@rajalakshmi.edu.in",
    role: "ADMIN",
    isApprovedTeacher: true,
  });

  const teacherUser = createMockUser({
    id: "b0000000-0000-4000-a000-000000000001",
    name: "Dr. Faculty One",
    email: "faculty1@rajalakshmi.edu.in",
    role: "TEACHER",
    isApprovedTeacher: true,
  });

  const otherTeacher = createMockUser({
    id: "b0000000-0000-4000-a000-000000000002",
    name: "Dr. Faculty Two",
    email: "faculty2@rajalakshmi.edu.in",
    role: "TEACHER",
    isApprovedTeacher: true,
  });

  const studentUser = createMockUser({
    id: "c0000000-0000-4000-a000-000000000001",
    name: "Student Applicant",
    email: "student@rajalakshmi.edu.in",
    role: "STUDENT",
    isApprovedTeacher: false,
  });

  const samplePendingRequest: TeacherApprovalRequest = {
    id: "d0000000-0000-4000-a000-000000000001",
    userId: studentUser.id,
    staffId: "STF_AI_88",
    department: "Artificial Intelligence and Data Science",
    designation: "Assistant Professor",
    status: "PENDING",
    proofUrl: "https://proofs.rajalakshmi.org/id88.pdf",
    reviewedBy: null,
    reviewNotes: null,
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("1. Admin vs Non-Admin Authorization Guard", () => {
    it("assertAdmin grants access to ADMINISTRATOR role", () => {
      assert.doesNotThrow(() => assertAdmin(adminUser));
    });

    it("assertAdmin throws ForbiddenError for TEACHER role", () => {
      assert.throws(() => assertAdmin(teacherUser), ForbiddenError);
    });

    it("assertAdmin throws ForbiddenError for STUDENT role", () => {
      assert.throws(() => assertAdmin(studentUser), ForbiddenError);
    });

    it("assertAdmin throws UnauthorizedError for unauthenticated calls", () => {
      assert.throws(() => assertAdmin(null as unknown as User), UnauthorizedError);
    });
  });

  describe("2. Teacher Approval Workflow & Self-Approval Prevention", () => {
    it("reviewTeacherRequestSchema validates approval decision inputs", () => {
      const validApproval = {
        requestId: "d0000000-0000-4000-a000-000000000001",
        decision: "APPROVE",
        reviewNotes: "Staff directory credentials verified.",
      };
      const parsed = reviewTeacherRequestSchema.parse(validApproval);
      assert.strictEqual(parsed.decision, "APPROVE");

      const invalidDecision = {
        requestId: "d0000000-0000-4000-a000-000000000001",
        decision: "MAYBE",
      };
      assert.throws(() => reviewTeacherRequestSchema.parse(invalidDecision));
    });

    it("blocks self-approval when the reviewing admin is the applicant", async () => {
      const selfRequest: TeacherApprovalRequest = {
        ...samplePendingRequest,
        id: "d0000000-0000-4000-a000-000000000002",
        userId: adminUser.id, // Admin applied for their own request
      };

      const mockDb = {
        query: {
          teacherApprovalRequests: {
            findFirst: async () => selfRequest,
          },
        },
      } as unknown as MockAdminDb;

      await assert.rejects(
        () =>
          processTeacherApprovalDecision(mockDb, adminUser, {
            requestId: selfRequest.id,
            decision: "APPROVE",
          }),
        /Self-approval is forbidden/
      );
    });

    it("approves pending request inside transaction and records audit log", async () => {
      let transactionExecuted = false;
      let userRoleUpdated = false;
      let auditLogRecorded = false;

      const mockDb = {
        query: {
          teacherApprovalRequests: {
            findFirst: async () => samplePendingRequest,
          },
        },
        transaction: async (cb: (tx: unknown) => Promise<unknown>) => {
          transactionExecuted = true;
          const fakeTx = {
            update: () => ({
              set: () => ({
                where: () => {
                  userRoleUpdated = true;
                  return {
                    returning: async () => [{ ...samplePendingRequest, status: "APPROVED" }],
                  };
                },
              }),
            }),
            insert: () => ({
              values: async () => {
                auditLogRecorded = true;
                return [{ id: "audit-1" }];
              },
            }),
          };
          return await cb(fakeTx);
        },
      } as unknown as MockAdminDb;

      const result = await processTeacherApprovalDecision(mockDb, adminUser, {
        requestId: samplePendingRequest.id,
        decision: "APPROVE",
        reviewNotes: "Credentials verified.",
      });

      assert.strictEqual(result.status, "APPROVED");
      assert.strictEqual(transactionExecuted, true);
      assert.strictEqual(userRoleUpdated, true);
      assert.strictEqual(auditLogRecorded, true);
    });
  });

  describe("3. Repeated or Concurrent Decision Prevention", () => {
    it("refuses to process an already approved request", async () => {
      const alreadyApprovedRequest: TeacherApprovalRequest = {
        ...samplePendingRequest,
        status: "APPROVED",
      };

      const mockDb = {
        query: {
          teacherApprovalRequests: {
            findFirst: async () => alreadyApprovedRequest,
          },
        },
      } as unknown as MockAdminDb;

      await assert.rejects(
        () =>
          processTeacherApprovalDecision(mockDb, adminUser, {
            requestId: alreadyApprovedRequest.id,
            decision: "APPROVE",
          }),
        /already been processed with status: APPROVED/
      );
    });

    it("refuses to process an already rejected request", async () => {
      const alreadyRejectedRequest: TeacherApprovalRequest = {
        ...samplePendingRequest,
        status: "REJECTED",
      };

      const mockDb = {
        query: {
          teacherApprovalRequests: {
            findFirst: async () => alreadyRejectedRequest,
          },
        },
      } as unknown as MockAdminDb;

      await assert.rejects(
        () =>
          processTeacherApprovalDecision(mockDb, adminUser, {
            requestId: alreadyRejectedRequest.id,
            decision: "REJECT",
          }),
        /already been processed with status: REJECTED/
      );
    });
  });

  describe("4. Revoking Teacher Privileges & Final Admin Safeguard", () => {
    it("revokeTeacherSchema validates user ID input", () => {
      const valid = { targetUserId: teacherUser.id, reason: "End of tenure" };
      const parsed = revokeTeacherSchema.parse(valid);
      assert.strictEqual(parsed.targetUserId, teacherUser.id);
    });

    it("prevents administrator from revoking their own privileges (self-demotion)", async () => {
      const mockDb = {
        query: {
          users: {
            findFirst: async () => adminUser,
          },
        },
      } as unknown as MockAdminDb;

      await assert.rejects(
        () =>
          revokeTeacherPrivileges(mockDb, adminUser, {
            targetUserId: adminUser.id,
            reason: "Demoting self",
          }),
        /You cannot revoke your own administrative privileges/
      );
    });

    it("prevents revoking the only remaining administrator", async () => {
      const targetAdmin = createMockUser({
        id: "a0000000-0000-4000-a000-000000000003",
        role: "ADMIN",
        isApprovedTeacher: true,
      });

      const mockDb = {
        query: {
          users: {
            findFirst: async () => targetAdmin,
          },
        },
        select: () => ({
          from: () => ({
            where: async () => [{ count: 1 }], // Only 1 admin in system
          }),
        }),
      } as unknown as MockAdminDb;

      await assert.rejects(
        () =>
          revokeTeacherPrivileges(mockDb, adminUser, {
            targetUserId: targetAdmin.id,
            reason: "Attempting to remove sole admin",
          }),
        /Cannot revoke privileges of the only remaining system administrator/
      );
    });

    it("successfully revokes teacher privileges inside atomic transaction", async () => {
      let transactionRan = false;

      const mockDb = {
        query: {
          users: {
            findFirst: async () => teacherUser,
          },
        },
        transaction: async (cb: (tx: unknown) => Promise<unknown>) => {
          transactionRan = true;
          const fakeTx = {
            update: () => ({
              set: () => ({
                where: () => ({
                  returning: async () => [{ ...teacherUser, role: "STUDENT", isApprovedTeacher: false }],
                }),
              }),
            }),
            insert: () => ({
              values: async () => [{ id: "audit-revoke-1" }],
            }),
          };
          return await cb(fakeTx);
        },
      } as unknown as MockAdminDb;

      const updated = await revokeTeacherPrivileges(mockDb, adminUser, {
        targetUserId: teacherUser.id,
        reason: "Term expired",
      });

      assert.strictEqual(updated.role, "STUDENT");
      assert.strictEqual(updated.isApprovedTeacher, false);
      assert.strictEqual(transactionRan, true);
    });
  });

  describe("5. Audit Logging & Sensitive Data Redaction", () => {
    it("sanitizeAuditMetadata masks passwords, tokens, hashes and secrets", () => {
      const rawMetadata = {
        applicant: "Dr. Faculty",
        department: "AI & DS",
        passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz",
        sessionToken: "64characterstokenhere1234567890",
        rawToken: "secretrawtoken",
        secretKey: "supersecret",
        notes: "Approved after department council meeting",
      };

      const sanitized = sanitizeAuditMetadata(rawMetadata);
      assert.ok(sanitized !== null);
      assert.strictEqual(sanitized.applicant, "Dr. Faculty");
      assert.strictEqual(sanitized.department, "AI & DS");
      assert.strictEqual(sanitized.notes, "Approved after department council meeting");
      assert.strictEqual(sanitized.passwordHash, "[REDACTED]");
      assert.strictEqual(sanitized.sessionToken, "[REDACTED]");
      assert.strictEqual(sanitized.rawToken, "[REDACTED]");
      assert.strictEqual(sanitized.secretKey, "[REDACTED]");
    });

    it("sanitizeAuditMetadata handles nested objects cleanly", () => {
      const nested = {
        user: {
          name: "Faculty Member",
          password_hash: "hashed",
        },
      };

      const sanitized = sanitizeAuditMetadata(nested) as { user?: { name: string; password_hash: string } };
      assert.strictEqual(sanitized.user?.name, "Faculty Member");
      assert.strictEqual(sanitized.user?.password_hash, "[REDACTED]");
    });
  });

  describe("6. Administrative Event Oversight & Mandatory Cancellation Reasons", () => {
    const publishedEvent = createMockEvent({
      id: "e0000000-0000-4000-a000-000000000001",
      authorId: teacherUser.id,
      status: "PUBLISHED",
    });

    it("adminCancelEventSchema requires at least 5 characters for cancellation reason", () => {
      const valid = {
        eventId: "e0000000-0000-4000-a000-000000000001",
        reason: "Semester exams overlap with hackathon dates",
      };
      const parsed = adminCancelEventSchema.parse(valid);
      assert.strictEqual(parsed.reason, "Semester exams overlap with hackathon dates");

      const shortReason = {
        eventId: "e0000000-0000-4000-a000-000000000001",
        reason: "none", // < 5 chars
      };
      assert.throws(() => adminCancelEventSchema.parse(shortReason));
    });

    it("cancelEvent rejects cancellation without a mandatory reason", async () => {
      const mockDb = {} as unknown as Parameters<typeof cancelEvent>[0];
      await assert.rejects(
        () => cancelEvent(mockDb, adminUser, publishedEvent.id, "bad"),
        /A cancellation reason of at least 5 characters is mandatory/
      );
    });

    it("blocks Teacher B from cancelling Teacher A's event, but allows Administrator to cancel it", async () => {
      let cancelledStatus = "";

      const mockDb = {
        query: {
          events: {
            findFirst: async () => publishedEvent,
          },
        },
        update: () => ({
          set: (vals: { status: string }) => {
            cancelledStatus = vals.status;
            return {
              where: () => ({
                returning: async () => [{ ...publishedEvent, status: "CANCELLED" }],
              }),
            };
          },
        }),
        insert: () => ({
          values: async () => [{ id: "audit-cancel" }],
        }),
      } as unknown as Parameters<typeof cancelEvent>[0];

      // Non-author teacher cannot cancel
      await assert.rejects(
        () => cancelEvent(mockDb, otherTeacher, publishedEvent.id, "Valid reason from non-author"),
        ForbiddenError
      );

      // Department administrator CAN cancel any teacher's event
      const cancelled = await cancelEvent(
        mockDb,
        adminUser,
        publishedEvent.id,
        "Mandatory administrative cancellation reason"
      );
      assert.strictEqual(cancelled.status, "CANCELLED");
      assert.strictEqual(cancelledStatus, "CANCELLED");
    });
  });

  describe("7. Empty and Database-Unavailable Handling", () => {
    it("handles zero metrics without NaN or undefined errors", async () => {
      const mockDb = {
        select: () => ({
          from: () => ({
            where: async () => [{ count: 0 }],
          }),
        }),
        query: {
          auditLogs: {
            findMany: async () => [],
          },
        },
      } as unknown as MockAdminDb;

      const metrics = await getAdminDashboardMetrics(mockDb, adminUser);
      assert.strictEqual(metrics.totalStudents, 0);
      assert.strictEqual(metrics.totalTeachers, 0);
      assert.strictEqual(metrics.totalAdmins, 0);
      assert.strictEqual(metrics.pendingTeacherRequests, 0);
      assert.strictEqual(metrics.recentAuditLogs.length, 0);
    });

    it("listAuditLogs handles empty audit trails cleanly", async () => {
      const mockDb = {
        select: () => ({
          from: () => ({
            where: async () => [{ count: 0 }],
          }),
        }),
        query: {
          auditLogs: {
            findMany: async () => [],
          },
        },
      } as unknown as MockAdminDb;

      const result = await listAuditLogs(mockDb, adminUser, { page: 1, pageSize: 20 });
      assert.strictEqual(result.items.length, 0);
      assert.strictEqual(result.total, 0);
      assert.strictEqual(result.totalPages, 1);
    });
  });
});
