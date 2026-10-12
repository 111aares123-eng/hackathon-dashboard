import { z } from "zod";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import type { User } from "@/db/schema";
import { hashPassword } from "./password";
import { validateInstitutionalEmail } from "./validation";
import { createVerificationToken } from "./verification-service";
import { sendVerificationEmail } from "../email/service";
import { env } from "@/env";

/**
 * Registration input schema.
 * Note: Neither 'role' nor 'isApprovedTeacher' is exposed or accepted in this schema.
 */
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(255),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
  department: z
    .string()
    .trim()
    .min(2)
    .max(128)
    .default("Artificial Intelligence and Data Science"),
  registerNumber: z.string().trim().max(64).optional(),
  staffId: z.string().trim().max(64).optional(),
  designation: z.string().trim().max(128).optional(),
  phoneNumber: z.string().trim().max(32).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Registers a new user.
 *
 * Security Invariants:
 * 1. Role is strictly hardcoded to 'STUDENT'.
 * 2. isApprovedTeacher is strictly hardcoded to false.
 * 3. Client cannot self-grant elevated privileges.
 * 4. Checks institutional domain configuration if enabled.
 */
export async function registerUser(
  db: NodePgDatabase<typeof schema>,
  rawInput: unknown
): Promise<Omit<User, "passwordHash">> {
  const parsed = registerSchema.parse(rawInput);
  const normalizedEmail = parsed.email.toLowerCase();

  // 1. Verify institutional email policy (unassumed if ALLOWED_INSTITUTIONAL_DOMAINS is empty)
  const emailCheck = validateInstitutionalEmail(
    normalizedEmail,
    env.ALLOWED_INSTITUTIONAL_DOMAINS
  );
  if (!emailCheck.valid) {
    throw new Error(emailCheck.reason || "Unauthorized email domain.");
  }

  // 2. Check email uniqueness
  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.email, normalizedEmail),
  });

  if (existingUser) {
    throw new Error("An account with this email address already exists.");
  }

  // 3. Hash password
  const passwordHash = await hashPassword(parsed.password);

  // 4. Force least privilege: role = 'STUDENT', isApprovedTeacher = false
  const [createdUser] = await db
    .insert(schema.users)
    .values({
      name: parsed.name,
      email: normalizedEmail,
      passwordHash,
      department: parsed.department,
      registerNumber: parsed.registerNumber,
      staffId: parsed.staffId,
      designation: parsed.designation,
      phoneNumber: parsed.phoneNumber,
      role: "STUDENT",
      isApprovedTeacher: false,
    })
    .returning();

  // 5. Audit registration
  await db.insert(schema.auditLogs).values({
    actorId: createdUser.id,
    action: "USER_REGISTERED",
    targetType: "USER",
    targetId: createdUser.id,
    metadata: {
      email: normalizedEmail,
      role: "STUDENT",
      department: parsed.department,
    },
  });

  // 6. Generate single-use verification token and dispatch verification email
  try {
    const { rawToken } = await createVerificationToken(db, normalizedEmail);
    const appUrl = (env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const verificationUrl = `${appUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;
    await sendVerificationEmail(normalizedEmail, verificationUrl);
  } catch (err) {
    console.error("Failed to dispatch verification email during registration:", err);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safeUser } = createdUser;
  return safeUser;
}
