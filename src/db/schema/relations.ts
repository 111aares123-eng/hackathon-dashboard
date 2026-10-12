import { relations } from "drizzle-orm";
import { users } from "./users";
import { teacherApprovalRequests } from "./approvals";
import { events } from "./events";
import { savedEvents } from "./saved-events";
import { auditLogs } from "./audit-logs";
import { sessions } from "./sessions";

export const usersRelations = relations(users, ({ many }) => ({
  approvalRequests: many(teacherApprovalRequests, { relationName: "user_approval_requests" }),
  reviewedApprovals: many(teacherApprovalRequests, { relationName: "reviewed_approvals" }),
  events: many(events),
  savedEvents: many(savedEvents),
  auditLogs: many(auditLogs),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const teacherApprovalRequestsRelations = relations(
  teacherApprovalRequests,
  ({ one }) => ({
    user: one(users, {
      fields: [teacherApprovalRequests.userId],
      references: [users.id],
      relationName: "user_approval_requests",
    }),
    reviewer: one(users, {
      fields: [teacherApprovalRequests.reviewedBy],
      references: [users.id],
      relationName: "reviewed_approvals",
    }),
  })
);

export const eventsRelations = relations(events, ({ one, many }) => ({
  author: one(users, {
    fields: [events.authorId],
    references: [users.id],
  }),
  savedByStudents: many(savedEvents),
}));

export const savedEventsRelations = relations(savedEvents, ({ one }) => ({
  user: one(users, {
    fields: [savedEvents.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [savedEvents.eventId],
    references: [events.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));
