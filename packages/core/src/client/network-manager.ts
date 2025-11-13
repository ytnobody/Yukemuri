import type { NetworkManager, NetworkStatus, OfflineSyncManager, QueuedRequest, SyncResult } from '../types.js'

export class NetworkManagerImpl implements NetworkManager {
  private offlineSyncManager: OfflineSyncManagerImpl
  
  constructor() {
    this.offlineSyncManager = new OfflineSyncManagerImpl()
  }
  
  get status(): NetworkStatus {
    if (typeof window === 'undefined') {
      return {
        isOnline: true,
        isOffline: false,
        connectionType: 'unknown',
        effectiveType: '4g',
        downlink: 0,
        rtt: 0,
        saveData: false
      }
    }

    const connection = (navigator as any).connection || (navigator as any).mozConnection
    
    return {
      isOnline: navigator.onLine,
      isOffline: !navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink ?? 0,
      rtt: connection?.rtt ?? 0,
      saveData: connection?.saveData ?? false
    }
  }

  get offlineSync(): OfflineSyncManager {
    return this.offlineSyncManager
  }

  onStatusChange(callback: (status: NetworkStatus) => void): () => void {
    if (typeof window === 'undefined') {
      return () => {}
    }

    const handleOnline = () => callback(this.status)
    const handleOffline = () => callback(this.status)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }
}

/**
 * Offline sync manager implementation
 * Manages queuing and syncing of requests when offline
 */
class OfflineSyncManagerImpl implements OfflineSyncManager {
  private queue: Map<string, QueuedRequest> = new Map()
  private failedRequests: Map<string, { request: QueuedRequest; error: Error; retries: number }> = new Map()
  private isCurrentlySyncing = false
  private syncOnlineListener: (() => void) | null = null

  constructor() {
    this.setupOnlineListener()
  }

  async queueRequest(request: QueuedRequest): Promise<string> {
    const id = request.id || this.generateId()
    const queuedRequest: QueuedRequest = {
      ...request,
      id,
      priority: request.priority || 'normal',
      maxRetries: request.maxRetries ?? 3
    }

    this.queue.set(id, queuedRequest)
    console.log(`📋 Request queued: ${id} (${request.method} ${request.url})`)

    return id
  }

  async syncWhenOnline(): Promise<SyncResult[]> {
    if (this.isCurrentlySyncing) {
      console.warn('⚠️ Sync already in progress')
      return []
    }

    if (typeof window !== 'undefined' && !navigator.onLine) {
      console.log('📡 Still offline, cannot sync')
      return []
    }

    this.isCurrentlySyncing = true
    const results: SyncResult[] = []

    try {
      // Sort by priority: high -> normal -> low
      const sortedRequests = Array.from(this.queue.values()).sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 }
        return (priorityOrder[b.priority || 'normal'] ?? 2) - (priorityOrder[a.priority || 'normal'] ?? 2)
      })

      console.log(`🔄 Starting sync of ${sortedRequests.length} requests`)

      for (const request of sortedRequests) {
        try {
          const result = await this.executeRequest(request)
          results.push(result)

          if (result.success) {
            this.queue.delete(request.id!)
            this.failedRequests.delete(request.id!)
            console.log(`✅ Synced: ${request.id}`)
          } else {
            // Keep failed request in queue
            this.failedRequests.set(request.id!, {
              request,
              error: result.error || new Error('Unknown error'),
              retries: 0
            })
            console.warn(`❌ Sync failed: ${request.id}`)
          }
        } catch (error) {
          const syncError = error instanceof Error ? error : new Error(String(error))
          results.push({
            id: request.id!,
            success: false,
            error: syncError
          })
          this.failedRequests.set(request.id!, {
            request,
            error: syncError,
            retries: 0
          })
        }
      }

      console.log(`📊 Sync complete: ${results.filter(r => r.success).length}/${results.length} succeeded`)
    } finally {
      this.isCurrentlySyncing = false
    }

    return results
  }

  getPendingRequests(): QueuedRequest[] {
    return Array.from(this.queue.values())
  }

  async clearQueue(): Promise<void> {
    this.queue.clear()
    this.failedRequests.clear()
    console.log('🗑️ Queue cleared')
  }

  async retryFailedRequests(): Promise<SyncResult[]> {
    const results: SyncResult[] = []

    for (const [id, failedItem] of this.failedRequests.entries()) {
      const { request, retries, error } = failedItem

      // Skip if max retries exceeded
      if (retries >= (request.maxRetries ?? 3)) {
        console.warn(`⚠️ Max retries exceeded for ${id}, skipping`)
        continue
      }

      try {
        console.log(`🔁 Retrying request: ${id} (attempt ${retries + 1}/${request.maxRetries ?? 3})`)
        const result = await this.executeRequest(request)
        results.push(result)

        if (result.success) {
          this.queue.delete(id)
          this.failedRequests.delete(id)
          console.log(`✅ Retry succeeded: ${id}`)
        } else {
          // Increment retry count
          failedItem.retries++
          console.warn(`❌ Retry failed: ${id}`)
        }
      } catch (retryError) {
        const error = retryError instanceof Error ? retryError : new Error(String(retryError))
        results.push({
          id,
          success: false,
          error
        })
        failedItem.retries++
      }
    }

    return results
  }

  get issyncing(): boolean {
    return this.isCurrentlySyncing
  }

  get pendingCount(): number {
    return this.queue.size
  }

  private async executeRequest(request: QueuedRequest): Promise<SyncResult> {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? JSON.stringify(request.body) : undefined
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return {
        id: request.id!,
        success: true,
        response
      }
    } catch (error) {
      return {
        id: request.id!,
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  private setupOnlineListener(): void {
    if (typeof window === 'undefined') {
      return
    }

    this.syncOnlineListener = async () => {
      console.log('📡 Back online, syncing queued requests...')
      // Small delay to ensure connection is stable
      await new Promise(resolve => setTimeout(resolve, 100))
      await this.syncWhenOnline()
    }

    window.addEventListener('online', this.syncOnlineListener)
  }

  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  destroy(): void {
    if (typeof window !== 'undefined' && this.syncOnlineListener) {
      window.removeEventListener('online', this.syncOnlineListener)
    }
  }
}
