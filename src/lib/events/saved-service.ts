import { eq, and, sql, desc } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import type { User, Event, SavedEvent } from "@/db/schema";
import { assertAuthenticated, assertEmailVerified } from "../auth/guards";

export interface SavedEventWithDetails {
  savedAt: Date;
  event: Event;
}

/**
 * Saves (bookmarks) an opportunity event for an authenticated student.
 *
 * Security Requirements:
 * - Requires authenticated session with verified institutional email.
 * - Prevents duplicate bookmarks (unique constraint).
 * - Only published/active events can be saved (drafts cannot be bookmarked).
 */
export async function saveEvent(
  db: NodePgDatabase<typeof schema>,
  user: User,
  eventId: string
): Promise<SavedEvent> {
  assertAuthenticated(user);
  assertEmailVerified(user);

  // 1. Verify target event exists and is not a draft
  const targetEvent = await db.query.events.findFirst({
    where: and(eq(schema.events.id, eventId), sql`${schema.events.status} != 'DRAFT'`),
  });

  if (!targetEvent) {
    throw new Error("Event not found or not available for saving.");
  }

  // 2. Prevent duplicate bookmarks
  const existingBookmark = await db.query.savedEvents.findFirst({
    where: and(
      eq(schema.savedEvents.userId, user.id),
      eq(schema.savedEvents.eventId, eventId)
    ),
  });

  if (existingBookmark) {
    return existingBookmark;
  }

  // 3. Insert bookmark (handling concurrent race conditions gracefully)
  const [created] = await db
    .insert(schema.savedEvents)
    .values({
      userId: user.id,
      eventId,
    })
    .onConflictDoNothing()
    .returning();

  if (!created) {
    const concurrentBookmark = await db.query.savedEvents.findFirst({
      where: and(
        eq(schema.savedEvents.userId, user.id),
        eq(schema.savedEvents.eventId, eventId)
      ),
    });
    if (concurrentBookmark) {
      return concurrentBookmark;
    }
  }

  return created;
}

/**
 * Removes a saved event bookmark.
 *
 * Security Requirements:
 * - Requires authenticated session.
 * - Enforces ownership: only deletes records where userId matches the session user.
 */
export async function unsaveEvent(
  db: NodePgDatabase<typeof schema>,
  user: User,
  eventId: string
): Promise<boolean> {
  assertAuthenticated(user);

  const deleted = await db
    .delete(schema.savedEvents)
    .where(
      and(
        eq(schema.savedEvents.userId, user.id),
        eq(schema.savedEvents.eventId, eventId)
      )
    )
    .returning();

  return deleted.length > 0;
}

/**
 * Lists all events saved by the authenticated student.
 * Students can only view their own saved events.
 */
export async function listSavedEvents(
  db: NodePgDatabase<typeof schema>,
  user: User
): Promise<SavedEventWithDetails[]> {
  assertAuthenticated(user);

  const bookmarks = await db.query.savedEvents.findMany({
    where: eq(schema.savedEvents.userId, user.id),
    orderBy: [desc(schema.savedEvents.createdAt)],
    with: {
      event: true,
    },
  });

  // Filter out any events that might be in draft state
  return bookmarks
    .filter((b) => b.event && b.event.status !== "DRAFT")
    .map((b) => ({
      savedAt: b.createdAt,
      event: b.event,
    }));
}

/**
 * Returns a Set of event IDs saved by the user for fast UI state decoration.
 */
export async function getSavedEventIdsForUser(
  db: NodePgDatabase<typeof schema>,
  userId?: string
): Promise<string[]> {
  if (!userId) return [];

  const bookmarks = await db
    .select({ eventId: schema.savedEvents.eventId })
    .from(schema.savedEvents)
    .where(eq(schema.savedEvents.userId, userId));

  return bookmarks.map((b) => b.eventId);
}
