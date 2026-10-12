import { eq } from "drizzle-orm";
import { db, pool } from "./index";
import * as schema from "./schema";

/**
 * Safe First-Administrator Bootstrap Procedure.
 *
 * Security Design:
 * - Runs strictly via local CLI (never exposed over HTTP).
 * - Requires an already registered account to promote.
 * - Does not accept, generate, or print plaintext passwords.
 * - Refuses repeat promotion if user is already an ADMIN.
 * - Executes role update and audit log inside a database transaction.
 *
 * Usage:
 *   pnpm tsx src/db/bootstrap-admin.ts <email>
 */
async function bootstrapAdmin() {
  const args = process.argv.slice(2);
  let email = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email" && args[i + 1]) {
      email = args[i + 1];
      break;
    } else if (!args[i].startsWith("--")) {
      email = args[i];
      break;
    }
  }

  if (!email || !email.includes("@")) {
    console.error("Usage: pnpm db:bootstrap-admin --email <user-email>");
    console.error("Example: pnpm tsx src/db/bootstrap-admin.ts admin@rajalakshmi.edu.in");
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, normalizedEmail),
    });

    if (!user) {
      console.error(
        `Error: No user found with email "${normalizedEmail}".\n` +
          `Please register the user account first through the portal registration flow before promoting.`
      );
      process.exit(1);
    }

    // Refuse repeat execution: if user is already an administrator
    if (user.role === "ADMIN" && user.isApprovedTeacher) {
      console.log(`[Info] User "${user.name}" (${normalizedEmail}) is already an active ADMIN. No change made.`);
      process.exit(0);
    }

    // Execute role elevation and audit logging inside an atomic transaction
    await db.transaction(async (tx) => {
      await tx
        .update(schema.users)
        .set({
          role: "ADMIN",
          isApprovedTeacher: true,
        })
        .where(eq(schema.users.id, user.id));

      await tx.insert(schema.auditLogs).values({
        actorId: user.id,
        action: "ADMIN_BOOTSTRAP",
        targetType: "USER",
        targetId: user.id,
        metadata: {
          email: normalizedEmail,
          previousRole: user.role,
          timestamp: new Date().toISOString(),
          promotedVia: "CLI_BOOTSTRAP",
        },
      });
    });

    console.log(`[Success] User "${user.name}" (${normalizedEmail}) has been elevated to ADMIN within transaction.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to bootstrap administrator:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

bootstrapAdmin();
