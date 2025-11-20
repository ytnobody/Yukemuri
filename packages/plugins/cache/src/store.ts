import type { CacheEntry, CacheOptions, CacheStore, CacheStats, CacheStrategy } from "./types"

/**
 * In-memory cache store with TTL and eviction strategies
 */
export class MemoryCacheStore implements CacheStore {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly maxSize: number
  private readonly strategy: CacheStrategy
  private readonly enableStats: boolean

  private statsData = {
    hitCount: 0,
    missCount: 0,
    evictedCount: 0,
  }

  constructor(
    maxSize: number = 1000,
    strategy: CacheStrategy = "LRU",
    enableStats: boolean = true
  ) {
    this.maxSize = maxSize
    this.strategy = strategy
    this.enableStats = enableStats
  }

  get<T = any>(key: string): T | undefined {
    this.cleanExpired()

    const entry = this.cache.get(key)
    if (!entry) {
      if (this.enableStats) {
        this.statsData.missCount++
      }
      return undefined
    }

    // Check if expired
    if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      if (this.enableStats) {
        this.statsData.missCount++
      }
      return undefined
    }

    // Update access info
    entry.accessCount++
    entry.lastAccessedAt = Date.now()

    if (this.enableStats) {
      this.statsData.hitCount++
    }

    return entry.value as T
  }

  set<T = any>(key: string, value: T, options?: CacheOptions): void {
    this.cleanExpired()

    const now = Date.now()
    const ttl = options?.ttl
    const expiresAt = ttl !== undefined ? now + ttl : null

    const entry: CacheEntry = {
      value,
      expiresAt,
      createdAt: now,
      accessCount: 1,
      lastAccessedAt: now,
    }

    this.cache.set(key, entry)

    // Check if we exceeded max size
    if (this.cache.size > this.maxSize) {
      this.evict()
    }
  }

  has(key: string): boolean {
    this.cleanExpired()
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  keys(): string[] {
    this.cleanExpired()
    return Array.from(this.cache.keys())
  }

  size(): number {
    this.cleanExpired()
    return this.cache.size
  }

  stats(): CacheStats {
    return {
      hitCount: this.statsData.hitCount,
      missCount: this.statsData.missCount,
      totalEntries: this.cache.size,
      maxEntries: this.maxSize,
      evictedCount: this.statsData.evictedCount,
      hitRate: this.getHitRate(),
    }
  }

  /**
   * Clean expired entries
   */
  private cleanExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt !== null && entry.expiresAt < now) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Evict entries based on strategy
   */
  private evict(): void {
    if (this.cache.size <= this.maxSize) return

    const keysToRemove = 1

    if (this.strategy === "LRU") {
      this.evictLRU(keysToRemove)
    } else if (this.strategy === "LFU") {
      this.evictLFU(keysToRemove)
    } else if (this.strategy === "FIFO") {
      this.evictFIFO(keysToRemove)
    }

    if (this.enableStats) {
      this.statsData.evictedCount += keysToRemove
    }
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(count: number): void {
    let removed = 0
    const entries = Array.from(this.cache.entries()).sort(([, a], [, b]) => {
      // Primary: last accessed time
      if (a.lastAccessedAt !== b.lastAccessedAt) {
        return a.lastAccessedAt - b.lastAccessedAt
      }
      // Tie-breaker: creation time
      return a.createdAt - b.createdAt
    })

    for (const [key] of entries) {
      if (removed >= count) break
      this.cache.delete(key)
      removed++
    }
  }

  /**
   * Evict least frequently used entries
   */
  private evictLFU(count: number): void {
    let removed = 0
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.accessCount - b.accessCount
    )

    for (const [key] of entries) {
      if (removed >= count) break
      this.cache.delete(key)
      removed++
    }
  }

  /**
   * Evict first in first out entries
   */
  private evictFIFO(count: number): void {
    let removed = 0
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.createdAt - b.createdAt
    )

    for (const [key] of entries) {
      if (removed >= count) break
      this.cache.delete(key)
      removed++
    }
  }

  /**
   * Calculate hit rate
   */
  private getHitRate(): number {
    const total = this.statsData.hitCount + this.statsData.missCount
    if (total === 0) return 0
    return this.statsData.hitCount / total
  }
}
