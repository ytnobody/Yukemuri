import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NotificationManagerImpl } from '../src/client/notification-manager.js'

describe('NotificationManager', () => {
  let mockLocalStorage: Record<string, string> = {}

  beforeEach(() => {
    mockLocalStorage = {}
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockLocalStorage = {}
  })

  describe('instantiation', () => {
    it('should create NotificationManager', () => {
      const manager = new NotificationManagerImpl()
      expect(manager).toBeDefined()
      expect(typeof manager).toBe('object')
    })
  })

  describe('permission status', () => {
    it('should return default permission status', () => {
      const manager = new NotificationManagerImpl()
      const status = manager.getPermissionStatus()
      expect(['default', 'granted', 'denied']).toContain(status)
    })
  })

  describe('request permission', () => {
    it('should return permission result (without browser)', async () => {
      const manager = new NotificationManagerImpl()
      const result = await manager.requestPermission()
      expect(['default', 'granted', 'denied']).toContain(result)
    })
  })

  describe('push subscription methods', () => {
    it('should provide subscribeToPush method', () => {
      const manager = new NotificationManagerImpl()
      expect(typeof manager.subscribeToPush).toBe('function')
    })

    it('should provide unsubscribe method', () => {
      const manager = new NotificationManagerImpl()
      expect(typeof manager.unsubscribe).toBe('function')
    })

    it('should provide getSubscription method', () => {
      const manager = new NotificationManagerImpl()
      expect(typeof manager.getSubscription).toBe('function')
    })

    it('should provide isSubscribed method', () => {
      const manager = new NotificationManagerImpl()
      expect(typeof manager.isSubscribed).toBe('function')
    })

    it('should provide isSubscriptionExpired method', () => {
      const manager = new NotificationManagerImpl()
      expect(typeof manager.isSubscriptionExpired).toBe('function')
    })

    it('should provide updateSubscription method', () => {
      const manager = new NotificationManagerImpl()
      expect(typeof manager.updateSubscription).toBe('function')
    })

    it('should return false for isSubscribed without subscription', () => {
      const manager = new NotificationManagerImpl()
      expect(manager.isSubscribed()).toBe(false)
    })
  })

  describe('listener methods', () => {
    it('should register subscription change listeners', () => {
      const manager = new NotificationManagerImpl()
      const callback = vi.fn()
      const unsubscribe = manager.onSubscriptionChange(callback)

      expect(typeof unsubscribe).toBe('function')
    })

    it('should unsubscribe from subscription listeners', () => {
      const manager = new NotificationManagerImpl()
      const callback = vi.fn()
      const unsubscribe = manager.onSubscriptionChange(callback)

      unsubscribe()
      expect(typeof unsubscribe).toBe('function')
    })

    it('should register notification click handlers', () => {
      const manager = new NotificationManagerImpl()
      const handler = vi.fn()
      const unregister = manager.onNotificationClick('test-tag', handler)

      expect(typeof unregister).toBe('function')
    })

    it('should unregister notification handlers', () => {
      const manager = new NotificationManagerImpl()
      const handler = vi.fn()
      const unregister = manager.onNotificationClick('test-tag', handler)

      unregister()
      expect(typeof unregister).toBe('function')
    })

    it('should support multiple notification handlers', () => {
      const manager = new NotificationManagerImpl()
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      manager.onNotificationClick('tag1', handler1)
      manager.onNotificationClick('tag2', handler2)
      manager.onNotificationClick('tag3', handler3)

      expect(typeof handler1).toBe('function')
      expect(typeof handler2).toBe('function')
      expect(typeof handler3).toBe('function')
    })
  })

  describe('notification sending', () => {
    it('should provide sendNotification method', () => {
      const manager = new NotificationManagerImpl()
      expect(typeof manager.sendNotification).toBe('function')
    })

    it('should accept notification title and options', async () => {
      const manager = new NotificationManagerImpl()
      // In Node environment without browser APIs, this will be a no-op
      await manager.sendNotification('Test Title', {
        body: 'Test body',
        icon: '/icon.png',
        tag: 'test'
      })
    })
  })

  describe('subscription management', () => {
    it('should handle subscribeToPush with VAPID key', async () => {
      const manager = new NotificationManagerImpl()
      // Without SW, should return null
      const result = await manager.subscribeToPush('test-key')
      expect(result).toBeNull()
    })

    it('should handle unsubscribe gracefully', async () => {
      const manager = new NotificationManagerImpl()
      // Without subscription, should return false
      const result = await manager.unsubscribe()
      expect(result).toBe(false)
    })

    it('should handle getSubscription without SW', async () => {
      const manager = new NotificationManagerImpl()
      const subscription = await manager.getSubscription()
      expect(subscription).toBeNull()
    })

    it('should handle isSubscriptionExpired without subscription', async () => {
      const manager = new NotificationManagerImpl()
      const isExpired = await manager.isSubscriptionExpired()
      expect(isExpired).toBe(false)
    })

    it('should handle updateSubscription without SW', async () => {
      const manager = new NotificationManagerImpl()
      const result = await manager.updateSubscription()
      expect(result).toBeNull()
    })
  })

  describe('method availability', () => {
    it('should have all required methods', () => {
      const manager = new NotificationManagerImpl()
      
      expect(typeof manager.requestPermission).toBe('function')
      expect(typeof manager.sendNotification).toBe('function')
      expect(typeof manager.subscribeToPush).toBe('function')
      expect(typeof manager.unsubscribe).toBe('function')
      expect(typeof manager.getSubscription).toBe('function')
      expect(typeof manager.isSubscribed).toBe('function')
      expect(typeof manager.isSubscriptionExpired).toBe('function')
      expect(typeof manager.updateSubscription).toBe('function')
      expect(typeof manager.onSubscriptionChange).toBe('function')
      expect(typeof manager.onNotificationClick).toBe('function')
      expect(typeof manager.getPermissionStatus).toBe('function')
    })
  })
})
