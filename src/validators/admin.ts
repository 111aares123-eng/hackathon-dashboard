import { z } from "zod";

export const reviewTeacherRequestSchema = z.object({
  requestId: z.string().uuid("Invalid request ID format."),
  decision: z.enum(["APPROVE", "REJECT"]),
  reviewNotes: z
    .string()
    .trim()
    .max(500, "Review notes cannot exceed 500 characters.")
    .optional(),
});

export type ReviewTeacherRequestInput = z.infer<typeof reviewTeacherRequestSchema>;

export const revokeTeacherSchema = z.object({
  targetUserId: z.string().uuid("Invalid user ID format."),
  reason: z
    .string()
    .trim()
    .max(500, "Revocation reason cannot exceed 500 characters.")
    .optional(),
});

export type RevokeTeacherInput = z.infer<typeof revokeTeacherSchema>;

export const adminCancelEventSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format."),
  reason: z
    .string()
    .trim()
    .min(5, "Cancellation reason must be at least 5 characters.")
    .max(500, "Cancellation reason cannot exceed 500 characters."),
});

export type AdminCancelEventInput = z.infer<typeof adminCancelEventSchema>;

export const auditLogFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  action: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>;
