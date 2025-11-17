import type { Context } from "hono"
import { type RateLimitConfig, RateLimitResult, RateLimitKey } from "./types"
import { MemoryStore } from "./store"
import { TokenBucketLimiter } from "./token-bucket"
import { SlidingWindowLimiter } from "./sliding-window"

/**
 * Rate Limiting Middleware for Hono
 */
export class RateLimitMiddleware {
  private config: RateLimitConfig
  private limiter: TokenBucketLimiter | SlidingWindowLimiter

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (c: Context) => c.req.header("x-forwarded-for") || "default",
      ...config,
    }

    // Initialize store if not provided
    if (!this.config.store) {
      this.config.store = new MemoryStore()
    }

    // Initialize limiter based on strategy
    if (this.config.strategy === "token-bucket") {
      this.limiter = new TokenBucketLimiter(this.config, this.config.store!)
    } else {
      this.limiter = new SlidingWindowLimiter(this.config, this.config.store!)
    }
  }

  /**
   * Create middleware function for Hono
   */
  middleware() {
    return async (c: Context, next: () => Promise<void>) => {
      const key = this.config.keyGenerator!(c)
      const result = await this.limiter.checkLimit(key)

      // Set rate limit headers
      c.header("X-RateLimit-Limit", String(this.config.maxRequests))
      c.header("X-RateLimit-Remaining", String(result.remaining))
      c.header("X-RateLimit-Reset", String(Math.ceil(result.resetTime / 1000)))

      if (result.retryAfter) {
        c.header("Retry-After", String(result.retryAfter))
      }

      if (result.limited) {
        // Call custom handler if provided
        if (this.config.handler) {
          await this.config.handler(c, key, result.remaining)
        }

        return c.json(
          {
            error: "Too Many Requests",
            message: `Rate limit exceeded. Retry after ${result.retryAfter}s`,
            retryAfter: result.retryAfter,
          },
          429
        )
      }

      // Continue to next middleware
      await next()
    }
  }
}

/**
 * Create rate limiting middleware
 */
export function createRateLimit(config: RateLimitConfig) {
  const middleware = new RateLimitMiddleware(config)
  return middleware.middleware()
}

// Re-export types
export * from "./types"
export { MemoryStore } from "./store"
export { TokenBucketLimiter } from "./token-bucket"
export { SlidingWindowLimiter } from "./sliding-window"
