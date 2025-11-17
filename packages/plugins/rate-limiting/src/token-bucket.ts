import {
  type RateLimitConfig,
  type RateLimitResult,
  type RateLimitStore,
  type RateLimitKey,
  RateLimitData,
} from "./types"

/**
 * Token Bucket Rate Limiter
 * Allows smooth distribution of requests over time
 * Tokens are refilled at a constant rate
 */
export class TokenBucketLimiter {
  private config: RateLimitConfig
  private store: RateLimitStore

  constructor(config: RateLimitConfig, store: RateLimitStore) {
    this.config = config
    this.store = store
  }

  async checkLimit(key: RateLimitKey): Promise<RateLimitResult> {
    const now = Date.now()
    let data = await this.store.get(key)

    if (!data) {
      // Initialize new entry
      const resetTime = now + this.config.windowMs
      data = {
        count: 1,
        resetTime,
        tokens: this.config.maxRequests - 1,
        lastRefillTime: now,
      }
      await this.store.set(key, data)
      return {
        limited: false,
        remaining: this.config.maxRequests - 1,
        resetTime,
      }
    }

    // Check if window has expired
    if (data.resetTime < now) {
      // Reset window
      const resetTime = now + this.config.windowMs
      data = {
        count: 1,
        resetTime,
        tokens: this.config.maxRequests - 1,
        lastRefillTime: now,
      }
      await this.store.set(key, data)
      return {
        limited: false,
        remaining: this.config.maxRequests - 1,
        resetTime,
      }
    }

    // Refill tokens based on time elapsed
    const timePassed = now - (data.lastRefillTime || now)
    const refillRate = this.config.maxRequests / (this.config.windowMs / 1000) // tokens per second
    const tokensToAdd = (timePassed / 1000) * refillRate
    data.tokens = Math.min(
      this.config.maxRequests,
      (data.tokens || this.config.maxRequests) + tokensToAdd
    )
    data.lastRefillTime = now
    data.count++

    // Check if request is allowed
    if (data.tokens >= 1) {
      data.tokens--
      await this.store.set(key, data)
      return {
        limited: false,
        remaining: Math.floor(data.tokens),
        resetTime: data.resetTime,
      }
    }

    // Request denied
    const resetTime = data.resetTime
    const retryAfter = Math.ceil((resetTime - now) / 1000)

    return {
      limited: true,
      remaining: 0,
      resetTime,
      retryAfter,
    }
  }
}
