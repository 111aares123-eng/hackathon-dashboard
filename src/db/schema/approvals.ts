import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { approvalStatusEnum } from "./enums";

export const teacherApprovalRequests = pgTable(
  "teacher_approval_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    staffId: varchar("staff_id", { length: 64 }).notNull(),
    department: varchar("department", { length: 128 }).notNull(),
    designation: varchar("designation", { length: 128 }).notNull(),
    status: approvalStatusEnum("status").default("PENDING").notNull(),
    proofUrl: text("proof_url"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewNotes: text("review_notes"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("teacher_approvals_user_id_idx").on(table.userId),
    index("teacher_approvals_status_idx").on(table.status),
  ]
);

export type TeacherApprovalRequest = typeof teacherApprovalRequests.$inferSelect;
export type NewTeacherApprovalRequest = typeof teacherApprovalRequests.$inferInsert;
