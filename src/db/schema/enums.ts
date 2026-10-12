import { pgEnum } from "drizzle-orm/pg-core";

/**
 * System user roles.
 * Default role is strictly 'STUDENT'. Elevated roles ('TEACHER', 'ADMIN') require server-side approval.
 */
export const roleEnum = pgEnum("user_role", ["STUDENT", "TEACHER", "ADMIN"]);

/**
 * Teacher privilege approval status.
 */
export const approvalStatusEnum = pgEnum("teacher_approval_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

/**
 * Categories of college opportunities.
 */
export const eventCategoryEnum = pgEnum("event_category", [
  "HACKATHON",
  "WORKSHOP",
  "SEMINAR",
  "INTERNSHIP",
  "COMPETITION",
  "ANNOUNCEMENT",
]);

/**
 * Mode of event delivery.
 */
export const eventModeEnum = pgEnum("event_mode", ["OFFLINE", "ONLINE", "HYBRID"]);

/**
 * Lifecycle states of an opportunity/event.
 */
export const eventStatusEnum = pgEnum("event_status", [
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "COMPLETED",
]);
