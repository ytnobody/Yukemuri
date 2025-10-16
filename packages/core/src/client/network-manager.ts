import type { NetworkManager, NetworkStatus, OfflineSyncManager } from '../types.js'

export class NetworkManagerImpl implements NetworkManager {
  
  get status(): NetworkStatus {
    // Network status implementation - stub for now
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

    return {
      isOnline: navigator.onLine,
      isOffline: !navigator.onLine,
      connectionType: 'unknown',
      effectiveType: '4g',
      downlink: 0,
      rtt: 0,
      saveData: false
    }
  }

  get offlineSync(): OfflineSyncManager {
    // Offline sync implementation - stub for now
    return {
      queueRequest: async () => '',
      syncWhenOnline: async () => [],
      getPendingRequests: () => [],
      clearQueue: async () => {},
      retryFailedRequests: async () => [],
      issyncing: false,
      pendingCount: 0
    }
  }

  onStatusChange(callback: (status: NetworkStatus) => void): () => void {
    // Network status change listener - stub for now
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