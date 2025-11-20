import type {
  CacheConfig,
  CacheOptions,
  CacheStore,
  CacheStats,
  CacheInvalidationEvent,
} from "./types"
import { MemoryCacheStore } from "./store"

/**
 * Cache manager for managing cached data with TTL and invalidation
 */
export class CacheManager implements CacheStore {
  private store: CacheStore
  private config: Required<CacheConfig>
  private invalidationListeners: Set<(event: CacheInvalidationEvent) => void> = new Set()

  constructor(config?: CacheConfig, store?: CacheStore) {
    this.config = {
      defaultTtl: config?.defaultTtl ?? 60000,
      maxSize: config?.maxSize ?? 1000,
      strategy: config?.strategy ?? "LRU",
      enableStats: config?.enableStats ?? true,
    }

    this.store =
      store ||
      new MemoryCacheStore(this.config.maxSize, this.config.strategy, this.config.enableStats)
  }

  /**
   * Get value from cache
   */
  get<T = any>(key: string): T | undefined {
    return this.store.get<T>(key)
  }

  /**
   * Set value in cache
   */
  set<T = any>(key: string, value: T, options?: CacheOptions): void {
    const mergedOptions: CacheOptions = {
      ttl: options?.ttl ?? this.config.defaultTtl,
      maxSize: options?.maxSize ?? this.config.maxSize,
      strategy: options?.strategy ?? this.config.strategy,
    }

    this.store.set(key, value, mergedOptions)
    this.notifyInvalidation({ type: "set", key, timestamp: Date.now() })
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.store.has(key)
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const result = this.store.delete(key)
    if (result) {
      this.notifyInvalidation({ type: "delete", key, timestamp: Date.now() })
    }
    return result
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear()
    this.notifyInvalidation({ type: "clear", timestamp: Date.now() })
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return this.store.keys()
  }

  /**
   * Get cache statistics
   */
  stats(): CacheStats {
    return this.store.stats()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size()
  }

  /**
   * Get or set value if not in cache
   */
  getOrSet<T = any>(key: string, fn: () => T | Promise<T>, options?: CacheOptions): T | Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== undefined) {
      return cached
    }

    const result = fn()
    if (result instanceof Promise) {
      return result.then(value => {
        this.set(key, value, options)
        return value
      })
    } else {
      this.set(key, result, options)
      return result
    }
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern)
    const keys = this.store.keys()
    let count = 0

    for (const key of keys) {
      if (regex.test(key)) {
        this.delete(key)
        count++
      }
    }

    return count
  }

  /**
   * Listen for invalidation events
   */
  onInvalidation(listener: (event: CacheInvalidationEvent) => void): () => void {
    this.invalidationListeners.add(listener)

    // Return unsubscribe function
    return () => {
      this.invalidationListeners.delete(listener)
    }
  }

  /**
   * Get configuration
   */
  getConfig(): Required<CacheConfig> {
    return this.config
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<CacheConfig>): void {
    if (config.defaultTtl !== undefined) {
      this.config.defaultTtl = config.defaultTtl
    }
    if (config.enableStats !== undefined) {
      this.config.enableStats = config.enableStats
    }
  }

  /**
   * Notify listeners of invalidation
   */
  private notifyInvalidation(event: CacheInvalidationEvent): void {
    for (const listener of this.invalidationListeners) {
      listener(event)
    }
  }
}
