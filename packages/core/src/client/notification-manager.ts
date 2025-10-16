import type { NotificationManager, NotificationOptions } from '../types.js'

export class NotificationManagerImpl implements NotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null

  constructor() {
    this.init()
  }

  private async init() {
    if (typeof window === 'undefined') return

    // Get existing Service Worker registration
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.ready
      } catch (error) {
        console.warn('⚠️ Service Worker not available for notifications')
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined') return 'default'

    if (!('Notification' in window)) {
      console.warn('⚠️ This browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    // Request permission
    const permission = await Notification.requestPermission()
    console.log('🔔 Notification permission:', permission)
    
    return permission
  }

  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (typeof window === 'undefined') return

    const permission = await this.requestPermission()
    
    if (permission === 'granted') {
      new Notification(title, {
        body: options?.body,
        icon: options?.icon || '/icons/icon-192x192.png',
        badge: options?.badge || '/icons/icon-72x72.png',
        tag: options?.tag || 'yukemuri-notification',
        data: options?.data
      })
    } else {
      console.warn('⚠️ Notification permission not granted')
    }
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (typeof window === 'undefined') return null

    if (!this.swRegistration) {
      console.error('❌ Service Worker not registered')
      return null
    }

    try {
      // Get VAPID public key from environment variables
      const vapidPublicKey = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        console.log('💡 VAPID public key not configured')
        console.log('💡 To enable push notifications:')
        console.log('1. Add VITE_VAPID_PUBLIC_KEY=your_public_key to .env file')
        console.log('2. Generate VAPID key pair: npm run generate-vapid')
        return null
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      })

      console.log('📬 Push subscription successful:', subscription)
      return subscription
    } catch (error) {
      console.error('❌ Push subscription failed:', error)
      return null
    }
  }

  getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined') return 'default'
    
    return 'Notification' in window ? Notification.permission : 'default'
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}