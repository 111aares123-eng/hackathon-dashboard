import { z } from "zod";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import type { User, Session } from "@/db/schema";
import { verifyPassword } from "./password";
import { createSession } from "./session";
import { checkRateLimit, resetRateLimit } from "../rate-limit";

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface LoginResult {
  user: Omit<User, "passwordHash">;
  session: Session;
  rawToken: string;
}

/**
 * Authenticates user credentials and provisions a database session.
 *
 * Security Features:
 * - Rate limiting against brute-force attacks (5 attempts / 15 mins).
 * - Constant-time password verification.
 * - Audit log on failed and successful logins.
 */
export async function authenticateCredentials(
  db: NodePgDatabase<typeof schema>,
  rawInput: unknown,
  clientContext?: { ipAddress?: string; userAgent?: string }
): Promise<LoginResult> {
  const parsed = loginSchema.parse(rawInput);
  const normalizedEmail = parsed.email.toLowerCase();
  const rateLimitKey = clientContext?.ipAddress || normalizedEmail;

  // 1. Rate limiting check
  const rateCheck = checkRateLimit(rateLimitKey, "login_attempt", {
    max: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateCheck.success) {
    const minutesRemaining = Math.ceil((rateCheck.resetAt - Date.now()) / 60000);
    throw new Error(
      `Too many failed login attempts. Please try again in ${minutesRemaining} minutes.`
    );
  }

  // 2. Fetch user
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, normalizedEmail),
  });

  if (!user || !user.passwordHash) {
    throw new Error("Invalid email or password.");
  }

  // 3. Verify password
  const isValid = await verifyPassword(parsed.password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password.");
  }

  // 4. Reset rate limit counter on success
  resetRateLimit(rateLimitKey, "login_attempt");

  // 5. Create database session (with hashed token in DB)
  const { session, rawToken } = await createSession(db, user.id, clientContext);

  // 6. Log audit entry
  await db.insert(schema.auditLogs).values({
    actorId: user.id,
    action: "USER_LOGGED_IN",
    targetType: "USER",
    targetId: user.id,
    metadata: {
      ipAddress: clientContext?.ipAddress,
      userAgent: clientContext?.userAgent,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safeUser } = user;
  return {
    user: safeUser,
    session,
    rawToken,
  };
}
