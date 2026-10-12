import crypto from "crypto";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { env } from "@/env";
import { sendVerificationEmail } from "../email/service";
import { checkRateLimit } from "../rate-limit";

export const VERIFICATION_TOKEN_EXPIRATION_MINUTES = 30;
export const VERIFICATION_TOKEN_MAX_AGE_MS = VERIFICATION_TOKEN_EXPIRATION_MINUTES * 60 * 1000;

/**
 * Generates a cryptographically secure 256-bit random hex token.
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes a SHA-256 hash of the verification token before database persistence.
 * Protects tokens from being stolen if database backups or tables are inspected.
 */
export function hashVerificationToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export interface CreateTokenResult {
  rawToken: string;
  hashedToken: string;
  expiresAt: Date;
}

/**
 * Creates a single-use verification token for the specified email address.
 * Automatically invalidates and deletes any previously issued tokens for this identifier.
 */
export async function createVerificationToken(
  db: NodePgDatabase<typeof schema>,
  email: string
): Promise<CreateTokenResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const rawToken = generateVerificationToken();
  const hashedToken = hashVerificationToken(rawToken);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_MAX_AGE_MS);

  // Invalidate any previous outstanding tokens for this email to prevent duplicate or conflicting links
  await db
    .delete(schema.verificationTokens)
    .where(eq(schema.verificationTokens.identifier, normalizedEmail));

  // Persist only the cryptographic hash of the token
  await db.insert(schema.verificationTokens).values({
    identifier: normalizedEmail,
    token: hashedToken,
    expiresAt,
  });

  return { rawToken, hashedToken, expiresAt };
}

export interface VerificationResult {
  success: boolean;
  email?: string;
  error?: string;
}

/**
 * Atomically redeems a verification token:
 * 1. Hashes the incoming raw token and finds the record.
 * 2. Validates expiration.
 * 3. Consumes (deletes) the token inside a transaction to prevent concurrent or repeat reuse.
 * 4. Updates the user's emailVerified field with a timestamp.
 * 5. Logs an audit entry without exposing the token.
 */
export async function verifyEmailToken(
  db: NodePgDatabase<typeof schema>,
  rawToken: string
): Promise<VerificationResult> {
  if (!rawToken || typeof rawToken !== "string" || rawToken.trim().length !== 64) {
    return { success: false, error: "Invalid verification token format." };
  }

  const hashedToken = hashVerificationToken(rawToken.trim());

  return await db.transaction(async (tx) => {
    // 1. Find token by hashed token value
    const tokenRecord = await tx.query.verificationTokens.findFirst({
      where: eq(schema.verificationTokens.token, hashedToken),
    });

    if (!tokenRecord) {
      return {
        success: false,
        error: "This verification link is invalid or has already been used.",
      };
    }

    // 2. Check expiration
    const now = new Date();
    if (now > new Date(tokenRecord.expiresAt)) {
      // Clean up expired token
      await tx
        .delete(schema.verificationTokens)
        .where(eq(schema.verificationTokens.id, tokenRecord.id));

      return {
        success: false,
        error: "This verification link has expired. Please request a new verification email.",
      };
    }

    // 3. Atomically consume the token (delete it immediately so no concurrent requests can reuse it)
    await tx
      .delete(schema.verificationTokens)
      .where(eq(schema.verificationTokens.id, tokenRecord.id));

    // 4. Update the user account: record emailVerified timestamp
    const [updatedUser] = await tx
      .update(schema.users)
      .set({
        emailVerified: now,
        updatedAt: now,
      })
      .where(eq(schema.users.email, tokenRecord.identifier))
      .returning();

    if (!updatedUser) {
      return {
        success: false,
        error: "Associated user account was not found.",
      };
    }

    // 5. Audit log event (never record raw or hashed tokens in audit logs)
    await tx.insert(schema.auditLogs).values({
      actorId: updatedUser.id,
      action: "EMAIL_VERIFIED",
      targetType: "USER",
      targetId: updatedUser.id,
      metadata: {
        email: updatedUser.email,
        verifiedAt: now.toISOString(),
      },
    });

    return {
      success: true,
      email: updatedUser.email,
    };
  });
}

export interface ResendResult {
  success: boolean;
  message: string;
  rateLimited?: boolean;
}

/**
 * Resends a verification email with rate limiting and account enumeration protection.
 */
export async function requestVerificationResend(
  db: NodePgDatabase<typeof schema>,
  email: string,
  clientIp?: string
): Promise<ResendResult> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Rate limiting: maximum 3 resend attempts per minute per IP / email key
  const rateLimitKey = clientIp ? `resend_${clientIp}` : `resend_${normalizedEmail}`;
  const rateCheck = checkRateLimit(rateLimitKey, "verification_resend", {
    max: 3,
    windowMs: 60 * 1000,
  });

  if (!rateCheck.success) {
    const secondsRemaining = Math.max(1, Math.ceil((rateCheck.resetAt - Date.now()) / 1000));
    return {
      success: false,
      rateLimited: true,
      message: `Too many resend attempts. Please wait ${secondsRemaining} seconds before requesting another email.`,
    };
  }

  // Generic security response: do not reveal whether the email exists in the database
  const genericResponse: ResendResult = {
    success: true,
    message: "If an account associated with this email exists and requires verification, a new link has been dispatched.",
  };

  // 2. Lookup user
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, normalizedEmail),
  });

  // If user does not exist or is already verified, return generic response without action
  if (!user || user.emailVerified !== null) {
    return genericResponse;
  }

  // 3. Invalidate old tokens and issue fresh token
  const { rawToken } = await createVerificationToken(db, normalizedEmail);

  // 4. Dispatch email with official link
  const appUrl = env.APP_URL.replace(/\/$/, "");
  const verificationUrl = `${appUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

  await sendVerificationEmail(normalizedEmail, verificationUrl);

  return genericResponse;
}
