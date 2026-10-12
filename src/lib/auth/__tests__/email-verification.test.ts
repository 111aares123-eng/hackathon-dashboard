import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  generateVerificationToken,
  hashVerificationToken,
  createVerificationToken,
  verifyEmailToken,
  requestVerificationResend,
  VERIFICATION_TOKEN_MAX_AGE_MS,
} from "../verification-service";
import {
  UnverifiedEmailError,
  isEmailVerified,
  assertEmailVerified,
} from "../guards";
import { MockEmailProvider } from "../../email/providers/mock";
import { setEmailProvider } from "../../email/service";
import { resetRateLimit } from "../../rate-limit";
import { saveEvent } from "../../events/saved-service";
import type { User, VerificationToken, AuditLog, Event, SavedEvent } from "@/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

/**
 * Extracts column name and target value from Drizzle SQL/where expressions.
 */
function extractSqlWhere(sqlObj: unknown): { column: string | null; value: unknown } {
  if (!sqlObj || typeof sqlObj !== "object") return { column: null, value: null };
  const obj = sqlObj as Record<string, unknown>;
  let column: string | null = null;
  let value: unknown = null;

  if (Array.isArray(obj.queryChunks)) {
    for (const c of obj.queryChunks) {
      if (c && typeof c === "object") {
        const chunk = c as Record<string, unknown>;
        if (typeof chunk.name === "string") {
          column = chunk.name;
        }
        if (
          chunk.constructor?.name === "Param" ||
          ("value" in chunk && !Array.isArray(chunk.value) && typeof chunk.value !== "object")
        ) {
          value = chunk.value;
        }
      }
    }
  } else if ("value" in obj) {
    value = obj.value;
  }

  return { column, value };
}

/**
 * Creates an in-memory mock PostgreSQL/Drizzle database for fast, isolated verification testing.
 */
function createMockVerificationDb(initialState?: {
  users?: User[];
  tokens?: VerificationToken[];
  auditLogs?: AuditLog[];
  events?: Event[];
  savedEvents?: SavedEvent[];
}) {
  const users: User[] = [...(initialState?.users || [])];
  let tokens: VerificationToken[] = [...(initialState?.tokens || [])];
  const auditLogs: AuditLog[] = [...(initialState?.auditLogs || [])];
  const events: Event[] = [...(initialState?.events || [])];
  const savedEvents: SavedEvent[] = [...(initialState?.savedEvents || [])];

  // Serialized transaction queue to simulate transactional concurrency in PostgreSQL
  let inFlightTx: Promise<unknown> = Promise.resolve();

  const db = {
    query: {
      users: {
        findFirst: async ({ where }: { where?: unknown } = {}) => {
          const { column, value } = extractSqlWhere(where);
          if (column === "email" && typeof value === "string") {
            return users.find((u) => u.email.toLowerCase() === value.toLowerCase()) || null;
          }
          if (value && typeof value === "string") {
            return users.find((u) => u.email.toLowerCase() === value.toLowerCase()) || null;
          }
          return users[0] || null;
        },
      },
      verificationTokens: {
        findFirst: async ({ where }: { where?: unknown } = {}) => {
          const { column, value } = extractSqlWhere(where);
          if (column === "token" && value !== null) {
            return tokens.find((t) => t.token === String(value)) || null;
          }
          if (value !== null) {
            return tokens.find((t) => t.token === String(value)) || null;
          }
          return tokens[0] || null;
        },
      },
      events: {
        findFirst: async () => events[0] || null,
      },
      savedEvents: {
        findFirst: async () => savedEvents[0] || null,
      },
    },
    insert: (table: unknown) => ({
      values: (val: Record<string, unknown>) => {
        let insertedRecord: Record<string, unknown> = val;
        if (table === schema.verificationTokens) {
          insertedRecord = {
            id: `token-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            identifier: val.identifier as string,
            token: val.token as string,
            expiresAt: val.expiresAt as Date,
            createdAt: new Date(),
          };
          tokens.push(insertedRecord as unknown as VerificationToken);
        } else if (table === schema.auditLogs) {
          insertedRecord = {
            id: `audit-${Date.now()}`,
            actorId: (val.actorId as string) || null,
            action: val.action as string,
            targetType: val.targetType as string,
            targetId: val.targetId as string,
            metadata: (val.metadata as Record<string, unknown>) || {},
            createdAt: new Date(),
          };
          auditLogs.push(insertedRecord as unknown as AuditLog);
        } else if (table === schema.savedEvents) {
          insertedRecord = {
            id: `saved-${Date.now()}`,
            userId: val.userId as string,
            eventId: val.eventId as string,
            createdAt: new Date(),
          };
          savedEvents.push(insertedRecord as unknown as SavedEvent);
        }

        const promise = Promise.resolve([insertedRecord]);
        return Object.assign(promise, {
          returning: async () => [insertedRecord],
          onConflictDoNothing: () =>
            Object.assign(Promise.resolve([insertedRecord]), {
              returning: async () => [insertedRecord],
            }),
        });
      },
    }),
    delete: (table: unknown) => {
      const doDelete = (whereClause: unknown) => {
        const deletedRows: unknown[] = [];
        if (table === schema.verificationTokens) {
          const { column, value } = extractSqlWhere(whereClause);
          const strVal = String(value);
          const initial = [...tokens];
          if (column === "identifier") {
            const matches = initial.filter((t) => t.identifier.toLowerCase() === strVal.toLowerCase());
            deletedRows.push(...matches);
            tokens = tokens.filter((t) => t.identifier.toLowerCase() !== strVal.toLowerCase());
          } else if (column === "id") {
            const matches = initial.filter((t) => t.id === strVal);
            deletedRows.push(...matches);
            tokens = tokens.filter((t) => t.id !== strVal);
          } else if (column === "token") {
            const matches = initial.filter((t) => t.token === strVal);
            deletedRows.push(...matches);
            tokens = tokens.filter((t) => t.token !== strVal);
          } else {
            const matches = initial.filter(
              (t) => t.identifier === strVal || t.id === strVal || t.token === strVal
            );
            deletedRows.push(...matches);
            tokens = tokens.filter(
              (t) => t.identifier !== strVal && t.id !== strVal && t.token !== strVal
            );
          }
        }
        const promise = Promise.resolve(deletedRows);
        return Object.assign(promise, {
          returning: async () => deletedRows,
        });
      };

      return {
        where: doDelete,
      };
    },
    update: (table: unknown) => ({
      set: (updates: Partial<User>) => ({
        where: (whereClause: unknown) => {
          const updatedRows: User[] = [];
          if (table === schema.users) {
            const { value } = extractSqlWhere(whereClause);
            const strVal = String(value).toLowerCase();
            const user = users.find((u) => u.email.toLowerCase() === strVal);
            if (user) {
              Object.assign(user, updates);
              updatedRows.push(user);
            }
          }
          const promise = Promise.resolve(updatedRows);
          return Object.assign(promise, {
            returning: async () => updatedRows,
          });
        },
      }),
    }),
    transaction: async <T>(callback: (tx: unknown) => Promise<T>): Promise<T> => {
      const prev = inFlightTx;
      let resolveCurrent!: (val: void) => void;
      inFlightTx = new Promise<void>((resolve) => {
        resolveCurrent = resolve;
      });
      await prev;
      try {
        return await callback(db);
      } finally {
        resolveCurrent();
      }
    },
    // Introspection helper for tests
    _state: {
      get users() {
        return users;
      },
      get tokens() {
        return tokens;
      },
      get auditLogs() {
        return auditLogs;
      },
    },
  };

  return db as unknown as NodePgDatabase<typeof schema> & {
    _state: {
      users: User[];
      tokens: VerificationToken[];
      auditLogs: AuditLog[];
    };
  };
}

function createTestStudent(overrides: Partial<User> = {}): User {
  return {
    id: "std-001",
    name: "Aadhithya S",
    email: "aadhithya@rajalakshmi.edu.in",
    passwordHash: "hash123",
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

describe("Institutional Email Ownership Verification Tests", () => {
  let mockEmailProvider: MockEmailProvider;

  beforeEach(() => {
    mockEmailProvider = new MockEmailProvider();
    setEmailProvider(mockEmailProvider);
    resetRateLimit();
  });

  // --------------------------------------------------------------------------
  // 1. Cryptographic Token Generation & Hashing
  // --------------------------------------------------------------------------
  describe("1. Cryptographic Token Generation & Hashing", () => {
    it("generates a high-entropy 256-bit (64 hex characters) token", () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();

      assert.strictEqual(typeof token1, "string");
      assert.strictEqual(token1.length, 64);
      assert.match(token1, /^[0-9a-f]{64}$/);
      assert.notStrictEqual(token1, token2, "Subsequent tokens must be distinct");
    });

    it("hashes the token using SHA-256 and never returns plaintext", () => {
      const rawToken = generateVerificationToken();
      const hash = hashVerificationToken(rawToken);

      assert.strictEqual(hash.length, 64);
      assert.match(hash, /^[0-9a-f]{64}$/);
      assert.notStrictEqual(hash, rawToken, "Hash must not equal raw token");

      // Verify deterministic SHA-256 output
      const hashAgain = hashVerificationToken(rawToken);
      assert.strictEqual(hash, hashAgain, "Hashing the same token must produce the exact same digest");
    });
  });

  // --------------------------------------------------------------------------
  // 2. Token Creation & Persistence
  // --------------------------------------------------------------------------
  describe("2. Token Creation & Persistence", () => {
    it("persists only the SHA-256 hash in PostgreSQL and returns the raw token", async () => {
      const db = createMockVerificationDb();
      const result = await createVerificationToken(db, "student@rajalakshmi.edu.in");

      assert.strictEqual(result.rawToken.length, 64);
      assert.strictEqual(result.hashedToken.length, 64);
      assert.strictEqual(result.hashedToken, hashVerificationToken(result.rawToken));

      // Verify token in DB state
      const storedTokens = db._state.tokens;
      assert.strictEqual(storedTokens.length, 1);
      assert.strictEqual(storedTokens[0].token, result.hashedToken, "DB must only store the hashed token");
      assert.notStrictEqual(storedTokens[0].token, result.rawToken, "DB must never store the raw token");
    });

    it("sets token expiration time to 30 minutes in the future", async () => {
      const db = createMockVerificationDb();
      const before = Date.now();
      const result = await createVerificationToken(db, "student@rajalakshmi.edu.in");
      const after = Date.now();

      const expectedMin = before + VERIFICATION_TOKEN_MAX_AGE_MS;
      const expectedMax = after + VERIFICATION_TOKEN_MAX_AGE_MS;

      const expiryTime = new Date(result.expiresAt).getTime();
      assert.ok(expiryTime >= expectedMin && expiryTime <= expectedMax, "Expiry must be exactly 30 minutes ahead");
    });

    it("supersedes and invalidates any previous outstanding tokens for the same email", async () => {
      const db = createMockVerificationDb();
      const token1 = await createVerificationToken(db, "student@rajalakshmi.edu.in");
      assert.strictEqual(db._state.tokens.length, 1);

      const token2 = await createVerificationToken(db, "student@rajalakshmi.edu.in");
      assert.strictEqual(db._state.tokens.length, 1, "Prior token must be deleted when a new token is created");
      assert.strictEqual(db._state.tokens[0].token, token2.hashedToken);
      assert.notStrictEqual(db._state.tokens[0].token, token1.hashedToken);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Successful Verification Flow
  // --------------------------------------------------------------------------
  describe("3. Successful Verification Flow", () => {
    it("atomically verifies email, marks emailVerified timestamp, and consumes the token", async () => {
      const student = createTestStudent();
      const db = createMockVerificationDb({ users: [student] });

      const { rawToken } = await createVerificationToken(db, student.email);

      // Verify email using the raw token
      const verifyResult = await verifyEmailToken(db, rawToken);

      assert.strictEqual(verifyResult.success, true);
      assert.strictEqual(verifyResult.email, student.email);

      // Verify user state in DB
      const updatedUser = db._state.users.find((u) => u.id === student.id);
      assert.ok(updatedUser?.emailVerified !== null, "User emailVerified must be set");
      assert.ok(updatedUser?.emailVerified instanceof Date, "emailVerified must be a Date timestamp");

      // Verify token has been consumed (deleted)
      assert.strictEqual(db._state.tokens.length, 0, "Single-use token must be deleted after consumption");

      // Verify audit log
      const audit = db._state.auditLogs.find((a) => a.action === "EMAIL_VERIFIED");
      assert.ok(audit, "Must log EMAIL_VERIFIED audit action");
      assert.strictEqual(audit?.targetId, student.id);
      // Verify audit log never leaks raw or hashed token
      const meta = JSON.stringify(audit?.metadata || {});
      assert.ok(!meta.includes(rawToken), "Audit log must not contain raw token");
    });

    it("preserves student role and does not grant teacher or admin privileges upon verification", async () => {
      const student = createTestStudent({ role: "STUDENT", isApprovedTeacher: false });
      const db = createMockVerificationDb({ users: [student] });

      const { rawToken } = await createVerificationToken(db, student.email);
      await verifyEmailToken(db, rawToken);

      const verifiedUser = db._state.users.find((u) => u.id === student.id);
      assert.strictEqual(verifiedUser?.role, "STUDENT", "Role must remain STUDENT");
      assert.strictEqual(verifiedUser?.isApprovedTeacher, false, "Must never grant isApprovedTeacher");
    });
  });

  // --------------------------------------------------------------------------
  // 4. Invalid, Malformed, & Expired Tokens
  // --------------------------------------------------------------------------
  describe("4. Invalid, Malformed, & Expired Tokens", () => {
    it("rejects non-existent or wrong tokens safely without leaking internal details", async () => {
      const student = createTestStudent();
      const db = createMockVerificationDb({ users: [student] });
      await createVerificationToken(db, student.email);

      const wrongToken = "0".repeat(64);
      const result = await verifyEmailToken(db, wrongToken);

      assert.strictEqual(result.success, false);
      assert.match(result.error || "", /invalid or has already been used/i);
      // User must remain unverified
      assert.strictEqual(db._state.users[0].emailVerified, null);
    });

    it("rejects malformed tokens (short, empty, or wrong length) immediately", async () => {
      const db = createMockVerificationDb();

      const shortResult = await verifyEmailToken(db, "abc");
      assert.strictEqual(shortResult.success, false);
      assert.match(shortResult.error || "", /invalid verification token format/i);

      const emptyResult = await verifyEmailToken(db, "");
      assert.strictEqual(emptyResult.success, false);
    });

    it("rejects expired tokens and cleans up expired token record", async () => {
      const student = createTestStudent();
      const rawToken = generateVerificationToken();
      const expiredToken: VerificationToken = {
        id: "tok-expired",
        identifier: student.email,
        token: hashVerificationToken(rawToken),
        expiresAt: new Date(Date.now() - 1000 * 60), // Expired 1 minute ago
        createdAt: new Date(Date.now() - 1000 * 60 * 31),
      };

      const db = createMockVerificationDb({
        users: [student],
        tokens: [expiredToken],
      });

      const result = await verifyEmailToken(db, rawToken);

      assert.strictEqual(result.success, false);
      assert.match(result.error || "", /expired/i);
      assert.strictEqual(db._state.users[0].emailVerified, null, "User must remain unverified");
      assert.strictEqual(db._state.tokens.length, 0, "Expired token must be cleaned up");
    });
  });

  // --------------------------------------------------------------------------
  // 5. Token Reuse Prevention
  // --------------------------------------------------------------------------
  describe("5. Token Reuse Prevention", () => {
    it("strictly prevents reusing a token once it has been redeemed", async () => {
      const student = createTestStudent();
      const db = createMockVerificationDb({ users: [student] });

      const { rawToken } = await createVerificationToken(db, student.email);

      // First redemption: success
      const firstAttempt = await verifyEmailToken(db, rawToken);
      assert.strictEqual(firstAttempt.success, true);

      // Second redemption with identical token: must fail
      const secondAttempt = await verifyEmailToken(db, rawToken);
      assert.strictEqual(secondAttempt.success, false);
      assert.match(secondAttempt.error || "", /invalid or has already been used/i);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Concurrent Token Redemption (Race Condition Safety)
  // --------------------------------------------------------------------------
  describe("6. Concurrent Token Redemption", () => {
    it("handles concurrent redemption attempts so only one request consumes the token", async () => {
      const student = createTestStudent();
      const db = createMockVerificationDb({ users: [student] });

      const { rawToken } = await createVerificationToken(db, student.email);

      // Simulate simultaneous requests attempting to redeem the exact same token
      const [res1, res2] = await Promise.all([
        verifyEmailToken(db, rawToken),
        verifyEmailToken(db, rawToken),
      ]);

      const successes = [res1, res2].filter((r) => r.success);
      const failures = [res1, res2].filter((r) => !r.success);

      assert.strictEqual(successes.length, 1, "Exactly one concurrent attempt must succeed");
      assert.strictEqual(failures.length, 1, "Concurrent duplicate attempt must fail");
      assert.match(failures[0].error || "", /invalid or has already been used/i);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Resend Verification & Rate Limiting
  // --------------------------------------------------------------------------
  describe("7. Resend Verification & Rate Limiting", () => {
    it("returns generic security response without revealing non-existent email", async () => {
      const db = createMockVerificationDb({ users: [] }); // User does not exist

      const result = await requestVerificationResend(db, "unknown@rajalakshmi.edu.in", "10.0.0.1");

      assert.strictEqual(result.success, true);
      assert.match(result.message, /if an account associated with this email exists/i);
      assert.strictEqual(mockEmailProvider.getSentEmails().length, 0, "No email sent for non-existent user");
    });

    it("returns generic security response without sending email if user is already verified", async () => {
      const verifiedStudent = createTestStudent({ emailVerified: new Date() });
      const db = createMockVerificationDb({ users: [verifiedStudent] });

      const result = await requestVerificationResend(db, verifiedStudent.email, "10.0.0.2");

      assert.strictEqual(result.success, true);
      assert.strictEqual(mockEmailProvider.getSentEmails().length, 0, "No email sent if already verified");
    });

    it("dispatches new verification email for unverified user and invalidates old tokens", async () => {
      const unverifiedStudent = createTestStudent({ emailVerified: null });
      const db = createMockVerificationDb({ users: [unverifiedStudent] });

      // First initial token
      const oldToken = await createVerificationToken(db, unverifiedStudent.email);

      // Resend request
      const result = await requestVerificationResend(db, unverifiedStudent.email, "10.0.0.3");

      assert.strictEqual(result.success, true);
      assert.strictEqual(mockEmailProvider.getSentEmails().length, 1);
      const sentEmail = mockEmailProvider.getLastEmail();
      assert.strictEqual(sentEmail?.to, unverifiedStudent.email);
      assert.ok(sentEmail?.text.includes("/verify-email?token="));

      // Check DB token was replaced
      assert.strictEqual(db._state.tokens.length, 1);
      assert.notStrictEqual(db._state.tokens[0].token, oldToken.hashedToken);
    });

    it("rate limits repeated resend requests (max 3 per minute per IP)", async () => {
      const unverifiedStudent = createTestStudent({ emailVerified: null });
      const db = createMockVerificationDb({ users: [unverifiedStudent] });
      const ip = "192.168.1.100";

      // Attempts 1, 2, 3 should succeed
      const r1 = await requestVerificationResend(db, unverifiedStudent.email, ip);
      const r2 = await requestVerificationResend(db, unverifiedStudent.email, ip);
      const r3 = await requestVerificationResend(db, unverifiedStudent.email, ip);

      assert.strictEqual(r1.success, true);
      assert.strictEqual(r2.success, true);
      assert.strictEqual(r3.success, true);

      // 4th attempt should be blocked by rate limiter
      const r4 = await requestVerificationResend(db, unverifiedStudent.email, ip);
      assert.strictEqual(r4.success, false);
      assert.strictEqual(r4.rateLimited, true);
      assert.match(r4.message, /too many resend attempts/i);
    });
  });

  // --------------------------------------------------------------------------
  // 8. Protected Student Feature Authorization
  // --------------------------------------------------------------------------
  describe("8. Protected Student Feature Authorization", () => {
    it("isEmailVerified helper accurately detects verification status", () => {
      const unverifiedUser = createTestStudent({ emailVerified: null });
      const verifiedUser = createTestStudent({ emailVerified: new Date() });

      assert.strictEqual(isEmailVerified(unverifiedUser), false);
      assert.strictEqual(isEmailVerified(verifiedUser), true);
      assert.strictEqual(isEmailVerified(null), false);
      assert.strictEqual(isEmailVerified(undefined), false);
    });

    it("assertEmailVerified passes for verified student and throws UnverifiedEmailError for unverified student", () => {
      const verifiedUser = createTestStudent({ emailVerified: new Date() });
      const unverifiedUser = createTestStudent({ emailVerified: null });

      // Verified: no exception
      assert.doesNotThrow(() => assertEmailVerified(verifiedUser));

      // Unverified: throws UnverifiedEmailError
      assert.throws(
        () => assertEmailVerified(unverifiedUser),
        (err) => err instanceof UnverifiedEmailError && err.status === 403
      );
    });

    it("saveEvent refuses bookmark action from unverified student with UnverifiedEmailError", async () => {
      const unverifiedUser = createTestStudent({ emailVerified: null });
      const testEvent: Event = {
        id: "evt-001",
        title: "AI Hackathon",
        slug: "ai-hackathon",
        category: "HACKATHON",
        mode: "OFFLINE",
        status: "PUBLISHED",
        organizer: "REC AI & DS",
        summary: "Summary",
        description: "Description",
        venue: "REC",
        registrationUrl: "https://example.com/register",
        bannerUrl: null,
        startDate: new Date(),
        endDate: new Date(),
        registrationDeadline: new Date(),
        eligibility: null,
        fee: "Free",
        prizes: null,
        tags: [],
        authorId: "auth-1",
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const db = createMockVerificationDb({
        users: [unverifiedUser],
        events: [testEvent],
      });

      await assert.rejects(
        () => saveEvent(db, unverifiedUser, testEvent.id),
        (err) => err instanceof UnverifiedEmailError
      );
    });

    it("saveEvent allows bookmark action from verified student", async () => {
      const verifiedUser = createTestStudent({ emailVerified: new Date() });
      const testEvent: Event = {
        id: "evt-001",
        title: "AI Hackathon",
        slug: "ai-hackathon",
        category: "HACKATHON",
        mode: "OFFLINE",
        status: "PUBLISHED",
        organizer: "REC AI & DS",
        summary: "Summary",
        description: "Description",
        venue: "REC",
        registrationUrl: "https://example.com/register",
        bannerUrl: null,
        startDate: new Date(),
        endDate: new Date(),
        registrationDeadline: new Date(),
        eligibility: null,
        fee: "Free",
        prizes: null,
        tags: [],
        authorId: "auth-1",
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const db = createMockVerificationDb({
        users: [verifiedUser],
        events: [testEvent],
      });

      const bookmark = await saveEvent(db, verifiedUser, testEvent.id);
      assert.ok(bookmark);
      assert.strictEqual(bookmark.userId, verifiedUser.id);
      assert.strictEqual(bookmark.eventId, testEvent.id);
    });
  });

  // --------------------------------------------------------------------------
  // 9. Email Provider & Fail-Safe Integration
  // --------------------------------------------------------------------------
  describe("9. Email Provider & Fail-Safe Integration", () => {
    it("mock provider simulates failures safely without uncaught runtime crashes", async () => {
      mockEmailProvider.simulateFailure("SMTP connection refused");

      const result = await mockEmailProvider.sendEmail({
        to: "test@rajalakshmi.edu.in",
        subject: "Verification",
        text: "Please verify",
        html: "<p>Please verify</p>",
      });

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, "SMTP connection refused");
    });
  });
});
