import crypto from "crypto";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import type { Session, User } from "@/db/schema";

export const SESSION_COOKIE_NAME = "rec_auth_session";
export const SESSION_EXPIRATION_DAYS = 7;
export const SESSION_MAX_AGE_SECONDS = SESSION_EXPIRATION_DAYS * 24 * 60 * 60;

/**
 * Generates a high-entropy 256-bit cryptographically secure random session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes a SHA-256 hash of the session token before database persistence.
 * Prevents session impersonation if database records are ever compromised.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export interface SessionValidationResult {
  session: Session;
  user: User;
}

export interface CreateSessionResult {
  session: Session;
  rawToken: string;
}

/**
 * Creates a persistent database session for the given user with a SHA-256 hashed token.
 */
export async function createSession(
  db: NodePgDatabase<typeof schema>,
  userId: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<CreateSessionResult> {
  const rawToken = generateSessionToken();
  const hashedToken = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const [createdSession] = await db
    .insert(schema.sessions)
    .values({
      sessionToken: hashedToken,
      userId,
      expiresAt,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    })
    .returning();

  return { session: createdSession, rawToken };
}

/**
 * Validates a raw session token against the database by checking its SHA-256 hash.
 * If expired, automatically deletes the session and returns null.
 */
export async function validateSessionToken(
  db: NodePgDatabase<typeof schema>,
  rawToken: string
): Promise<SessionValidationResult | null> {
  if (!rawToken || typeof rawToken !== "string") return null;

  const hashedToken = hashSessionToken(rawToken);

  const result = await db.query.sessions.findFirst({
    where: eq(schema.sessions.sessionToken, hashedToken),
    with: {
      user: true,
    },
  });

  if (!result || !result.user) {
    return null;
  }

  const isExpired = new Date(result.expiresAt).getTime() < Date.now();
  if (isExpired) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, result.id));
    return null;
  }

  return {
    session: result,
    user: result.user,
  };
}

/**
 * Invalidates a specific session by raw token (logout).
 */
export async function invalidateSession(
  db: NodePgDatabase<typeof schema>,
  rawToken: string
): Promise<void> {
  if (!rawToken) return;
  const hashedToken = hashSessionToken(rawToken);
  await db.delete(schema.sessions).where(eq(schema.sessions.sessionToken, hashedToken));
}

/**
 * Invalidates all active sessions for a user (password change / security revocation).
 */
export async function invalidateUserSessions(
  db: NodePgDatabase<typeof schema>,
  userId: string
): Promise<void> {
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}
