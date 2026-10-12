"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireServerSession } from "../auth/server";
import { saveEvent, unsaveEvent, getSavedEventIdsForUser } from "./saved-service";

export interface ToggleSaveResult {
  success: boolean;
  isSaved?: boolean;
  error?: string;
}

/**
 * Server action to toggle bookmark state for an event.
 * Requires an authenticated student session.
 */
export async function toggleSaveEventAction(eventId: string): Promise<ToggleSaveResult> {
  try {
    const { user } = await requireServerSession();

    const savedIds = await getSavedEventIdsForUser(db, user.id);
    const alreadySaved = savedIds.includes(eventId);

    if (alreadySaved) {
      await unsaveEvent(db, user, eventId);
      revalidatePath("/saved");
      revalidatePath("/");
      return { success: true, isSaved: false };
    } else {
      await saveEvent(db, user, eventId);
      revalidatePath("/saved");
      revalidatePath("/");
      return { success: true, isSaved: true };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update saved event.",
    };
  }
}

/**
 * Server action to remove a saved event bookmark.
 */
export async function unsaveEventAction(eventId: string): Promise<ToggleSaveResult> {
  try {
    const { user } = await requireServerSession();
    await unsaveEvent(db, user, eventId);
    revalidatePath("/saved");
    revalidatePath("/");
    return { success: true, isSaved: false };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove bookmark.",
    };
  }
}
