import type { User } from "@/db/schema";

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = "Authentication required to access this resource.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnverifiedEmailError extends Error {
  readonly status = 403;
  constructor(message = "Please verify your institutional email address to access this feature.") {
    super(message);
    this.name = "UnverifiedEmailError";
  }
}

/**
 * Checks whether the user is an authorized teacher or administrator.
 * Note: Must be explicitly approved (isApprovedTeacher === true).
 */
export function isApprovedTeacher(user: User | null | undefined): boolean {
  if (!user) return false;
  return (
    (user.role === "TEACHER" || user.role === "ADMIN") &&
    user.isApprovedTeacher === true
  );
}

/**
 * Checks whether the user is a system/department administrator.
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === "ADMIN";
}

/**
 * Checks whether the user can create, edit, or publish events.
 */
export function canPublishEvent(user: User | null | undefined): boolean {
  return isApprovedTeacher(user);
}

/**
 * Checks whether the user can edit a specific event.
 * Administrators can edit any event; teachers can only edit their own.
 */
export function canEditEvent(
  user: User | null | undefined,
  eventAuthorId: string
): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return isApprovedTeacher(user) && user.id === eventAuthorId;
}

/**
 * Checks whether the user can approve or reject teacher requests.
 * Only administrators can approve teacher authorization requests.
 */
export function canApproveTeacherRequest(user: User | null | undefined): boolean {
  return isAdmin(user);
}

/**
 * Server guard: asserts the request has an authenticated user.
 */
export function assertAuthenticated(user: User | null | undefined): asserts user is User {
  if (!user) {
    throw new UnauthorizedError();
  }
}

/**
 * Server guard: asserts the user is an approved faculty member or administrator.
 */
export function assertApprovedTeacher(user: User | null | undefined): asserts user is User {
  assertAuthenticated(user);
  if (!isApprovedTeacher(user)) {
    throw new ForbiddenError(
      "Only approved department faculty members are permitted to perform this action."
    );
  }
}

/**
 * Server guard: asserts the user is a department administrator.
 */
export function assertAdmin(user: User | null | undefined): asserts user is User {
  assertAuthenticated(user);
  if (!isAdmin(user)) {
    throw new ForbiddenError("Administrative privileges are required for this action.");
  }
}

/**
 * Checks whether the user's institutional email address is verified.
 */
export function isEmailVerified(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.emailVerified !== null && user.emailVerified !== undefined;
}

/**
 * Server guard: asserts the user's institutional email address has been verified.
 */
export function assertEmailVerified(user: User | null | undefined): asserts user is User {
  assertAuthenticated(user);
  if (!isEmailVerified(user)) {
    throw new UnverifiedEmailError();
  }
}
