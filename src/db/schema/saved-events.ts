import { pgTable, uuid, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { events } from "./events";

export const savedEvents = pgTable(
  "saved_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("saved_events_user_event_unique").on(table.userId, table.eventId),
    index("saved_events_user_id_idx").on(table.userId),
    index("saved_events_event_id_idx").on(table.eventId),
  ]
);

export type SavedEvent = typeof savedEvents.$inferSelect;
export type NewSavedEvent = typeof savedEvents.$inferInsert;
