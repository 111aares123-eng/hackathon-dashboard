import { pool } from "./index";

export interface DatabaseHealthResult {
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

/**
 * Performs a fast, non-destructive health probe on the configured PostgreSQL connection pool.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      return {
        connected: true,
        latencyMs: Date.now() - start,
      };
    } finally {
      client.release();
    }
  } catch (err) {
    const errorDetails =
      err instanceof AggregateError
        ? `AggregateError: ${err.errors.map((e) => (e instanceof Error ? e.message : String(e))).join("; ")}`
        : err instanceof Error
          ? err.message || err.name || String(err)
          : String(err);

    return {
      connected: false,
      error: errorDetails,
    };
  }
}
