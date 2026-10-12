import { pgTable, uuid, varchar, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { roleEnum } from "./enums";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    emailVerified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
    image: text("image"),
    role: roleEnum("role").default("STUDENT").notNull(),
    isApprovedTeacher: boolean("is_approved_teacher").default(false).notNull(),
    department: varchar("department", { length: 128 })
      .default("Artificial Intelligence and Data Science")
      .notNull(),
    registerNumber: varchar("register_number", { length: 64 }),
    staffId: varchar("staff_id", { length: 64 }),
    designation: varchar("designation", { length: 128 }),
    phoneNumber: varchar("phone_number", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_staff_id_idx").on(table.staffId),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
