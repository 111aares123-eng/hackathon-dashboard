import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { eventCategoryEnum, eventModeEnum, eventStatusEnum } from "./enums";

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    category: eventCategoryEnum("category").notNull(),
    mode: eventModeEnum("mode").default("OFFLINE").notNull(),
    status: eventStatusEnum("status").default("DRAFT").notNull(),
    organizer: varchar("organizer", { length: 255 }).notNull(),
    summary: varchar("summary", { length: 500 }).notNull(),
    description: text("description").notNull(),
    venue: text("venue").notNull(),
    registrationUrl: text("registration_url").notNull(),
    bannerUrl: text("banner_url"),
    startDate: timestamp("start_date", { withTimezone: true, mode: "date" }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true, mode: "date" }).notNull(),
    registrationDeadline: timestamp("registration_deadline", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    eligibility: text("eligibility"),
    fee: varchar("fee", { length: 64 }).default("Free").notNull(),
    prizes: text("prizes"),
    tags: text("tags").array(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check("events_date_order_chk", sql`${table.startDate} <= ${table.endDate}`),
    check(
      "events_deadline_order_chk",
      sql`${table.registrationDeadline} <= ${table.endDate}`
    ),
    index("events_slug_idx").on(table.slug),
    index("events_status_category_idx").on(table.status, table.category),
    index("events_registration_deadline_idx").on(table.registrationDeadline),
    index("events_start_date_idx").on(table.startDate),
    index("events_author_id_idx").on(table.authorId),
  ]
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
