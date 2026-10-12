"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireServerAdmin } from "../auth/server";
import {
  processTeacherApprovalDecision,
  revokeTeacherPrivileges,
} from "./service";
import { cancelEvent } from "../events/service";
import { adminCancelEventSchema } from "@/validators/admin";

export interface AdminActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server action to process an administrator approval or rejection decision.
 */
export async function processTeacherApprovalAction(
  rawInput: unknown
): Promise<AdminActionResult> {
  try {
    const { user } = await requireServerAdmin();
    const result = await processTeacherApprovalDecision(db, user, rawInput);

    revalidatePath("/admin");
    revalidatePath("/admin/teachers");
    revalidatePath("/admin/audit-logs");

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process faculty decision.",
    };
  }
}

/**
 * Server action to revoke faculty publishing privileges.
 */
export async function revokeTeacherAction(
  rawInput: unknown
): Promise<AdminActionResult> {
  try {
    const { user } = await requireServerAdmin();
    const result = await revokeTeacherPrivileges(db, user, rawInput);

    revalidatePath("/admin");
    revalidatePath("/admin/teachers");
    revalidatePath("/admin/audit-logs");
    revalidatePath("/admin/events");

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revoke faculty privileges.",
    };
  }
}

/**
 * Server action for administrative cancellation of an event across all faculty coordinators.
 * Enforces mandatory cancellation reason.
 */
export async function adminCancelEventAction(
  rawInput: unknown
): Promise<AdminActionResult> {
  try {
    const { user } = await requireServerAdmin();
    const parsed = adminCancelEventSchema.parse(rawInput);

    const cancelledEvent = await cancelEvent(db, user, parsed.eventId, parsed.reason);

    revalidatePath("/admin");
    revalidatePath("/admin/events");
    revalidatePath("/admin/audit-logs");
    revalidatePath("/");
    revalidatePath(`/events/${cancelledEvent.slug}`);

    return { success: true, data: cancelledEvent };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel event.",
    };
  }
}
