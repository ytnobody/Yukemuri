/**
 * Cache Plugin for Yukemuri
 * Provides in-memory caching with TTL and automatic invalidation
 */

/**
 * Cache entry stored in memory
 */
export interface CacheEntry<T = any> {
  value: T
  expiresAt: number | null
  createdAt: number
  accessCount: number
  lastAccessedAt: number
}

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  strategy?: CacheStrategy // Eviction strategy when max size is reached
}

/**
 * Cache eviction strategy
 */
export type CacheStrategy = "LRU" | "FIFO" | "LFU"

/**
 * Cache statistics
 */
export interface CacheStats {
  hitCount: number
  missCount: number
  totalEntries: number
  maxEntries: number
  evictedCount: number
  hitRate: number
}

/**
 * Cache store interface
 */
export interface CacheStore {
  /**
   * Get a value from cache
   */
  get<T = any>(key: string): T | undefined

  /**
   * Set a value in cache
   */
  set<T = any>(key: string, value: T, options?: CacheOptions): void

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean

  /**
   * Delete a value from cache
   */
  delete(key: string): boolean

  /**
   * Clear all entries
   */
  clear(): void

  /**
   * Get all keys
   */
  keys(): string[]

  /**
   * Get cache statistics
   */
  stats(): CacheStats

  /**
   * Get cache size
   */
  size(): number
}

/**
 * Cache invalidation event
 */
export interface CacheInvalidationEvent {
  type: "set" | "delete" | "clear" | "evict"
  key?: string
  timestamp: number
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  defaultTtl?: number // Default TTL in milliseconds (default: 60000ms)
  maxSize?: number // Maximum entries (default: 1000)
  strategy?: CacheStrategy // Eviction strategy (default: "LRU")
  enableStats?: boolean // Enable statistics tracking (default: true)
}
