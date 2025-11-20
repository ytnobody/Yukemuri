import { describe, it } from "node:test"
import assert from "node:assert"
import { MemoryCacheStore } from "../src/store"
import { CacheManager } from "../src/cache"
import type { CacheConfig } from "../src/types"

const expect = (value: any) => ({
  toBe: (expected: any) => assert.strictEqual(value, expected),
  toEqual: (expected: any) => assert.deepStrictEqual(value, expected),
  toBeUndefined: () => assert.strictEqual(value, undefined),
  toBeFalsy: () => assert.strictEqual(!value, true),
  toBeTruthy: () => assert.strictEqual(!!value, true),
  toBeGreaterThan: (num: number) => assert.ok(value > num),
  toContain: (item: any) => assert.ok(Array.isArray(value) && value.includes(item)),
  toBeInstanceOf: (cls: any) => assert.ok(value instanceof cls),
})

describe("Cache Plugin", () => {
  describe("MemoryCacheStore", () => {
    it("should store and retrieve values", () => {
      const store = new MemoryCacheStore()
      store.set("key1", "value1")

      const result = store.get("key1")
      expect(result).toBe("value1")
    })

    it("should return undefined for non-existent keys", () => {
      const store = new MemoryCacheStore()
      const result = store.get("non-existent")

      expect(result).toBeUndefined()
    })

    it("should check if key exists", () => {
      const store = new MemoryCacheStore()
      store.set("key1", "value1")

      expect(store.has("key1")).toBe(true)
      expect(store.has("key2")).toBe(false)
    })

    it("should delete values", () => {
      const store = new MemoryCacheStore()
      store.set("key1", "value1")
      expect(store.has("key1")).toBe(true)

      const deleted = store.delete("key1")
      expect(deleted).toBe(true)
      expect(store.has("key1")).toBe(false)
    })

    it("should return false when deleting non-existent key", () => {
      const store = new MemoryCacheStore()
      const deleted = store.delete("non-existent")
      expect(deleted).toBe(false)
    })

    it("should clear all entries", () => {
      const store = new MemoryCacheStore()
      store.set("key1", "value1")
      store.set("key2", "value2")
      store.set("key3", "value3")

      expect(store.size()).toBe(3)
      store.clear()
      expect(store.size()).toBe(0)
    })

    it("should return all keys", () => {
      const store = new MemoryCacheStore()
      store.set("key1", "value1")
      store.set("key2", "value2")
      store.set("key3", "value3")

      const keys = store.keys()
      expect(keys).toContain("key1")
      expect(keys).toContain("key2")
      expect(keys).toContain("key3")
      expect(keys.length).toBe(3)
    })

    it("should handle TTL expiration", async () => {
      const store = new MemoryCacheStore()
      store.set("key1", "value1", { ttl: 100 })

      expect(store.get("key1")).toBe("value1")

      await new Promise(resolve => setTimeout(resolve, 150))

      expect(store.get("key1")).toBeUndefined()
    })

    it("should track access count", () => {
      const store = new MemoryCacheStore()
      store.set("key1", "value1")

      store.get("key1")
      store.get("key1")

      const stats = store.stats()
      expect(stats.hitCount).toBe(2)
    })

    it("should track miss count", () => {
      const store = new MemoryCacheStore()
      store.get("non-existent")
      store.get("non-existent")

      const stats = store.stats()
      expect(stats.missCount).toBe(2)
    })

    it("should calculate hit rate", () => {
      const store = new MemoryCacheStore()
      store.set("key1", "value1")

      store.get("key1") // hit
      store.get("key1") // hit
      store.get("non-existent") // miss

      const stats = store.stats()
      expect(stats.hitRate).toBe(2 / 3)
    })

    it("should evict entries using LRU strategy", async () => {
      const store = new MemoryCacheStore(2, "LRU")
      store.set("key1", "value1")
      await new Promise(r => setTimeout(r, 1))
      store.set("key2", "value2")
      await new Promise(r => setTimeout(r, 1))

      store.get("key1") // Access key1 to update lastAccessedAt
      await new Promise(r => setTimeout(r, 1))

      store.set("key3", "value3") // Should evict key2 (least recently used)

      expect(store.has("key1")).toBe(true)
      expect(store.has("key2")).toBe(false)
      expect(store.has("key3")).toBe(true)
    })

    it("should evict entries using FIFO strategy", () => {
      const store = new MemoryCacheStore(2, "FIFO")
      store.set("key1", "value1")
      store.set("key2", "value2")

      store.set("key3", "value3") // Should evict key1 (first in)

      expect(store.has("key1")).toBe(false)
      expect(store.has("key2")).toBe(true)
      expect(store.has("key3")).toBe(true)
    })

    it("should evict entries using LFU strategy", () => {
      const store = new MemoryCacheStore(2, "LFU")
      store.set("key1", "value1")
      store.set("key2", "value2")

      store.get("key1") // Increase access count for key1

      store.set("key3", "value3") // Should evict key2 (least frequently used)

      expect(store.has("key1")).toBe(true)
      expect(store.has("key2")).toBe(false)
      expect(store.has("key3")).toBe(true)
    })

    it("should report statistics", () => {
      const store = new MemoryCacheStore()
      store.set("key1", "value1")
      store.set("key2", "value2")

      const stats = store.stats()
      expect(stats.totalEntries).toBe(2)
      expect(stats.maxEntries).toBe(1000)
    })

    it("should support different data types", () => {
      const store = new MemoryCacheStore()

      store.set("string", "value")
      store.set("number", 42)
      store.set("boolean", true)
      store.set("object", { nested: "data" })
      store.set("array", [1, 2, 3])

      expect(store.get("string")).toBe("value")
      expect(store.get("number")).toBe(42)
      expect(store.get("boolean")).toBe(true)
      expect(store.get("object")).toEqual({ nested: "data" })
      expect(store.get("array")).toEqual([1, 2, 3])
    })

    it("should not track stats when disabled", () => {
      const store = new MemoryCacheStore(1000, "LRU", false)
      store.set("key1", "value1")
      store.get("key1")

      const stats = store.stats()
      expect(stats.hitCount).toBe(0)
      expect(stats.missCount).toBe(0)
    })
  })

  describe("CacheManager", () => {
    it("should use default config", () => {
      const manager = new CacheManager()
      const config = manager.getConfig()

      expect(config.defaultTtl).toBe(60000)
      expect(config.maxSize).toBe(1000)
      expect(config.strategy).toBe("LRU")
      expect(config.enableStats).toBe(true)
    })

    it("should apply custom config", () => {
      const customConfig: CacheConfig = {
        defaultTtl: 5000,
        maxSize: 500,
        strategy: "FIFO",
        enableStats: false,
      }
      const manager = new CacheManager(customConfig)
      const config = manager.getConfig()

      expect(config.defaultTtl).toBe(5000)
      expect(config.maxSize).toBe(500)
      expect(config.strategy).toBe("FIFO")
      expect(config.enableStats).toBe(false)
    })

    it("should set value with default TTL", async () => {
      const manager = new CacheManager({ defaultTtl: 100 })
      manager.set("key1", "value1")

      expect(manager.get("key1")).toBe("value1")

      await new Promise(resolve => setTimeout(resolve, 150))

      expect(manager.get("key1")).toBeUndefined()
    })

    it("should set value with custom TTL", async () => {
      const manager = new CacheManager({ defaultTtl: 10000 })
      manager.set("key1", "value1", { ttl: 100 })

      expect(manager.get("key1")).toBe("value1")

      await new Promise(resolve => setTimeout(resolve, 150))

      expect(manager.get("key1")).toBeUndefined()
    })

    it("should notify on invalidation for set", async () => {
      const manager = new CacheManager()
      let eventReceived = false

      manager.onInvalidation(event => {
        if (event.type === "set" && event.key === "key1") {
          eventReceived = true
        }
      })

      manager.set("key1", "value1")

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(eventReceived).toBe(true)
    })

    it("should notify on invalidation for delete", async () => {
      const manager = new CacheManager()
      manager.set("key1", "value1")
      let eventReceived = false

      manager.onInvalidation(event => {
        if (event.type === "delete" && event.key === "key1") {
          eventReceived = true
        }
      })

      manager.delete("key1")

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(eventReceived).toBe(true)
    })

    it("should notify on invalidation for clear", async () => {
      const manager = new CacheManager()
      manager.set("key1", "value1")
      let eventReceived = false

      manager.onInvalidation(event => {
        if (event.type === "clear") {
          eventReceived = true
        }
      })

      manager.clear()

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(eventReceived).toBe(true)
    })

    it("should allow unsubscribing from invalidation", async () => {
      const manager = new CacheManager()
      let eventCount = 0

      const unsubscribe = manager.onInvalidation(() => {
        eventCount++
      })

      manager.set("key1", "value1")

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(eventCount).toBe(1)

      unsubscribe()
      manager.set("key2", "value2")

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(eventCount).toBe(1) // Should not increase
    })

    it("should implement getOrSet for sync functions", () => {
      const manager = new CacheManager()
      let callCount = 0

      const value1 = manager.getOrSet("key1", () => {
        callCount++
        return "value1"
      })

      expect(value1).toBe("value1")
      expect(callCount).toBe(1)

      const value2 = manager.getOrSet("key1", () => {
        callCount++
        return "value1"
      })

      expect(value2).toBe("value1")
      expect(callCount).toBe(1) // Should not call the function again
    })

    it("should implement getOrSet for async functions", async () => {
      const manager = new CacheManager()
      let callCount = 0

      const promise1 = manager.getOrSet("key1", async () => {
        callCount++
        await new Promise(resolve => setTimeout(resolve, 10))
        return "value1"
      })

      const value1 = await promise1
      expect(value1).toBe("value1")
      expect(callCount).toBe(1)

      const value2 = manager.getOrSet("key1", async () => {
        callCount++
        return "value1"
      })

      if (value2 instanceof Promise) {
        const result = await value2
        expect(result).toBe("value1")
      } else {
        expect(value2).toBe("value1")
      }
      expect(callCount).toBe(1) // Should not call the function again
    })

    it("should invalidate by pattern with string", () => {
      const manager = new CacheManager()
      manager.set("user:1", { id: 1, name: "Alice" })
      manager.set("user:2", { id: 2, name: "Bob" })
      manager.set("post:1", { id: 1, title: "Post 1" })

      const count = manager.invalidatePattern("user:.*")

      expect(count).toBe(2)
      expect(manager.has("user:1")).toBe(false)
      expect(manager.has("user:2")).toBe(false)
      expect(manager.has("post:1")).toBe(true)
    })

    it("should invalidate by pattern with regex", () => {
      const manager = new CacheManager()
      manager.set("user:1", { id: 1, name: "Alice" })
      manager.set("user:2", { id: 2, name: "Bob" })
      manager.set("post:1", { id: 1, title: "Post 1" })

      const count = manager.invalidatePattern(/^user:/)

      expect(count).toBe(2)
      expect(manager.has("user:1")).toBe(false)
      expect(manager.has("user:2")).toBe(false)
      expect(manager.has("post:1")).toBe(true)
    })

    it("should update config", () => {
      const manager = new CacheManager({ defaultTtl: 1000 })
      expect(manager.getConfig().defaultTtl).toBe(1000)

      manager.setConfig({ defaultTtl: 5000 })
      expect(manager.getConfig().defaultTtl).toBe(5000)
    })
  })
})
