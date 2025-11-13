import type { NotificationManager, NotificationOptions } from '../types.js'

interface StoredSubscription {
  endpoint: string
  expirationTime: number | null
  keys: {
    p256dh: string
    auth: string
  }
  subscribedAt: number
}

/**
 * NotificationManager implementation
 * Manages local notifications and push subscriptions for PWAs
 */
export class NotificationManagerImpl implements NotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null
  private currentSubscription: PushSubscription | null = null
  private notificationHandlers = new Map<string, (event: any) => void>()
  private subscriptionListeners = new Set<(subscription: PushSubscription | null) => void>()
  private SUBSCRIPTION_STORAGE_KEY = 'yukemuri_push_subscription'

  constructor() {
    this.init()
  }

  private async init(): Promise<void> {
    if (typeof window === 'undefined') return

    // Get existing Service Worker registration
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.ready
        
        // Load existing subscription
        const subscription = await this.swRegistration.pushManager.getSubscription()
        this.currentSubscription = subscription
        
        // Setup push message handler
        this.setupPushMessageHandler()
        
        // Setup notification click handler
        this.setupNotificationHandler()
        
        console.log('🔔 NotificationManager initialized')
      } catch (error) {
        console.warn('⚠️ Service Worker not available for notifications:', error)
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined') return 'default'

    const NotificationAPI = (window as any).Notification
    if (!NotificationAPI) {
      console.warn('⚠️ This browser does not support notifications')
      return 'denied'
    }

    if (NotificationAPI.permission === 'granted') {
      return 'granted'
    }

    if (NotificationAPI.permission === 'denied') {
      return 'denied'
    }

    // Request permission
    const permission = await NotificationAPI.requestPermission()
    console.log('🔔 Notification permission:', permission)
    
    return permission
  }

  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (typeof window === 'undefined') return

    const permission = await this.requestPermission()
    
    if (permission === 'granted') {
      const notificationOptions: NotificationOptions = {
        body: options?.body,
        icon: options?.icon || '/icons/icon-192x192.png',
        badge: options?.badge || '/icons/icon-72x72.png',
        tag: options?.tag || 'yukemuri-notification',
        data: options?.data,
        ...options
      }

      if (this.swRegistration) {
        // Send through Service Worker
        try {
          await this.swRegistration.showNotification(title, notificationOptions)
        } catch (error) {
          console.error('❌ Failed to show notification:', error)
        }
      } else {
        // Fallback to simple notification
        const NotificationAPI = (window as any).Notification
        if (NotificationAPI) {
          new NotificationAPI(title, notificationOptions)
        }
      }
    } else {
      console.warn('⚠️ Notification permission not granted')
    }
  }

  async subscribeToPush(vapidPublicKey?: string): Promise<PushSubscription | null> {
    if (typeof window === 'undefined') return null

    if (!this.swRegistration) {
      console.error('❌ Service Worker not registered')
      return null
    }

    try {
      // Get VAPID public key
      const key = vapidPublicKey || (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY

      if (!key) {
        console.log('💡 VAPID public key not configured')
        console.log('💡 To enable push notifications:')
        console.log('1. Add VITE_VAPID_PUBLIC_KEY=your_public_key to .env file')
        console.log('2. Generate VAPID key pair: npm run generate-vapid')
        return null
      }

      // Check if already subscribed
      const existingSubscription = await this.swRegistration.pushManager.getSubscription()
      if (existingSubscription) {
        console.log('📬 Already subscribed to push notifications')
        this.currentSubscription = existingSubscription
        return existingSubscription
      }

      // Subscribe to push
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(key) as BufferSource
      })

      this.currentSubscription = subscription
      await this.persistSubscription(subscription)
      this.notifySubscriptionListeners(subscription)

      console.log('📬 Push subscription successful')
      return subscription
    } catch (error) {
      console.error('❌ Push subscription failed:', error)
      return null
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.currentSubscription) {
      console.warn('⚠️ No active subscription to unsubscribe from')
      return false
    }

    try {
      const success = await this.currentSubscription.unsubscribe()
      
      if (success) {
        this.currentSubscription = null
        await this.removeSubscriptionFromStorage()
        this.notifySubscriptionListeners(null)
        console.log('✅ Unsubscribed from push notifications')
      }
      
      return success
    } catch (error) {
      console.error('❌ Unsubscribe failed:', error)
      return false
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      return null
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      if (subscription) {
        this.currentSubscription = subscription
      }
      return subscription
    } catch (error) {
      console.error('❌ Failed to get subscription:', error)
      return null
    }
  }

  isSubscribed(): boolean {
    return this.currentSubscription !== null
  }

  async isSubscriptionExpired(): Promise<boolean> {
    if (!this.currentSubscription) {
      return false
    }

    const expirationTime = this.currentSubscription.expirationTime
    if (expirationTime === null) {
      // No expiration
      return false
    }

    // Check if expired
    const now = Date.now()
    const isExpired = now > expirationTime
    
    if (isExpired) {
      console.warn('⚠️ Push subscription has expired')
      await this.unsubscribe()
    }

    return isExpired
  }

  async updateSubscription(): Promise<PushSubscription | null> {
    try {
      // Unsubscribe from old subscription
      if (this.currentSubscription) {
        await this.unsubscribe()
      }

      // Subscribe to new subscription
      return await this.subscribeToPush()
    } catch (error) {
      console.error('❌ Failed to update subscription:', error)
      return null
    }
  }

  onSubscriptionChange(callback: (subscription: PushSubscription | null) => void): () => void {
    this.subscriptionListeners.add(callback)

    return () => {
      this.subscriptionListeners.delete(callback)
    }
  }

  onNotificationClick(tag: string, handler: (event: any) => void): () => void {
    this.notificationHandlers.set(tag, handler)

    return () => {
      this.notificationHandlers.delete(tag)
    }
  }

  getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined') return 'default'
    
    const NotificationAPI = (window as any).Notification
    return NotificationAPI ? NotificationAPI.permission : 'default'
  }

  private setupPushMessageHandler(): void {
    if (!this.swRegistration) return

    // Handle incoming push messages
    const controller = navigator.serviceWorker.controller
    if (controller && 'onmessage' in controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
          console.log('📨 Push message received:', event.data)
          
          // Show notification
          this.sendNotification(event.data.title, {
            body: event.data.body,
            icon: event.data.icon,
            tag: event.data.tag,
            data: event.data.data
          })
        }
      })
    }
  }

  private setupNotificationHandler(): void {
    if (!this.swRegistration) return

    // Handle notification clicks in service worker
    if ('onnotificationclick' in (self as any)) {
      (self as any).onnotificationclick = (event: any) => {
        console.log('🖱️ Notification clicked:', event.notification.tag)
        
        const handler = this.notificationHandlers.get(event.notification.tag)
        if (handler) {
          handler(event)
        }
        
        event.notification.close()
      }
    }
  }

  private async persistSubscription(subscription: PushSubscription): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const stored: StoredSubscription = {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: {
          p256dh: this.arrayBufferToBase64(
            subscription.getKey('p256dh') || new ArrayBuffer(0)
          ),
          auth: this.arrayBufferToBase64(
            subscription.getKey('auth') || new ArrayBuffer(0)
          )
        },
        subscribedAt: Date.now()
      }

      localStorage.setItem(
        this.SUBSCRIPTION_STORAGE_KEY,
        JSON.stringify(stored)
      )
      
      console.log('💾 Subscription persisted to storage')
    } catch (error) {
      console.warn('⚠️ Failed to persist subscription:', error)
    }
  }

  private async removeSubscriptionFromStorage(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.SUBSCRIPTION_STORAGE_KEY)
      console.log('🗑️ Subscription removed from storage')
    } catch (error) {
      console.warn('⚠️ Failed to remove subscription from storage:', error)
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary')
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return typeof window !== 'undefined'
      ? window.btoa(binary)
      : Buffer.from(binary, 'binary').toString('base64')
  }

  private notifySubscriptionListeners(subscription: PushSubscription | null): void {
    this.subscriptionListeners.forEach(listener => {
      try {
        listener(subscription)
      } catch (error) {
        console.warn('⚠️ Subscription listener error:', error)
      }
    })
  }
}
