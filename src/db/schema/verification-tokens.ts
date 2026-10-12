import { pgTable, uuid, varchar, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("verification_tokens_identifier_token_unique").on(
      table.identifier,
      table.token
    ),
    index("verification_tokens_token_idx").on(table.token),
  ]
);

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
