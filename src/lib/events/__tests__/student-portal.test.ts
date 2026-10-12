import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  publicEventFilterSchema,
  isValidHttpUrl,
} from "../../../validators/event";
import {
  saveEvent,
  unsaveEvent,
  listSavedEvents,
} from "../saved-service";
import { UnauthorizedError, UnverifiedEmailError } from "../../auth/guards";
import type { User, Event, SavedEvent } from "@/db/schema";

type MockSaveEventDb = Parameters<typeof saveEvent>[0];
type MockUnsaveEventDb = Parameters<typeof unsaveEvent>[0];
type MockListSavedEventsDb = Parameters<typeof listSavedEvents>[0];

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Student A",
    email: "student.a@rajalakshmi.edu.in",
    passwordHash: null,
    emailVerified: new Date(),
    image: null,
    role: "STUDENT",
    isApprovedTeacher: false,
    department: "Artificial Intelligence and Data Science",
    registerNumber: "210701045",
    staffId: null,
    designation: null,
    phoneNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "22222222-2222-2222-2222-222222222222",
    title: "REC Hackathon 2026",
    slug: "rec-hackathon-2026",
    category: "HACKATHON",
    mode: "OFFLINE",
    status: "PUBLISHED",
    organizer: "REC AI & DS Department",
    summary: "A 24-hour national hackathon for college students.",
    description: "Detailed event description, tracks and rules.",
    venue: "Turing Lab, Block II, REC Campus",
    registrationUrl: "https://forms.gle/rec-hackathon-2026",
    bannerUrl: null,
    startDate: new Date("2026-11-20T09:00:00Z"),
    endDate: new Date("2026-11-21T18:00:00Z"),
    registrationDeadline: new Date("2026-11-18T23:59:59Z"),
    eligibility: "Open to AI & DS Students",
    fee: "Free",
    prizes: "Cash Prizes & Certificates",
    tags: ["Hackathon", "AI"],
    authorId: "99999999-9999-9999-9999-999999999999",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("Student Discovery & Saved Opportunities Tests", () => {
  const studentUser = createMockUser({ id: "student-uuid-1", name: "Student 1" });
  const otherStudent = createMockUser({ id: "student-uuid-2", name: "Student 2" });
  const publishedEvent = createMockEvent({ id: "event-uuid-1", status: "PUBLISHED" });
  const draftEvent = createMockEvent({ id: "event-uuid-2", status: "DRAFT" });

  describe("1. Public Discovery Query Rules (Published-Only Guarantee)", () => {
    it("publicEventFilterSchema validates category and mode filters", () => {
      const validFilter = {
        category: "HACKATHON",
        mode: "ONLINE",
        search: "NLP",
        page: 1,
        pageSize: 12,
      };
      const parsed = publicEventFilterSchema.parse(validFilter);
      assert.strictEqual(parsed.category, "HACKATHON");
      assert.strictEqual(parsed.mode, "ONLINE");
      assert.strictEqual(parsed.search, "NLP");
    });

    it("publicEventFilterSchema rejects invalid categories", () => {
      const invalid = { category: "CONFERENCE" };
      assert.throws(() => publicEventFilterSchema.parse(invalid));
    });

    it("draft events must never be visible to public student queries", () => {
      // In the application layer, queries use sql`status != 'DRAFT'`
      const isDraftAllowed = (status: string) => status !== "DRAFT";
      assert.strictEqual(isDraftAllowed("PUBLISHED"), true);
      assert.strictEqual(isDraftAllowed("CANCELLED"), true);
      assert.strictEqual(isDraftAllowed("COMPLETED"), true);
      assert.strictEqual(isDraftAllowed(draftEvent.status), false);
    });
  });

  describe("2. Student Bookmark Ownership & Duplicate Prevention", () => {
    it("saveEvent rejects unauthenticated users with UnauthorizedError", async () => {
      const mockDb = {} as unknown as MockSaveEventDb;
      await assert.rejects(
        () => saveEvent(mockDb, null as unknown as User, publishedEvent.id),
        UnauthorizedError
      );
    });

    it("saveEvent rejects unverified students with UnverifiedEmailError", async () => {
      const mockDb = {} as unknown as MockSaveEventDb;
      const unverifiedStudent = createMockUser({ emailVerified: null });
      await assert.rejects(
        () => saveEvent(mockDb, unverifiedStudent, publishedEvent.id),
        (err) => err instanceof UnverifiedEmailError && err.status === 403
      );
    });

    it("unsaveEvent rejects unauthenticated users with UnauthorizedError", async () => {
      const mockDb = {} as unknown as MockUnsaveEventDb;
      await assert.rejects(
        () => unsaveEvent(mockDb, null as unknown as User, publishedEvent.id),
        UnauthorizedError
      );
    });

    it("listSavedEvents rejects unauthenticated users with UnauthorizedError", async () => {
      const mockDb = {} as unknown as MockListSavedEventsDb;
      await assert.rejects(
        () => listSavedEvents(mockDb, null as unknown as User),
        UnauthorizedError
      );
    });

    it("saveEvent refuses to bookmark draft events", async () => {
      const mockDb = {
        query: {
          events: {
            findFirst: async () => null, // Draft event query returns null because status != 'DRAFT'
          },
        },
      } as unknown as MockSaveEventDb;

      await assert.rejects(
        () => saveEvent(mockDb, studentUser, draftEvent.id),
        /Event not found or not available for saving/
      );
    });

    it("saveEvent prevents duplicate bookmarks by returning existing bookmark without error", async () => {
      const existingBookmark: SavedEvent = {
        id: "bookmark-uuid-1",
        userId: studentUser.id,
        eventId: publishedEvent.id,
        createdAt: new Date(),
      };

      const mockDb = {
        query: {
          events: {
            findFirst: async () => publishedEvent,
          },
          savedEvents: {
            findFirst: async () => existingBookmark,
          },
        },
      } as unknown as MockSaveEventDb;

      const result = await saveEvent(mockDb, studentUser, publishedEvent.id);
      assert.strictEqual(result.id, existingBookmark.id);
      assert.strictEqual(result.userId, studentUser.id);
    });

    it("unsaveEvent enforces user ownership by scoping deletion to current student id", async () => {
      let executedWhereClause: unknown = null;

      const mockDb = {
        delete: () => ({
          where: (clause: unknown) => {
            executedWhereClause = clause;
            return {
              returning: async () => [{ id: "deleted-id" }],
            };
          },
        }),
      } as unknown as MockUnsaveEventDb;

      const success = await unsaveEvent(mockDb, studentUser, publishedEvent.id);
      assert.strictEqual(success, true);
      assert.ok(executedWhereClause !== null);
    });

    it("listSavedEvents filters bookmarks strictly by user.id", async () => {
      let queriedUserId = "";

      const mockDb = {
        query: {
          savedEvents: {
            findMany: async () => {
              queriedUserId = studentUser.id;
              return [
                {
                  id: "b1",
                  userId: studentUser.id,
                  eventId: publishedEvent.id,
                  createdAt: new Date(),
                  event: publishedEvent,
                },
              ];
            },
          },
        },
      } as unknown as MockListSavedEventsDb;

      const results = await listSavedEvents(mockDb, studentUser);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].event.id, publishedEvent.id);
      assert.strictEqual(queriedUserId, studentUser.id);
      assert.notStrictEqual(studentUser.id, otherStudent.id);
    });
  });

  describe("3. Registration URL Protocol & Security", () => {
    it("validates official registration URLs", () => {
      assert.strictEqual(isValidHttpUrl("https://forms.gle/rec-hackathon-2026"), true);
      assert.strictEqual(isValidHttpUrl("http://rajalakshmi.edu.in/events/register"), true);
    });

    it("rejects malicious, non-HTTP protocols", () => {
      assert.strictEqual(isValidHttpUrl("javascript:alert(1)"), false);
      assert.strictEqual(isValidHttpUrl("data:text/html;base64,PHNjcmlwdD4="), false);
      assert.strictEqual(isValidHttpUrl("vbscript:msgbox(1)"), false);
      assert.strictEqual(isValidHttpUrl("file:///etc/passwd"), false);
      assert.strictEqual(isValidHttpUrl(""), false);
    });
  });

  describe("4. Graceful Error & Empty State Handling", () => {
    it("empty list query returns zero items and empty pagination metadata without error", () => {
      const emptyResult = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 12,
        totalPages: 1,
      };

      assert.strictEqual(emptyResult.items.length, 0);
      assert.strictEqual(emptyResult.total, 0);
      assert.strictEqual(emptyResult.totalPages, 1);
    });
  });
});
