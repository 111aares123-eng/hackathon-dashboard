import { eq, and, desc, asc, sql, ilike, or } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import type { User, Event } from "@/db/schema";
import { assertApprovedTeacher, canEditEvent, ForbiddenError } from "../auth/guards";
import {
  eventFormSchema,
  eventFilterSchema,
  publicEventFilterSchema,
} from "@/validators/event";
import { slugify } from "./slug";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Creates an opportunity event.
 * Defaults status to 'DRAFT'.
 * Enforces faculty authorization and audit logging.
 */
export async function createEvent(
  db: NodePgDatabase<typeof schema>,
  user: User,
  rawInput: unknown
): Promise<Event> {
  // 1. Server guard: user must be an approved teacher or administrator
  assertApprovedTeacher(user);

  // 2. Validate input
  const validated = eventFormSchema.parse(rawInput);

  // 3. Generate unique slug
  let candidateSlug = slugify(validated.title);
  const existingWithSlug = await db.query.events.findFirst({
    where: eq(schema.events.slug, candidateSlug),
  });

  if (existingWithSlug) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    candidateSlug = `${candidateSlug}-${randomSuffix}`;
  }

  // 4. Insert event with status DRAFT and current user as author
  const [createdEvent] = await db
    .insert(schema.events)
    .values({
      title: validated.title,
      slug: candidateSlug,
      category: validated.category,
      mode: validated.mode,
      status: "DRAFT",
      organizer: validated.organizer,
      summary: validated.summary,
      description: validated.description,
      venue: validated.venue,
      registrationUrl: validated.registrationUrl,
      bannerUrl: validated.bannerUrl,
      startDate: validated.startDate,
      endDate: validated.endDate,
      registrationDeadline: validated.registrationDeadline,
      eligibility: validated.eligibility,
      fee: validated.fee,
      prizes: validated.prizes,
      tags: validated.tags,
      authorId: user.id,
      publishedAt: null,
    })
    .returning();

  // 5. Audit creation
  await db.insert(schema.auditLogs).values({
    actorId: user.id,
    action: "EVENT_CREATED",
    targetType: "EVENT",
    targetId: createdEvent.id,
    metadata: {
      title: createdEvent.title,
      category: createdEvent.category,
      status: "DRAFT",
    },
  });

  return createdEvent;
}

/**
 * Updates an existing event.
 * Security: Teachers can only update their own events; administrators can update all.
 */
export async function updateEvent(
  db: NodePgDatabase<typeof schema>,
  user: User,
  eventId: string,
  rawInput: unknown
): Promise<Event> {
  assertApprovedTeacher(user);

  const existingEvent = await db.query.events.findFirst({
    where: eq(schema.events.id, eventId),
  });

  if (!existingEvent) {
    throw new Error("Event not found.");
  }

  // Ownership check
  if (!canEditEvent(user, existingEvent.authorId)) {
    throw new ForbiddenError("You do not have permission to modify events created by other faculty members.");
  }

  const validated = eventFormSchema.parse(rawInput);

  // Preserve slug or update if title changed
  let slug = existingEvent.slug;
  if (validated.title !== existingEvent.title) {
    slug = slugify(validated.title);
    const slugCollision = await db.query.events.findFirst({
      where: and(eq(schema.events.slug, slug), sql`${schema.events.id} != ${eventId}`),
    });
    if (slugCollision) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }
  }

  const [updatedEvent] = await db
    .update(schema.events)
    .set({
      title: validated.title,
      slug,
      category: validated.category,
      mode: validated.mode,
      organizer: validated.organizer,
      summary: validated.summary,
      description: validated.description,
      venue: validated.venue,
      registrationUrl: validated.registrationUrl,
      bannerUrl: validated.bannerUrl,
      startDate: validated.startDate,
      endDate: validated.endDate,
      registrationDeadline: validated.registrationDeadline,
      eligibility: validated.eligibility,
      fee: validated.fee,
      prizes: validated.prizes,
      tags: validated.tags,
      // Author is immutable: cannot reassign ownership
    })
    .where(eq(schema.events.id, eventId))
    .returning();

  await db.insert(schema.auditLogs).values({
    actorId: user.id,
    action: "EVENT_UPDATED",
    targetType: "EVENT",
    targetId: eventId,
    metadata: {
      title: updatedEvent.title,
    },
  });

  return updatedEvent;
}

/**
 * Publishes an event (DRAFT -> PUBLISHED).
 */
export async function publishEvent(
  db: NodePgDatabase<typeof schema>,
  user: User,
  eventId: string
): Promise<Event> {
  assertApprovedTeacher(user);

  const existingEvent = await db.query.events.findFirst({
    where: eq(schema.events.id, eventId),
  });

  if (!existingEvent) {
    throw new Error("Event not found.");
  }

  if (!canEditEvent(user, existingEvent.authorId)) {
    throw new ForbiddenError("You do not have permission to publish this event.");
  }

  if (existingEvent.status === "PUBLISHED") {
    return existingEvent;
  }

  if (existingEvent.status === "CANCELLED") {
    throw new Error("Cancelled events cannot be published directly.");
  }

  const [publishedEvent] = await db
    .update(schema.events)
    .set({
      status: "PUBLISHED",
      publishedAt: new Date(),
    })
    .where(eq(schema.events.id, eventId))
    .returning();

  await db.insert(schema.auditLogs).values({
    actorId: user.id,
    action: "EVENT_PUBLISHED",
    targetType: "EVENT",
    targetId: eventId,
    metadata: {
      publishedAt: publishedEvent.publishedAt,
    },
  });

  return publishedEvent;
}

/**
 * Cancels an event (PUBLISHED or DRAFT -> CANCELLED).
 * Requires a mandatory cancellation reason (minimum 5 characters).
 */
export async function cancelEvent(
  db: NodePgDatabase<typeof schema>,
  user: User,
  eventId: string,
  cancellationReason: string
): Promise<Event> {
  assertApprovedTeacher(user);

  if (!cancellationReason || cancellationReason.trim().length < 5) {
    throw new Error("A cancellation reason of at least 5 characters is mandatory.");
  }

  const existingEvent = await db.query.events.findFirst({
    where: eq(schema.events.id, eventId),
  });

  if (!existingEvent) {
    throw new Error("Event not found.");
  }

  if (!canEditEvent(user, existingEvent.authorId)) {
    throw new ForbiddenError("You do not have permission to cancel this event.");
  }

  const [cancelledEvent] = await db
    .update(schema.events)
    .set({
      status: "CANCELLED",
    })
    .where(eq(schema.events.id, eventId))
    .returning();

  await db.insert(schema.auditLogs).values({
    actorId: user.id,
    action: "EVENT_CANCELLED",
    targetType: "EVENT",
    targetId: eventId,
    metadata: {
      reason: cancellationReason.trim(),
      cancelledByRole: user.role,
    },
  });

  return cancelledEvent;
}

/**
 * Lists events for the faculty management dashboard.
 * Regular teachers only see their own authored events; administrators see all.
 */
export async function listTeacherEvents(
  db: NodePgDatabase<typeof schema>,
  user: User,
  rawFilters?: unknown
): Promise<PaginatedResult<Event>> {
  assertApprovedTeacher(user);

  const filters = eventFilterSchema.parse(rawFilters || {});
  const offset = (filters.page - 1) * filters.pageSize;

  const conditions = [];

  // Non-admin teachers only query their own authored events
  if (user.role !== "ADMIN") {
    conditions.push(eq(schema.events.authorId, user.id));
  }

  if (filters.status) {
    conditions.push(eq(schema.events.status, filters.status));
  }

  if (filters.category) {
    conditions.push(eq(schema.events.category, filters.category));
  }

  if (filters.search && filters.search.trim() !== "") {
    const searchPattern = `%${filters.search.trim()}%`;
    conditions.push(ilike(schema.events.title, searchPattern));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(whereClause);

  const total = Number(totalResult?.count || 0);

  const items = await db.query.events.findMany({
    where: whereClause,
    orderBy: [desc(schema.events.createdAt)],
    limit: filters.pageSize,
    offset,
  });

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(total / filters.pageSize) || 1,
  };
}

/**
 * Retrieves a single event for editing.
 */
export async function getTeacherEventById(
  db: NodePgDatabase<typeof schema>,
  user: User,
  eventId: string
): Promise<Event> {
  assertApprovedTeacher(user);

  const event = await db.query.events.findFirst({
    where: eq(schema.events.id, eventId),
  });

  if (!event) {
    throw new Error("Event not found.");
  }

  if (!canEditEvent(user, event.authorId)) {
    throw new ForbiddenError("You do not have access to view or edit this event.");
  }

  return event;
}

/**
 * Public & Student Event Catalog Query.
 *
 * Security Invariant:
 * Strictly filters out DRAFT events. Drafts are never exposed to public or student queries.
 * Only returns PUBLISHED, ongoing, completed or explicitly cancelled opportunities.
 */
export async function listPublishedEvents(
  db: NodePgDatabase<typeof schema>,
  rawFilters?: unknown
): Promise<PaginatedResult<Event>> {
  const filters = publicEventFilterSchema.parse(rawFilters || {});
  const offset = (filters.page - 1) * filters.pageSize;

  // Invariant 1: Strictly disallow drafts in public catalog
  const conditions = [sql`${schema.events.status} != 'DRAFT'`];

  if (filters.category) {
    conditions.push(eq(schema.events.category, filters.category));
  }

  if (filters.mode) {
    conditions.push(eq(schema.events.mode, filters.mode));
  }

  if (filters.search && filters.search.trim() !== "") {
    const pattern = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(schema.events.title, pattern),
        ilike(schema.events.organizer, pattern),
        ilike(schema.events.summary, pattern),
        ilike(schema.events.venue, pattern)
      )!
    );
  }

  const whereClause = and(...conditions);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(whereClause);

  const total = Number(totalResult?.count || 0);

  // Order upcoming events by registration deadline ascending
  const items = await db.query.events.findMany({
    where: whereClause,
    orderBy: [asc(schema.events.registrationDeadline), desc(schema.events.startDate)],
    limit: filters.pageSize,
    offset,
  });

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(total / filters.pageSize) || 1,
  };
}

/**
 * Retrieves a single published event by its slug for public student viewing.
 * Returns null if the event is a draft or does not exist.
 */
export async function getPublishedEventBySlug(
  db: NodePgDatabase<typeof schema>,
  slug: string
): Promise<Event | null> {
  if (!slug || typeof slug !== "string") return null;

  const event = await db.query.events.findFirst({
    where: and(
      eq(schema.events.slug, slug.trim()),
      sql`${schema.events.status} != 'DRAFT'`
    ),
  });

  return event || null;
}

export interface PublicPortalStats {
  activeEventsCount: number;
  totalStudentsCount: number;
  approvedFacultyCount: number;
  upcomingDeadlinesCount: number;
  activeAnnouncements: string[];
}

/**
 * Calculates live public statistics and announcements directly from PostgreSQL records.
 */
export async function getPublicPortalStats(
  db: NodePgDatabase<typeof schema>
): Promise<PublicPortalStats> {
  const [activeEventsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(sql`${schema.events.status} != 'DRAFT'`);

  const [studentsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users)
    .where(eq(schema.users.role, "STUDENT"));

  const [facultyRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users)
    .where(eq(schema.users.isApprovedTeacher, true));

  const now = new Date();
  const [upcomingRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        sql`${schema.events.status} != 'DRAFT'`,
        sql`${schema.events.registrationDeadline} >= ${now}`
      )
    );

  const urgentEvents = await db.query.events.findMany({
    where: and(
      sql`${schema.events.status} != 'DRAFT'`,
      sql`${schema.events.registrationDeadline} >= ${now}`
    ),
    orderBy: [asc(schema.events.registrationDeadline)],
    limit: 3,
  });

  const activeAnnouncements = urgentEvents.map(
    (ev) =>
      `FLASH: ${ev.title.toUpperCase()} — DEADLINE: ${new Date(ev.registrationDeadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`
  );

  return {
    activeEventsCount: Number(activeEventsRes?.count || 0),
    totalStudentsCount: Number(studentsRes?.count || 0),
    approvedFacultyCount: Number(facultyRes?.count || 0),
    upcomingDeadlinesCount: Number(upcomingRes?.count || 0),
    activeAnnouncements,
  };
}

