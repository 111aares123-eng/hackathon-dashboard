import { cookies } from "next/headers";
import { db } from "@/db";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  validateSessionToken,
  invalidateSession,
  type SessionValidationResult,
} from "./session";
import {
  UnauthorizedError,
  assertApprovedTeacher,
  assertAdmin,
} from "./guards";
import type { User, Session } from "@/db/schema";

/**
 * Retrieves and validates the current session and authenticated user from trusted server-side state.
 * Validates the cookie against the database using SHA-256 token hashing.
 */
export async function getServerAuthSession(): Promise<SessionValidationResult | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await validateSessionToken(db, token);
  } catch (error) {
    console.error("Error retrieving server session:", error);
    return null;
  }
}

/**
 * Sets the session cookie with hardened flags: HTTP-only, Secure (in production), SameSite=Lax.
 */
export async function setSessionCookie(rawToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the session cookie and revokes the active session from the database.
 */
export async function clearServerSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      await invalidateSession(db, token);
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error("Error clearing server session:", error);
  }
}

/**
 * Server guard: requires an active authenticated session.
 */
export async function requireServerSession(): Promise<{ user: User; session: Session }> {
  const auth = await getServerAuthSession();
  if (!auth) {
    throw new UnauthorizedError();
  }
  return auth;
}

/**
 * Server guard: requires an active approved teacher or administrator session.
 */
export async function requireServerTeacher(): Promise<{ user: User; session: Session }> {
  const auth = await requireServerSession();
  assertApprovedTeacher(auth.user);
  return auth;
}

/**
 * Server guard: requires an active administrator session.
 */
export async function requireServerAdmin(): Promise<{ user: User; session: Session }> {
  const auth = await requireServerSession();
  assertAdmin(auth.user);
  return auth;
}
