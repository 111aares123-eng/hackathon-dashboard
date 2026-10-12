import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  UnauthorizedError,
  ForbiddenError,
  assertAuthenticated,
  assertApprovedTeacher,
  assertAdmin,
  isApprovedTeacher,
  isAdmin,
  canPublishEvent,
  canEditEvent,
  canApproveTeacherRequest,
} from "../guards";
import { registerSchema } from "../register";
import { validateInstitutionalEmail, validateSafeRedirect } from "../validation";
import { checkRateLimit, resetRateLimit } from "../../rate-limit";
import { hashPassword, verifyPassword } from "../password";
import { generateSessionToken, hashSessionToken } from "../session";
import type { User } from "@/db/schema";

// Helper to create mock users with exact typings
function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Test User",
    email: "test@college.edu",
    passwordHash: "$2a$12$eMockHashForTestingOnly...",
    emailVerified: null,
    image: null,
    role: "STUDENT",
    isApprovedTeacher: false,
    department: "Artificial Intelligence and Data Science",
    registerNumber: "210701001",
    staffId: null,
    designation: null,
    phoneNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("Authentication & Authorization Guard Tests", () => {
  const studentUser = createMockUser({ role: "STUDENT", isApprovedTeacher: false });
  const unapprovedTeacherUser = createMockUser({
    role: "TEACHER",
    isApprovedTeacher: false,
    staffId: "STF001",
  });
  const approvedTeacherUser = createMockUser({
    role: "TEACHER",
    isApprovedTeacher: true,
    staffId: "STF002",
  });
  const adminUser = createMockUser({
    role: "ADMIN",
    isApprovedTeacher: true,
  });

  describe("1. Unauthenticated Request Access Control", () => {
    it("assertAuthenticated throws UnauthorizedError when user is null or undefined", () => {
      assert.throws(() => assertAuthenticated(null), UnauthorizedError);
      assert.throws(() => assertAuthenticated(undefined), UnauthorizedError);
    });

    it("assertApprovedTeacher throws UnauthorizedError when unauthenticated", () => {
      assert.throws(() => assertApprovedTeacher(null), UnauthorizedError);
    });

    it("assertAdmin throws UnauthorizedError when unauthenticated", () => {
      assert.throws(() => assertAdmin(null), UnauthorizedError);
    });
  });

  describe("2. Student Role Boundaries", () => {
    it("identifies student correctly and rejects elevated capabilities", () => {
      assert.strictEqual(isAdmin(studentUser), false);
      assert.strictEqual(isApprovedTeacher(studentUser), false);
      assert.strictEqual(canPublishEvent(studentUser), false);
      assert.strictEqual(canApproveTeacherRequest(studentUser), false);
    });

    it("throws ForbiddenError when a student attempts teacher operations", () => {
      assert.throws(() => assertApprovedTeacher(studentUser), ForbiddenError);
    });

    it("throws ForbiddenError when a student attempts administrator operations", () => {
      assert.throws(() => assertAdmin(studentUser), ForbiddenError);
    });
  });

  describe("3. Unapproved Teacher Safeguards", () => {
    it("never grants publishing rights merely because role is TEACHER if isApprovedTeacher is false", () => {
      assert.strictEqual(isApprovedTeacher(unapprovedTeacherUser), false);
      assert.strictEqual(canPublishEvent(unapprovedTeacherUser), false);
      assert.throws(() => assertApprovedTeacher(unapprovedTeacherUser), ForbiddenError);
    });
  });

  describe("4. Approved Teacher Privileges & Resource Ownership", () => {
    it("allows approved teachers to publish events", () => {
      assert.strictEqual(isApprovedTeacher(approvedTeacherUser), true);
      assert.strictEqual(canPublishEvent(approvedTeacherUser), true);
      assert.doesNotThrow(() => assertApprovedTeacher(approvedTeacherUser));
    });

    it("allows an approved teacher to edit only their own events", () => {
      const ownEventAuthorId = approvedTeacherUser.id;
      const otherEventAuthorId = "99999999-9999-9999-9999-999999999999";

      assert.strictEqual(canEditEvent(approvedTeacherUser, ownEventAuthorId), true);
      assert.strictEqual(canEditEvent(approvedTeacherUser, otherEventAuthorId), false);
    });

    it("prevents approved teachers from approving other teachers or doing admin actions", () => {
      assert.strictEqual(canApproveTeacherRequest(approvedTeacherUser), false);
      assert.throws(() => assertAdmin(approvedTeacherUser), ForbiddenError);
    });
  });

  describe("5. Administrator Authorization", () => {
    it("allows administrators to approve teacher requests", () => {
      assert.strictEqual(isAdmin(adminUser), true);
      assert.strictEqual(canApproveTeacherRequest(adminUser), true);
      assert.doesNotThrow(() => assertAdmin(adminUser));
    });

    it("allows administrators to edit any event regardless of author", () => {
      assert.strictEqual(canEditEvent(adminUser, "random-author-id"), true);
    });
  });

  describe("6. Registration Input Lockdown & Least Privilege", () => {
    it("registration schema parses valid registration input", () => {
      const input = {
        name: "Aadhithya Kumar",
        email: "aadhithya@rajalakshmi.edu.in",
        password: "SecurePassword123!",
        department: "Artificial Intelligence and Data Science",
        registerNumber: "210701045",
      };
      const result = registerSchema.parse(input);
      assert.strictEqual(result.email, "aadhithya@rajalakshmi.edu.in");
      assert.strictEqual("role" in result, false);
      assert.strictEqual("isApprovedTeacher" in result, false);
    });

    it("strips client-submitted role or elevated privilege parameters", () => {
      const maliciousInput = {
        name: "Attacker",
        email: "attacker@example.com",
        password: "HackerPassword123!",
        role: "ADMIN",
        isApprovedTeacher: true,
      };
      const parsed = registerSchema.parse(maliciousInput);
      // Zod schema does not contain role or isApprovedTeacher
      assert.strictEqual((parsed as Record<string, unknown>).role, undefined);
      assert.strictEqual((parsed as Record<string, unknown>).isApprovedTeacher, undefined);
    });
  });

  describe("7. Institutional Domain Validation", () => {
    it("allows any valid email if domain constraint is empty or unconfigured", () => {
      const check1 = validateInstitutionalEmail("student@gmail.com", "");
      assert.strictEqual(check1.valid, true);

      const check2 = validateInstitutionalEmail("faculty@college.edu", undefined);
      assert.strictEqual(check2.valid, true);
    });

    it("accepts valid REC institutional addresses ending in @rajalakshmi.edu.in", () => {
      const allowed = "rajalakshmi.edu.in";

      assert.strictEqual(validateInstitutionalEmail("student@rajalakshmi.edu.in", allowed).valid, true);
      assert.strictEqual(validateInstitutionalEmail("aadhithya.s@rajalakshmi.edu.in", allowed).valid, true);
      assert.strictEqual(validateInstitutionalEmail("hod.aids@rajalakshmi.edu.in", allowed).valid, true);
    });

    it("handles uppercase and mixed-case email addresses seamlessly", () => {
      const allowed = "rajalakshmi.edu.in";

      assert.strictEqual(validateInstitutionalEmail("STUDENT@RAJALAKSHMI.EDU.IN", allowed).valid, true);
      assert.strictEqual(validateInstitutionalEmail("Aadhithya.S@RajaLakshmi.Edu.In", allowed).valid, true);
    });

    it("strictly rejects unconfigured subdomains of the institutional domain", () => {
      const allowed = "rajalakshmi.edu.in";

      // Unconfigured subdomains must be rejected
      const aidsCheck = validateInstitutionalEmail("student@aids.rajalakshmi.edu.in", allowed);
      assert.strictEqual(aidsCheck.valid, false);
      assert.match(aidsCheck.reason!, /not authorized/);

      const csCheck = validateInstitutionalEmail("student@cs.rajalakshmi.edu.in", allowed);
      assert.strictEqual(csCheck.valid, false);
      assert.match(csCheck.reason!, /not authorized/);

      const cseCheck = validateInstitutionalEmail("faculty@cse.rajalakshmi.edu.in", allowed);
      assert.strictEqual(cseCheck.valid, false);

      const deptCheck = validateInstitutionalEmail("admin@dept.rajalakshmi.edu.in", allowed);
      assert.strictEqual(deptCheck.valid, false);
    });

    it("accepts subdomains only when explicitly configured in ALLOWED_INSTITUTIONAL_DOMAINS", () => {
      const explicitAllowed = "rajalakshmi.edu.in, aids.rajalakshmi.edu.in";

      assert.strictEqual(validateInstitutionalEmail("student@rajalakshmi.edu.in", explicitAllowed).valid, true);
      assert.strictEqual(validateInstitutionalEmail("student@aids.rajalakshmi.edu.in", explicitAllowed).valid, true);
      assert.strictEqual(validateInstitutionalEmail("student@cs.rajalakshmi.edu.in", explicitAllowed).valid, false);
    });

    it("strictly rejects external and invalid domains", () => {
      const allowed = "rajalakshmi.edu.in";

      const checkGmail = validateInstitutionalEmail("student@gmail.com", allowed);
      assert.strictEqual(checkGmail.valid, false);
      assert.match(checkGmail.reason!, /not authorized/);

      const checkExternal = validateInstitutionalEmail("hacker@external.com", allowed);
      assert.strictEqual(checkExternal.valid, false);
      assert.match(checkExternal.reason!, /not authorized/);

      const checkYahoo = validateInstitutionalEmail("user@yahoo.co.in", allowed);
      assert.strictEqual(checkYahoo.valid, false);
      assert.match(checkYahoo.reason!, /not authorized/);
    });

    it("strictly rejects lookalike and phishing domains", () => {
      const allowed = "rajalakshmi.edu.in";

      // Lookalike suffixes and prefixes
      assert.strictEqual(validateInstitutionalEmail("attacker@rajalakshmi.edu.in.fake.com", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("attacker@notrajalakshmi.edu.in", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("attacker@rajalakshmi-edu.in", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("attacker@fake-rajalakshmi.edu.in", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("attacker@rajalakshmiedu.in", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("attacker@rajalakshmi.edu.in.attacker.org", allowed).valid, false);
    });

    it("strictly rejects malformed email addresses", () => {
      const allowed = "rajalakshmi.edu.in";

      assert.strictEqual(validateInstitutionalEmail("rajalakshmi.edu.in", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("@rajalakshmi.edu.in", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("student@", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("student@@rajalakshmi.edu.in", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("student@rajalakshmi.edu.in@evil.com", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("student @rajalakshmi.edu.in", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("student@.rajalakshmi.edu.in", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail(undefined, allowed).valid, false);
    });

    it("supports multiple comma-separated institutional domains if configured", () => {
      const allowed = "rajalakshmi.edu.in, rec.edu.in";

      assert.strictEqual(validateInstitutionalEmail("test@rajalakshmi.edu.in", allowed).valid, true);
      assert.strictEqual(validateInstitutionalEmail("test@rec.edu.in", allowed).valid, true);
      assert.strictEqual(validateInstitutionalEmail("test@cs.rec.edu.in", allowed).valid, false);
      assert.strictEqual(validateInstitutionalEmail("hacker@external.com", allowed).valid, false);
    });
  });

  describe("8. Open Redirect Protection", () => {
    it("permits safe internal relative paths", () => {
      assert.strictEqual(validateSafeRedirect("/events"), "/events");
      assert.strictEqual(validateSafeRedirect("/admin/approvals?page=1"), "/admin/approvals?page=1");
    });

    it("rejects protocol-relative and external redirects", () => {
      assert.strictEqual(validateSafeRedirect("//evil.com"), "/");
      assert.strictEqual(validateSafeRedirect("/\\evil.com"), "/");
      assert.strictEqual(validateSafeRedirect("https://evil.com"), "/");
      assert.strictEqual(validateSafeRedirect("javascript:alert(1)"), "/");
    });
  });

  describe("9. Rate Limiter", () => {
    it("allows calls under the threshold and throttles once exceeded", () => {
      const testId = "test-ip-127.0.0.1";
      resetRateLimit(testId, "test_action");

      for (let i = 0; i < 3; i++) {
        const res = checkRateLimit(testId, "test_action", { max: 3, windowMs: 5000 });
        assert.strictEqual(res.success, true);
      }

      // 4th call exceeds limit
      const exceeded = checkRateLimit(testId, "test_action", { max: 3, windowMs: 5000 });
      assert.strictEqual(exceeded.success, false);
      assert.strictEqual(exceeded.remaining, 0);

      resetRateLimit(testId, "test_action");
    });
  });

  describe("10. Cryptographic Utilities", () => {
    it("generateSessionToken produces 64-character hex tokens with high entropy", () => {
      const t1 = generateSessionToken();
      const t2 = generateSessionToken();
      assert.strictEqual(t1.length, 64);
      assert.strictEqual(t2.length, 64);
      assert.notStrictEqual(t1, t2);
    });

    it("hashSessionToken produces 64-character sha256 hash", () => {
      const raw = "my-secret-token";
      const h1 = hashSessionToken(raw);
      const h2 = hashSessionToken(raw);
      assert.strictEqual(h1.length, 64);
      assert.strictEqual(h1, h2);
      assert.notStrictEqual(h1, raw);
    });

    it("hashes and correctly verifies passwords", async () => {
      const raw = "SuperSecretPassword123!";
      const hash = await hashPassword(raw);
      assert.notStrictEqual(raw, hash);

      const isValid = await verifyPassword(raw, hash);
      assert.strictEqual(isValid, true);

      const isInvalid = await verifyPassword("WrongPassword!", hash);
      assert.strictEqual(isInvalid, false);
    });
  });
});
