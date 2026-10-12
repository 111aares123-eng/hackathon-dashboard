"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { authenticateCredentials, type LoginInput } from "./login";
import { registerUser, type RegisterInput } from "./register";
import { createSession } from "./session";
import { setSessionCookie, clearServerSession, getServerAuthSession } from "./server";
import { verifyEmailToken, requestVerificationResend } from "./verification-service";
import type { User } from "@/db/schema";

export interface AuthActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server action for user authentication.
 * Enforces rate limiting, credentials verification, session hashing, and HTTP-only cookie assignment.
 */
export async function loginAction(input: LoginInput): Promise<AuthActionResult<{ user: Omit<User, "passwordHash"> }>> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const userAgent = headersList.get("user-agent") || undefined;

    const result = await authenticateCredentials(db, input, { ipAddress, userAgent });

    // Set secure HTTP-only cookie with the raw token
    await setSessionCookie(result.rawToken);

    return {
      success: true,
      data: { user: result.user },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed.",
    };
  }
}

/**
 * Server action for student/faculty registration.
 * Enforces least privilege ('STUDENT'), institutional domain policy, and assigns active session.
 */
export async function registerAction(input: RegisterInput): Promise<AuthActionResult<{ user: Omit<User, "passwordHash"> }>> {
  try {
    const safeUser = await registerUser(db, input);

    // Auto-login upon registration
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const userAgent = headersList.get("user-agent") || undefined;

    const { rawToken } = await createSession(db, safeUser.id, { ipAddress, userAgent });
    await setSessionCookie(rawToken);

    return {
      success: true,
      data: { user: safeUser },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed.",
    };
  }
}

/**
 * Server action for logging out.
 * Revokes the session in the database and clears the HTTP-only cookie.
 */
export async function logoutAction(): Promise<AuthActionResult> {
  try {
    await clearServerSession();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Logout failed.",
    };
  }
}

/**
 * Server action to get the current authenticated session user.
 */
export async function getCurrentUserAction(): Promise<AuthActionResult<Omit<User, "passwordHash"> | null>> {
  try {
    const auth = await getServerAuthSession();
    if (!auth) {
      return { success: true, data: null };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = auth.user;
    return { success: true, data: safeUser };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to retrieve session.",
    };
  }
}

/**
 * Server action to verify email token.
 * Redeems the single-use token atomically and updates user verification timestamp.
 */
export async function verifyEmailAction(token: string): Promise<AuthActionResult<{ email: string }>> {
  try {
    const result = await verifyEmailToken(db, token);
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Email verification failed.",
      };
    }
    return {
      success: true,
      data: { email: result.email! },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email verification failed.",
    };
  }
}

/**
 * Server action to request a new verification email with rate limiting and generic responses.
 */
export async function resendVerificationAction(email: string): Promise<AuthActionResult<{ message: string }>> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const result = await requestVerificationResend(db, email, ipAddress);
    if (!result.success && result.rateLimited) {
      return {
        success: false,
        error: result.message,
      };
    }
    return {
      success: true,
      data: { message: result.message },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resend verification link.",
    };
  }
}

