/**
 * Cache Plugin for Yukemuri
 * Provides in-memory caching with TTL, eviction strategies, and invalidation
 */

export { CacheManager } from "./cache"
export { MemoryCacheStore } from "./store"

// Re-export types
export type {
  CacheEntry,
  CacheOptions,
  CacheStore,
  CacheStats,
  CacheStrategy,
  CacheConfig,
  CacheInvalidationEvent,
} from "./types"

import type { CacheConfig } from "./types"
import { CacheManager } from "./cache"

/**
 * Create a cache manager instance
 */
export function createCache(config?: CacheConfig): CacheManager {
  return new CacheManager(config)
}

/**
 * Create a cache middleware for Hono
 */
export function createCacheMiddleware(config?: CacheConfig) {
  const cacheManager = new CacheManager(config)

  return async (c: any, next: () => Promise<void>) => {
    // Attach cache manager to context
    c.cache = cacheManager
    await next()
  }
}
