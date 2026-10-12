import { z } from "zod";

export const eventCategories = [
  "HACKATHON",
  "WORKSHOP",
  "SEMINAR",
  "INTERNSHIP",
  "COMPETITION",
  "ANNOUNCEMENT",
] as const;

export const eventModes = ["OFFLINE", "ONLINE", "HYBRID"] as const;

export const eventStatuses = [
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "COMPLETED",
] as const;

/**
 * Validates safe external/internal registration URLs.
 * Rejects javascript:, data:, file:, and malformed protocols.
 */
export function isValidHttpUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Event creation and update validation schema.
 */
export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(255, "Title must not exceed 255 characters"),
    category: z.enum(eventCategories, {
      message: "Please select a valid event category",
    }),
    mode: z.enum(eventModes).default("OFFLINE"),
    organizer: z
      .string()
      .trim()
      .min(2, "Organizer name must be at least 2 characters")
      .max(255, "Organizer name must not exceed 255 characters"),
    summary: z
      .string()
      .trim()
      .min(10, "Summary must be at least 10 characters")
      .max(500, "Summary must not exceed 500 characters"),
    description: z
      .string()
      .trim()
      .min(20, "Detailed description must be at least 20 characters"),
    venue: z
      .string()
      .trim()
      .min(2, "Venue / Location details are required (e.g. Lab 3, REC Auditorium, or Online URL)"),
    registrationUrl: z
      .string()
      .trim()
      .min(1, "Official registration link is required")
      .refine(isValidHttpUrl, {
        message: "Registration URL must be a valid HTTP or HTTPS web address",
      }),
    bannerUrl: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || isValidHttpUrl(val), {
        message: "Banner URL must be a valid HTTP or HTTPS web address",
      }),
    startDate: z.coerce.date({
      message: "A valid event start date and time is required",
    }),
    endDate: z.coerce.date({
      message: "A valid event end date and time is required",
    }),
    registrationDeadline: z.coerce.date({
      message: "A valid registration deadline date and time is required",
    }),
    eligibility: z.string().trim().optional(),
    fee: z.string().trim().default("Free"),
    prizes: z.string().trim().optional(),
    tags: z
      .array(z.string().trim().min(1))
      .default([])
      .or(
        z.string().transform((val) =>
          val
            ? val
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : []
        )
      ),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "Event start date must be before or equal to the end date",
    path: ["endDate"],
  })
  .refine((data) => data.registrationDeadline <= data.endDate, {
    message: "Registration deadline cannot be after the event end date",
    path: ["registrationDeadline"],
  });

export type EventFormInput = z.infer<typeof eventFormSchema>;

/**
 * Filter schema for teacher dashboard event queries.
 */
export const eventFilterSchema = z.object({
  status: z.enum(eventStatuses).optional(),
  category: z.enum(eventCategories).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});

export type EventFilterInput = z.infer<typeof eventFilterSchema>;

/**
 * Filter schema for student and public event discovery.
 * Strictly searches published events only.
 */
export const publicEventFilterSchema = z.object({
  category: z.enum(eventCategories).optional(),
  mode: z.enum(eventModes).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(12),
});

export type PublicEventFilterInput = z.infer<typeof publicEventFilterSchema>;

