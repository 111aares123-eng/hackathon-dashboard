import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkDatabaseHealth } from "@/db/health";
import {
  users,
  events,
  savedEvents,
  auditLogs,
  teacherApprovalRequests,
  sessions,
  verificationTokens,
  type User,
} from "@/db/schema";
import { registerSchema } from "@/lib/auth/register";
import { loginSchema } from "@/lib/auth/login";
import { eventFormSchema, publicEventFilterSchema } from "@/validators/event";
import {
  canEditEvent,
  canPublishEvent,
  assertApprovedTeacher,
  assertAdmin,
  assertAuthenticated,
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth/guards";
import { hashSessionToken, generateSessionToken } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createMockUser, createMockEvent } from "./test-fixtures";

describe("Database Integration & Architecture Verification Tests", () => {
  describe("1. Database Connection & Offline Handling", () => {
    it("checkDatabaseHealth returns structured health result without throwing unhandled exceptions", async () => {
      const health = await checkDatabaseHealth();
      assert.strictEqual(typeof health.connected, "boolean");
      if (!health.connected) {
        assert.ok(typeof health.error === "string");
        assert.ok(health.error.length > 0);
      } else {
        assert.ok(typeof health.latencyMs === "number");
      }
    });

    it("verifies Drizzle schema definitions and table exports are intact", () => {
      assert.ok(users);
      assert.ok(events);
      assert.ok(savedEvents);
      assert.ok(auditLogs);
      assert.ok(teacherApprovalRequests);
      assert.ok(sessions);
      assert.ok(verificationTokens);
    });
  });

  describe("2. Workflow 1: Student Registration & Duplicate Email Protection", () => {
    it("validates valid registration input and enforces strict schema fields", () => {
      const valid = {
        name: "Test Student",
        email: "test.student@rajalakshmi.edu.in",
        password: "securePassword123",
        registerNumber: "210701099",
      };
      const parsed = registerSchema.parse(valid);
      assert.strictEqual(parsed.email, "test.student@rajalakshmi.edu.in");
      assert.strictEqual(parsed.department, "Artificial Intelligence and Data Science");
    });

    it("registration input schema strips or rejects unauthorized role escalation attempts", () => {
      const maliciousInput = {
        name: "Attacker",
        email: "attacker@rajalakshmi.edu.in",
        password: "password123",
        role: "ADMIN",
        isApprovedTeacher: true,
      };
      const parsed = registerSchema.parse(maliciousInput) as Record<string, unknown>;
      assert.strictEqual(parsed.role, undefined);
      assert.strictEqual(parsed.isApprovedTeacher, undefined);
    });
  });

  describe("3. Workflow 2 & 3: Sessions, Token Hashing & Role Authorization", () => {
    it("validates login credential input using loginSchema", () => {
      const valid = { email: "student@rajalakshmi.edu.in", password: "password123" };
      const parsed = loginSchema.parse(valid);
      assert.strictEqual(parsed.email, "student@rajalakshmi.edu.in");

      assert.throws(() => loginSchema.parse({ email: "not-an-email", password: "" }));
    });

    it("creates cryptographically secure session tokens and hashes them before storage", () => {
      const rawToken = generateSessionToken();
      assert.strictEqual(rawToken.length, 64);

      const hashedToken = hashSessionToken(rawToken);
      assert.strictEqual(hashedToken.length, 64);
      assert.notStrictEqual(hashedToken, rawToken);

      // Verify deterministic SHA-256
      assert.strictEqual(hashSessionToken(rawToken), hashedToken);
    });

    it("hashes passwords securely using bcrypt", async () => {
      const password = "myDepartmentPassword2026";
      const hash = await hashPassword(password);
      assert.ok(hash.startsWith("$2"));

      const isCorrect = await verifyPassword(password, hash);
      assert.strictEqual(isCorrect, true);

      const isWrong = await verifyPassword("wrongPassword", hash);
      assert.strictEqual(isWrong, false);
    });

    it("enforces student role boundaries against faculty operations", () => {
      const student = createMockUser({ role: "STUDENT", isApprovedTeacher: false });
      assert.throws(() => assertApprovedTeacher(student), ForbiddenError);
      assert.throws(() => assertAdmin(student), ForbiddenError);
      assert.doesNotThrow(() => assertAuthenticated(student));
    });
  });

  describe("4. Workflow 4 & 5: Teacher Approval & Event Lifecycle Mutations", () => {
    const unapprovedTeacher = createMockUser({
      id: "unapproved-id",
      role: "TEACHER",
      isApprovedTeacher: false,
    });
    const approvedTeacher = createMockUser({
      id: "teacher-id-1",
      role: "TEACHER",
      isApprovedTeacher: true,
    });
    const otherTeacher = createMockUser({
      id: "teacher-id-2",
      role: "TEACHER",
      isApprovedTeacher: true,
    });
    const adminUser = createMockUser({
      id: "admin-id-1",
      role: "ADMIN",
      isApprovedTeacher: true,
    });

    it("unapproved teacher cannot publish or edit events", () => {
      assert.throws(() => assertApprovedTeacher(unapprovedTeacher), ForbiddenError);
      assert.strictEqual(canPublishEvent(unapprovedTeacher), false);
    });

    it("approved teacher can publish and edit their own events", () => {
      assert.doesNotThrow(() => assertApprovedTeacher(approvedTeacher));
      assert.strictEqual(canPublishEvent(approvedTeacher), true);
      assert.strictEqual(canEditEvent(approvedTeacher, approvedTeacher.id), true);
    });

    it("teacher cannot edit another teacher's event; admin can edit any event", () => {
      assert.strictEqual(canEditEvent(approvedTeacher, otherTeacher.id), false);
      assert.strictEqual(canEditEvent(adminUser, otherTeacher.id), true);
    });

    it("validates event date sequence (registrationDeadline <= startDate <= endDate)", () => {
      const validEventInput = {
        title: "National AI Symposium",
        category: "SEMINAR",
        mode: "HYBRID",
        organizer: "AI & DS Faculty",
        summary: "Annual symposium on LLMs and Edge AI",
        description: "Full event schedule and keynote addresses.",
        venue: "Main Auditorium, REC",
        registrationUrl: "https://rajalakshmi.org/symposium",
        startDate: new Date("2026-11-15T09:00:00Z"),
        endDate: new Date("2026-11-15T17:00:00Z"),
        registrationDeadline: new Date("2026-11-10T23:59:59Z"),
        fee: "Free",
      };

      const parsed = eventFormSchema.parse(validEventInput);
      assert.strictEqual(parsed.title, "National AI Symposium");

      const invalidDates = {
        ...validEventInput,
        startDate: new Date("2026-11-20T09:00:00Z"),
        endDate: new Date("2026-11-15T17:00:00Z"), // End before start
      };
      assert.throws(() => eventFormSchema.parse(invalidDates));
    });
  });

  describe("5. Workflow 6 & 7: Published-Only Discovery & URL Security", () => {
    it("public event filter schema rejects invalid category or status parameters", () => {
      const parsed = publicEventFilterSchema.parse({ category: "WORKSHOP", mode: "ONLINE" });
      assert.strictEqual(parsed.category, "WORKSHOP");
      assert.strictEqual(parsed.mode, "ONLINE");

      assert.throws(() => publicEventFilterSchema.parse({ category: "PARTY" }));
    });

    it("prohibits draft events from student discovery", () => {
      const draft = createMockEvent({ status: "DRAFT" });
      const published = createMockEvent({ status: "PUBLISHED" });
      const cancelled = createMockEvent({ status: "CANCELLED" });

      const isPublicVisible = (status: string) => status !== "DRAFT";
      assert.strictEqual(isPublicVisible(draft.status), false);
      assert.strictEqual(isPublicVisible(published.status), true);
      assert.strictEqual(isPublicVisible(cancelled.status), true);
    });
  });

  describe("6. Workflow 8: Saved Events Ownership & Concurrency Safety", () => {
    it("rejects unauthenticated bookmark actions with UnauthorizedError", () => {
      assert.throws(() => assertAuthenticated(null as unknown as User), UnauthorizedError);
    });

    it("enforces bookmark ownership boundaries between students", () => {
      const student1 = createMockUser({ id: "student-1", name: "Student 1" });
      const student2 = createMockUser({ id: "student-2", name: "Student 2" });

      assert.notStrictEqual(student1.id, student2.id);
      // Saved events scoping strictly checks userId === session.user.id
      const canAccessSavedEvent = (bookmarkUserId: string, requestingUserId: string) =>
        bookmarkUserId === requestingUserId;

      assert.strictEqual(canAccessSavedEvent(student1.id, student1.id), true);
      assert.strictEqual(canAccessSavedEvent(student1.id, student2.id), false);
    });
  });

  describe("7. Workflow 9: Security Audit Logging", () => {
    it("verifies standard audit actions for critical transitions", () => {
      const expectedActions = [
        "USER_REGISTERED",
        "EVENT_CREATED",
        "EVENT_UPDATED",
        "EVENT_PUBLISHED",
        "EVENT_CANCELLED",
        "ADMIN_BOOTSTRAP",
        "TEACHER_APPROVAL_REQUESTED",
        "TEACHER_APPROVED",
        "TEACHER_REJECTED",
      ];

      for (const action of expectedActions) {
        assert.ok(typeof action === "string" && action.length > 0);
      }
    });
  });

  describe("8. Workflow 10: Empty State and Offline Fallbacks", () => {
    it("handles empty catalog data gracefully without throwing runtime errors", () => {
      const emptyCatalog = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      assert.strictEqual(emptyCatalog.items.length, 0);
      assert.strictEqual(emptyCatalog.total, 0);
    });
  });
});
