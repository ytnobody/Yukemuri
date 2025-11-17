import type { RateLimitStore, RateLimitData, RateLimitKey } from "./types"

/**
 * In-memory rate limit store
 * Stores rate limit data in memory for a single instance
 * Note: For production with multiple instances, use a distributed store
 */
export class MemoryStore implements RateLimitStore {
  private data: Map<RateLimitKey, RateLimitData> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(cleanupIntervalMs: number = 60000) {
    // Periodically clean up expired entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)
  }

  async get(key: RateLimitKey): Promise<RateLimitData | undefined> {
    const data = this.data.get(key)
    if (data && data.resetTime < Date.now()) {
      this.data.delete(key)
      return undefined
    }
    return data
  }

  async set(key: RateLimitKey, data: RateLimitData): Promise<void> {
    this.data.set(key, data)
  }

  async increment(key: RateLimitKey): Promise<RateLimitData> {
    const now = Date.now()
    let data = this.data.get(key)

    if (!data || data.resetTime < now) {
      data = {
        count: 1,
        resetTime: now + 3600000, // 1 hour default
        tokens: 1,
        lastRefillTime: now,
      }
    } else {
      data.count++
    }

    this.data.set(key, data)
    return data
  }

  async reset(key: RateLimitKey): Promise<void> {
    this.data.delete(key)
  }

  async clear(): Promise<void> {
    this.data.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.data.entries()) {
      if (data.resetTime < now) {
        this.data.delete(key)
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.data.clear()
  }
}
