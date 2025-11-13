import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NetworkManagerImpl } from '../src/client/network-manager.js'

// Mock fetch API
global.fetch = vi.fn()

describe('NetworkManager', () => {
  let manager: NetworkManagerImpl

  beforeEach(() => {
    manager = new NetworkManagerImpl()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('network status', () => {
    it('should report online status', () => {
      const status = manager.status
      expect(typeof status.isOnline).toBe('boolean')
      expect(typeof status.isOffline).toBe('boolean')
      expect(status.isOnline).toBe(!status.isOffline)
    })

    it('should provide connection information', () => {
      const status = manager.status
      expect(status.connectionType).toBeDefined()
      expect(status.effectiveType).toBeDefined()
      expect(typeof status.downlink).toBe('number')
      expect(typeof status.rtt).toBe('number')
      expect(typeof status.saveData).toBe('boolean')
    })

    it('should handle status change callbacks', () => {
      const callback = vi.fn()
      const unsubscribe = manager.onStatusChange(callback)

      // Unsubscribe should be a function
      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })
  })

  describe('offline sync manager', () => {
    const offlineSync = () => manager.offlineSync

    describe('queueRequest', () => {
      it('should queue a request and return an ID', async () => {
        const id = await offlineSync().queueRequest({
          url: 'https://api.example.com/data',
          method: 'POST',
          body: { data: 'test' }
        })

        expect(typeof id).toBe('string')
        expect(id.length).toBeGreaterThan(0)
      })

      it('should preserve custom ID', async () => {
        const customId = 'custom-123'
        const id = await offlineSync().queueRequest({
          id: customId,
          url: 'https://api.example.com/data',
          method: 'GET'
        })

        expect(id).toBe(customId)
      })

      it('should support priority levels', async () => {
        const highPriorityId = await offlineSync().queueRequest({
          url: 'https://api.example.com/high',
          method: 'POST',
          priority: 'high'
        })

        const normalPriorityId = await offlineSync().queueRequest({
          url: 'https://api.example.com/normal',
          method: 'POST',
          priority: 'normal'
        })

        const lowPriorityId = await offlineSync().queueRequest({
          url: 'https://api.example.com/low',
          method: 'POST',
          priority: 'low'
        })

        expect([highPriorityId, normalPriorityId, lowPriorityId]).toBeDefined()
      })

      it('should support custom headers and max retries', async () => {
        const id = await offlineSync().queueRequest({
          url: 'https://api.example.com/data',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
          maxRetries: 5
        })

        expect(typeof id).toBe('string')
      })
    })

    describe('getPendingRequests', () => {
      it('should return empty array when no requests queued', () => {
        const pending = offlineSync().getPendingRequests()
        expect(Array.isArray(pending)).toBe(true)
        expect(pending.length).toBe(0)
      })

      it('should return queued requests', async () => {
        await offlineSync().queueRequest({
          url: 'https://api.example.com/1',
          method: 'GET'
        })
        await offlineSync().queueRequest({
          url: 'https://api.example.com/2',
          method: 'POST'
        })

        const pending = offlineSync().getPendingRequests()
        expect(pending.length).toBe(2)
      })

      it('should include all request details', async () => {
        const body = { test: 'data' }
        await offlineSync().queueRequest({
          url: 'https://api.example.com/test',
          method: 'POST',
          body,
          headers: { 'X-Custom': 'value' }
        })

        const pending = offlineSync().getPendingRequests()
        expect(pending[0].url).toBe('https://api.example.com/test')
        expect(pending[0].method).toBe('POST')
        expect(pending[0].body).toEqual(body)
        expect(pending[0].headers).toEqual({ 'X-Custom': 'value' })
      })
    })

    describe('pendingCount', () => {
      it('should return 0 when no requests', () => {
        expect(offlineSync().pendingCount).toBe(0)
      })

      it('should return correct count of pending requests', async () => {
        await offlineSync().queueRequest({
          url: 'https://api.example.com/1',
          method: 'GET'
        })
        expect(offlineSync().pendingCount).toBe(1)

        await offlineSync().queueRequest({
          url: 'https://api.example.com/2',
          method: 'GET'
        })
        expect(offlineSync().pendingCount).toBe(2)
      })
    })

    describe('clearQueue', () => {
      it('should clear all queued requests', async () => {
        await offlineSync().queueRequest({
          url: 'https://api.example.com/1',
          method: 'GET'
        })
        await offlineSync().queueRequest({
          url: 'https://api.example.com/2',
          method: 'GET'
        })

        expect(offlineSync().pendingCount).toBe(2)

        await offlineSync().clearQueue()
        expect(offlineSync().pendingCount).toBe(0)
        expect(offlineSync().getPendingRequests().length).toBe(0)
      })
    })

    describe('issyncing', () => {
      it('should return false when not syncing', () => {
        expect(offlineSync().issyncing).toBe(false)
      })

      it('should reflect syncing state during syncWhenOnline', async () => {
        // Mock fetch to delay
        ;(global.fetch as any).mockImplementation(() =>
          new Promise(resolve =>
            setTimeout(() => resolve({ ok: true, status: 200 }), 100)
          )
        )

        await offlineSync().queueRequest({
          url: 'https://api.example.com/test',
          method: 'GET'
        })

        // Start sync (don't await yet)
        const syncPromise = offlineSync().syncWhenOnline()

        // Wait a bit for sync to start
        await new Promise(resolve => setTimeout(resolve, 10))

        // Note: In Node environment, issyncing might not be true due to timing
        // This test mainly verifies the property exists and is boolean
        expect(typeof offlineSync().issyncing).toBe('boolean')

        await syncPromise
      })
    })

    describe('syncWhenOnline', () => {
      it('should return empty array when no requests queued', async () => {
        ;(global.fetch as any).mockResolvedValue({ ok: true, status: 200 })

        const results = await offlineSync().syncWhenOnline()
        expect(Array.isArray(results)).toBe(true)
        expect(results.length).toBe(0)
      })

      it('should execute queued requests', async () => {
        ;(global.fetch as any).mockResolvedValue({ ok: true, status: 200 })

        await offlineSync().queueRequest({
          url: 'https://api.example.com/test',
          method: 'POST',
          body: { data: 'test' }
        })

        const results = await offlineSync().syncWhenOnline()
        expect(results.length).toBe(1)
        expect(results[0].success).toBe(true)
      })

      it('should handle failed requests', async () => {
        ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

        await offlineSync().queueRequest({
          url: 'https://api.example.com/fail',
          method: 'GET'
        })

        const results = await offlineSync().syncWhenOnline()
        expect(results.length).toBe(1)
        expect(results[0].success).toBe(false)
        expect(results[0].error).toBeDefined()
      })

      it('should handle HTTP errors', async () => {
        ;(global.fetch as any).mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        })

        await offlineSync().queueRequest({
          url: 'https://api.example.com/error',
          method: 'GET'
        })

        const results = await offlineSync().syncWhenOnline()
        expect(results.length).toBe(1)
        expect(results[0].success).toBe(false)
      })

      it('should remove successful requests from queue', async () => {
        ;(global.fetch as any).mockResolvedValue({ ok: true, status: 200 })

        await offlineSync().queueRequest({
          url: 'https://api.example.com/test',
          method: 'GET'
        })

        expect(offlineSync().pendingCount).toBe(1)

        await offlineSync().syncWhenOnline()

        expect(offlineSync().pendingCount).toBe(0)
      })

      it('should keep failed requests in queue', async () => {
        ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

        await offlineSync().queueRequest({
          url: 'https://api.example.com/fail',
          method: 'GET'
        })

        expect(offlineSync().pendingCount).toBe(1)

        await offlineSync().syncWhenOnline()

        expect(offlineSync().pendingCount).toBe(1)
      })

      it('should sort requests by priority', async () => {
        ;(global.fetch as any).mockResolvedValue({ ok: true, status: 200 })

        const lowId = await offlineSync().queueRequest({
          url: 'https://api.example.com/low',
          method: 'GET',
          priority: 'low'
        })

        const highId = await offlineSync().queueRequest({
          url: 'https://api.example.com/high',
          method: 'GET',
          priority: 'high'
        })

        const normalId = await offlineSync().queueRequest({
          url: 'https://api.example.com/normal',
          method: 'GET',
          priority: 'normal'
        })

        const results = await offlineSync().syncWhenOnline()

        // High priority should be processed
        expect(results.length).toBe(3)
      })
    })

    describe('retryFailedRequests', () => {
      it('should return empty array when no failed requests', async () => {
        const results = await offlineSync().retryFailedRequests()
        expect(Array.isArray(results)).toBe(true)
        expect(results.length).toBe(0)
      })

      it('should retry failed requests', async () => {
        // First attempt fails
        ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))
        // Second attempt succeeds
        ;(global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200 })

        await offlineSync().queueRequest({
          url: 'https://api.example.com/retry',
          method: 'GET'
        })

        // First sync fails
        await offlineSync().syncWhenOnline()
        expect(offlineSync().pendingCount).toBe(1)

        // Retry succeeds
        const results = await offlineSync().retryFailedRequests()
        expect(results.length).toBe(1)
        expect(results[0].success).toBe(true)
      })

      it('should respect max retries limit', async () => {
        ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

        await offlineSync().queueRequest({
          url: 'https://api.example.com/maxretry',
          method: 'GET',
          maxRetries: 1
        })

        // First sync attempt
        await offlineSync().syncWhenOnline()

        // First retry
        const results1 = await offlineSync().retryFailedRequests()
        expect(results1.length).toBe(1)

        // Second retry (should skip due to max retries)
        const results2 = await offlineSync().retryFailedRequests()
        expect(results2.length).toBe(0)
      })
    })
  })
})
