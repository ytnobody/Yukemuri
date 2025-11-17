import { describe, it, expect } from "node:test"
import { TokenBucketLimiter } from "../src/token-bucket"
import { SlidingWindowLimiter } from "../src/sliding-window"
import { MemoryStore } from "../src/store"
import type { RateLimitConfig } from "../src/types"

describe("Rate Limiting", () => {
  describe("TokenBucketLimiter", () => {
    it("should allow requests within limit", async () => {
      const store = new MemoryStore()
      const config: RateLimitConfig = {
        strategy: "token-bucket",
        maxRequests: 5,
        windowMs: 1000,
      }
      const limiter = new TokenBucketLimiter(config, store)

      const result = await limiter.checkLimit("test-key")

      expect(result.limited).toBe(false)
      expect(result.remaining).toBe(4)
    })

    it("should deny requests exceeding limit", async () => {
      const store = new MemoryStore()
      const config: RateLimitConfig = {
        strategy: "token-bucket",
        maxRequests: 2,
        windowMs: 1000,
      }
      const limiter = new TokenBucketLimiter(config, store)

      // First request
      await limiter.checkLimit("test-key")
      // Second request
      await limiter.checkLimit("test-key")
      // Third request should be denied
      const result = await limiter.checkLimit("test-key")

      expect(result.limited).toBe(true)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it("should reset after window expires", async () => {
      const store = new MemoryStore()
      const config: RateLimitConfig = {
        strategy: "token-bucket",
        maxRequests: 1,
        windowMs: 100,
      }
      const limiter = new TokenBucketLimiter(config, store)

      // First request
      const result1 = await limiter.checkLimit("test-key")
      expect(result1.limited).toBe(false)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Next request should be allowed
      const result2 = await limiter.checkLimit("test-key")
      expect(result2.limited).toBe(false)
    })
  })

  describe("SlidingWindowLimiter", () => {
    it("should allow requests within limit", async () => {
      const store = new MemoryStore()
      const config: RateLimitConfig = {
        strategy: "sliding-window",
        maxRequests: 5,
        windowMs: 1000,
      }
      const limiter = new SlidingWindowLimiter(config, store)

      const result = await limiter.checkLimit("test-key")

      expect(result.limited).toBe(false)
      expect(result.remaining).toBe(4)
    })

    it("should deny requests exceeding limit", async () => {
      const store = new MemoryStore()
      const config: RateLimitConfig = {
        strategy: "sliding-window",
        maxRequests: 2,
        windowMs: 1000,
      }
      const limiter = new SlidingWindowLimiter(config, store)

      // First request
      await limiter.checkLimit("test-key")
      // Second request
      await limiter.checkLimit("test-key")
      // Third request should be denied
      const result = await limiter.checkLimit("test-key")

      expect(result.limited).toBe(true)
      expect(result.remaining).toBe(0)
    })

    it("should get remaining without consuming", async () => {
      const store = new MemoryStore()
      const config: RateLimitConfig = {
        strategy: "sliding-window",
        maxRequests: 5,
        windowMs: 1000,
      }
      const limiter = new SlidingWindowLimiter(config, store)

      await limiter.checkLimit("test-key")
      const remaining = await limiter.getRemaining("test-key")

      expect(remaining).toBe(4)
    })
  })

  describe("MemoryStore", () => {
    it("should store and retrieve data", async () => {
      const store = new MemoryStore()
      const data = {
        count: 5,
        resetTime: Date.now() + 1000,
      }

      await store.set("test-key", data)
      const retrieved = await store.get("test-key")

      expect(retrieved).toEqual(data)
    })

    it("should increment count", async () => {
      const store = new MemoryStore()
      const result1 = await store.increment("test-key")
      const result2 = await store.increment("test-key")

      expect(result1.count).toBe(1)
      expect(result2.count).toBe(2)
    })

    it("should reset expired entries", async () => {
      const store = new MemoryStore()
      const data = {
        count: 5,
        resetTime: Date.now() - 100, // expired
      }

      await store.set("test-key", data)
      const retrieved = await store.get("test-key")

      expect(retrieved).toBeUndefined()
    })

    it("should clear all data", async () => {
      const store = new MemoryStore()

      await store.set("key1", { count: 1, resetTime: Date.now() + 1000 })
      await store.set("key2", { count: 2, resetTime: Date.now() + 1000 })

      await store.clear()

      const retrieved1 = await store.get("key1")
      const retrieved2 = await store.get("key2")

      expect(retrieved1).toBeUndefined()
      expect(retrieved2).toBeUndefined()
    })
  })
})
