/**
 * PronaX In-Memory Sliding Window Rate Limiter
 * Protects critical payment, webhook, and auth endpoints against brute force and DDoS.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export class RateLimiter {
  /**
   * Checks if an IP or identifier has exceeded the allowed requests limit in a time window.
   * @param key Unique key (e.g., `checkout:${ip}`)
   * @param limit Max allowed requests (e.g., 10)
   * @param windowMs Time window in milliseconds (e.g., 60,000 for 1 minute)
   */
  static check(key: string, limit: number = 20, windowMs: number = 60000): {
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
  } {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return {
        allowed: true,
        remaining: limit - 1,
        resetInSeconds: Math.ceil(windowMs / 1000),
      };
    }

    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
      };
    }

    record.count += 1;
    return {
      allowed: true,
      remaining: limit - record.count,
      resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  /**
   * Periodic cleanup to prevent memory leaks
   */
  static cleanup() {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Clean expired records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => RateLimiter.cleanup(), 5 * 60 * 1000);
}
