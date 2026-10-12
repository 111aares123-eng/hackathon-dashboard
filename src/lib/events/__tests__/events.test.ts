import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  eventFormSchema,
  isValidHttpUrl,
} from "../../../validators/event";
import { slugify } from "../slug";
import {
  canEditEvent,
  canPublishEvent,
  assertApprovedTeacher,
  ForbiddenError,
  UnauthorizedError,
} from "../../auth/guards";
import type { User } from "@/db/schema";

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Dr. Faculty A",
    email: "faculty.a@rajalakshmi.edu.in",
    passwordHash: null,
    emailVerified: null,
    image: null,
    role: "TEACHER",
    isApprovedTeacher: true,
    department: "Artificial Intelligence and Data Science",
    registerNumber: null,
    staffId: "STF_AI_01",
    designation: "Associate Professor",
    phoneNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("Event Management & Authorization Tests", () => {
  const teacherA = createMockUser({
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    name: "Faculty Coordinator A",
    role: "TEACHER",
    isApprovedTeacher: true,
  });

  const teacherB = createMockUser({
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    name: "Faculty Coordinator B",
    role: "TEACHER",
    isApprovedTeacher: true,
  });

  const unapprovedTeacher = createMockUser({
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    name: "Unverified Applicant",
    role: "TEACHER",
    isApprovedTeacher: false,
  });

  const studentUser = createMockUser({
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    name: "Student Member",
    role: "STUDENT",
    isApprovedTeacher: false,
  });

  const adminUser = createMockUser({
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    name: "HoD / Admin",
    role: "ADMIN",
    isApprovedTeacher: true,
  });

  describe("1. Unauthorized Access & Student Write Attempts", () => {
    it("assertApprovedTeacher rejects unauthenticated requests with UnauthorizedError", () => {
      assert.throws(() => assertApprovedTeacher(null), UnauthorizedError);
      assert.throws(() => assertApprovedTeacher(undefined), UnauthorizedError);
    });

    it("assertApprovedTeacher rejects student accounts with ForbiddenError", () => {
      assert.throws(() => assertApprovedTeacher(studentUser), ForbiddenError);
      assert.strictEqual(canPublishEvent(studentUser), false);
    });

    it("prevents students from editing any event", () => {
      assert.strictEqual(canEditEvent(studentUser, teacherA.id), false);
      assert.strictEqual(canEditEvent(studentUser, studentUser.id), false);
    });
  });

  describe("2. Unapproved Teacher Barriers", () => {
    it("prevents unapproved teachers from publishing or editing events", () => {
      assert.strictEqual(canPublishEvent(unapprovedTeacher), false);
      assert.strictEqual(canEditEvent(unapprovedTeacher, unapprovedTeacher.id), false);
      assert.throws(() => assertApprovedTeacher(unapprovedTeacher), ForbiddenError);
    });
  });

  describe("3. Cross-Teacher Ownership Boundaries & Admin Override", () => {
    const eventAuthorId = teacherA.id;

    it("allows the authoring teacher to edit their own event", () => {
      assert.strictEqual(canEditEvent(teacherA, eventAuthorId), true);
    });

    it("strictly blocks Teacher B from editing or cancelling Teacher A's event", () => {
      assert.strictEqual(canEditEvent(teacherB, eventAuthorId), false);
    });

    it("allows department administrator to manage and edit any teacher's event", () => {
      assert.strictEqual(canEditEvent(adminUser, eventAuthorId), true);
    });
  });

  describe("4. Date Ordering Invariants (Zod Validation)", () => {
    const baseValidInput = {
      title: "REC GenAI Hackathon 2026",
      category: "HACKATHON" as const,
      mode: "OFFLINE" as const,
      organizer: "REC AI & DS Department",
      summary: "A 24-hour national hackathon focused on Large Language Models and Computer Vision.",
      description: "Comprehensive guidelines, evaluation rubric, and mentorship tracks for participants.",
      venue: "Turing Lab, Block II, REC",
      registrationUrl: "https://forms.gle/rec-hackathon-2026",
      startDate: new Date("2026-11-20T09:00:00Z"),
      endDate: new Date("2026-11-21T18:00:00Z"),
      registrationDeadline: new Date("2026-11-18T23:59:59Z"),
      fee: "Free",
      tags: ["AI", "Hackathon"],
    };

    it("accepts valid date progression (deadline <= start <= end)", () => {
      const result = eventFormSchema.safeParse(baseValidInput);
      assert.strictEqual(result.success, true);
    });

    it("rejects event if start date is after end date", () => {
      const invalidInput = {
        ...baseValidInput,
        startDate: new Date("2026-11-25T09:00:00Z"),
        endDate: new Date("2026-11-20T18:00:00Z"),
      };
      const result = eventFormSchema.safeParse(invalidInput);
      assert.strictEqual(result.success, false);
      assert.ok(
        result.error.issues.some((i) =>
          i.message.includes("start date must be before or equal to the end date")
        )
      );
    });

    it("rejects event if registration deadline is after the event end date", () => {
      const invalidInput = {
        ...baseValidInput,
        registrationDeadline: new Date("2026-11-22T00:00:00Z"),
      };
      const result = eventFormSchema.safeParse(invalidInput);
      assert.strictEqual(result.success, false);
      assert.ok(
        result.error.issues.some((i) =>
          i.message.includes("deadline cannot be after the event end date")
        )
      );
    });
  });

  describe("5. Registration URL Protocol Safety", () => {
    it("validates safe HTTP and HTTPS protocols", () => {
      assert.strictEqual(isValidHttpUrl("https://rajalakshmi.edu.in"), true);
      assert.strictEqual(isValidHttpUrl("http://forms.gle/test-url"), true);
      assert.strictEqual(isValidHttpUrl("https://unstop.com/hackathons/rec-2026"), true);
    });

    it("strictly rejects unsafe pseudo-protocols and invalid formats", () => {
      assert.strictEqual(isValidHttpUrl("javascript:alert(1)"), false);
      assert.strictEqual(isValidHttpUrl("data:text/html;base64,PHNjcmlwdD4="), false);
      assert.strictEqual(isValidHttpUrl("ftp://files.college.edu/form"), false);
      assert.strictEqual(isValidHttpUrl("file:///C:/Users/passwords.txt"), false);
      assert.strictEqual(isValidHttpUrl("not-a-valid-url"), false);
    });

    it("schema rejects malicious javascript: URLs in registrationUrl", () => {
      const maliciousInput = {
        title: "Malicious Event",
        category: "WORKSHOP" as const,
        mode: "OFFLINE" as const,
        organizer: "REC",
        summary: "Summary of ten characters minimum",
        description: "Description of twenty characters minimum length here.",
        venue: "Lab 1",
        registrationUrl: "javascript:alert(document.cookie)",
        startDate: new Date("2026-11-10T09:00:00Z"),
        endDate: new Date("2026-11-10T17:00:00Z"),
        registrationDeadline: new Date("2026-11-09T23:59:59Z"),
      };
      const result = eventFormSchema.safeParse(maliciousInput);
      assert.strictEqual(result.success, false);
      assert.ok(
        result.error.issues.some((i) =>
          i.message.includes("valid HTTP or HTTPS web address")
        )
      );
    });
  });

  describe("6. Slug Generation Utility", () => {
    it("converts title to clean URL slug", () => {
      assert.strictEqual(
        slugify("REC National GenAI Hackathon 2026!"),
        "rec-national-genai-hackathon-2026"
      );
      assert.strictEqual(
        slugify("AI & Data Science Workshop: Deep Learning (Hands-on)"),
        "ai-data-science-workshop-deep-learning-hands-on"
      );
    });
  });
});
