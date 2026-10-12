import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { env } from "@/env";

// Maintain a singleton connection pool across Next.js development hot-reloads
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
