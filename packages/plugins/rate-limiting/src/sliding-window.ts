import type {
  RateLimitConfig,
  RateLimitResult,
  RateLimitStore,
  RateLimitKey,
  RateLimitData,
} from "./types"

/**
 * Sliding Window Rate Limiter
 * Counts requests in a rolling time window
 * More accurate than fixed window but slightly more memory intensive
 */
export class SlidingWindowLimiter {
  private config: RateLimitConfig
  private store: RateLimitStore
  private timestamps: Map<RateLimitKey, number[]> = new Map()

  constructor(config: RateLimitConfig, store: RateLimitStore) {
    this.config = config
    this.store = store
  }

  async checkLimit(key: RateLimitKey): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get or initialize timestamps array
    let timestamps = this.timestamps.get(key) || []

    // Remove timestamps outside the window
    timestamps = timestamps.filter(t => t > windowStart)

    // Check if limit exceeded
    if (timestamps.length >= this.config.maxRequests) {
      const retryAfter = Math.ceil((Math.min(...timestamps) + this.config.windowMs - now) / 1000)
      return {
        limited: true,
        remaining: 0,
        resetTime: Math.max(...timestamps) + this.config.windowMs,
        retryAfter: Math.max(1, retryAfter),
      }
    }

    // Add current timestamp
    timestamps.push(now)
    this.timestamps.set(key, timestamps)

    // Also store in persistent store for cross-instance compatibility
    const data: RateLimitData = {
      count: timestamps.length,
      resetTime: now + this.config.windowMs,
    }
    await this.store.set(key, data)

    return {
      limited: false,
      remaining: this.config.maxRequests - timestamps.length,
      resetTime: now + this.config.windowMs,
    }
  }

  /**
   * Get remaining requests for a key without consuming one
   */
  async getRemaining(key: RateLimitKey): Promise<number> {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    const timestamps = this.timestamps.get(key) || []
    const validTimestamps = timestamps.filter(t => t > windowStart)

    return Math.max(0, this.config.maxRequests - validTimestamps.length)
  }

  /**
   * Clear in-memory timestamps
   */
  clearMemory(): void {
    this.timestamps.clear()
  }
}
