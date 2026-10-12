"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireServerTeacher } from "../auth/server";
import {
  createEvent,
  updateEvent,
  publishEvent,
  cancelEvent,
  listTeacherEvents,
  getTeacherEventById,
  type PaginatedResult,
} from "./service";
import type { Event } from "@/db/schema";
import type { EventFilterInput } from "@/validators/event";

export interface EventActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server action to create a new event draft.
 */
export async function createEventAction(rawInput: unknown): Promise<EventActionResult<Event>> {
  try {
    const { user } = await requireServerTeacher();
    const event = await createEvent(db, user, rawInput);
    revalidatePath("/admin/events");
    return { success: true, data: event };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event.",
    };
  }
}

/**
 * Server action to update an existing event.
 */
export async function updateEventAction(
  eventId: string,
  rawInput: unknown
): Promise<EventActionResult<Event>> {
  try {
    const { user } = await requireServerTeacher();
    const event = await updateEvent(db, user, eventId, rawInput);
    revalidatePath("/admin/events");
    return { success: true, data: event };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update event.",
    };
  }
}

/**
 * Server action to publish an event.
 */
export async function publishEventAction(eventId: string): Promise<EventActionResult<Event>> {
  try {
    const { user } = await requireServerTeacher();
    const event = await publishEvent(db, user, eventId);
    revalidatePath("/admin/events");
    return { success: true, data: event };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish event.",
    };
  }
}

/**
 * Server action to cancel an event.
 */
export async function cancelEventAction(
  eventId: string,
  reason: string
): Promise<EventActionResult<Event>> {
  try {
    const { user } = await requireServerTeacher();
    const event = await cancelEvent(db, user, eventId, reason);
    revalidatePath("/admin/events");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, data: event };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel event.",
    };
  }
}

/**
 * Server action to list teacher events with filtering and pagination.
 */
export async function listTeacherEventsAction(
  filters?: EventFilterInput
): Promise<EventActionResult<PaginatedResult<Event>>> {
  try {
    const { user } = await requireServerTeacher();
    const result = await listTeacherEvents(db, user, filters);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch events.",
    };
  }
}

/**
 * Server action to retrieve an event by ID for editing.
 */
export async function getTeacherEventByIdAction(
  eventId: string
): Promise<EventActionResult<Event>> {
  try {
    const { user } = await requireServerTeacher();
    const event = await getTeacherEventById(db, user, eventId);
    return { success: true, data: event };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to retrieve event.",
    };
  }
}
