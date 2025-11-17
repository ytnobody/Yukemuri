/**
 * Rate Limiting Plugin for Yukemuri
 * Provides token bucket and sliding window algorithms for rate limiting
 */

/**
 * Rate limiting strategy type
 */
export type RateLimitStrategy = "token-bucket" | "sliding-window" | "fixed-window"

/**
 * Rate limit key - can be based on IP, user ID, or custom identifier
 */
export type RateLimitKey = string

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  strategy: RateLimitStrategy
  maxRequests: number
  windowMs: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (context: any) => RateLimitKey
  handler?: (context: any, key: RateLimitKey, remaining: number) => void | Promise<void>
  store?: RateLimitStore
}

/**
 * Rate limit store interface for persisting rate limit data
 */
export interface RateLimitStore {
  /**
   * Get current usage for a key
   */
  get(key: RateLimitKey): Promise<RateLimitData | undefined>

  /**
   * Set/update usage for a key
   */
  set(key: RateLimitKey, data: RateLimitData): Promise<void>

  /**
   * Increment usage for a key
   */
  increment(key: RateLimitKey): Promise<RateLimitData>

  /**
   * Reset usage for a key
   */
  reset(key: RateLimitKey): Promise<void>

  /**
   * Clear all data
   */
  clear(): Promise<void>
}

/**
 * Rate limit data stored per key
 */
export interface RateLimitData {
  count: number
  resetTime: number
  tokens?: number
  lastRefillTime?: number
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  limited: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Token bucket state
 */
export interface TokenBucketState {
  tokens: number
  lastRefillTime: number
  maxTokens: number
  refillRate: number // tokens per second
}

/**
 * Sliding window state
 */
export interface SlidingWindowState {
  timestamps: number[]
  windowSize: number
}
