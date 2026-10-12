interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window cache for local development and single-instance deployments
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 600000).unref();
}

export interface RateLimitOptions {
  /** Maximum allowed requests within the window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Enforces rate limiting on sensitive actions (e.g. login attempts, password resets).
 *
 * Architecture Note:
 * For multi-instance horizontal scaling in production (e.g., behind a load balancer),
 * this interface is designed to swap to a distributed Redis (ioredis / Upstash) adapter.
 */
export function checkRateLimit(
  identifier: string,
  action: string,
  options: RateLimitOptions = { max: 5, windowMs: 15 * 60 * 1000 }
): RateLimitResult {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.max) {
    const oldestTimestamp = record.timestamps[0];
    const resetAt = oldestTimestamp + options.windowMs;
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      resetAt,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit: options.max,
    remaining: options.max - record.timestamps.length,
    resetAt: now + options.windowMs,
  };
}

export function resetRateLimit(identifier?: string, action?: string): void {
  if (identifier && action) {
    rateLimitStore.delete(`${action}:${identifier}`);
  } else {
    rateLimitStore.clear();
  }
}
