// Yukemuri Client for templates
// This provides a local implementation of Yukemuri client APIs for use in templates

// Type definitions (copied from core types for template usage)
interface PWAStatus {
  hasServiceWorker: boolean
  hasManifest: boolean
  isHTTPS: boolean
  installPromptAvailable: boolean
  isInstalled: boolean
  notificationPermission: NotificationPermission
}

interface PWAManager {
  install: () => Promise<boolean>
  isInstallable: () => boolean
  isInstalled: () => boolean
  getStatus: () => PWAStatus
}

interface NotificationOptions {
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

interface NotificationManager {
  requestPermission: () => Promise<NotificationPermission>
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>
  subscribeToPush: () => Promise<PushSubscription | null>
  getPermissionStatus: () => NotificationPermission
}

interface QRCodeOptions {
  size?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  type?: 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number
}

interface QRCodeManager {
  generate: (value: string, options?: QRCodeOptions) => Promise<string>
  getCurrentURL: (options?: QRCodeOptions) => Promise<string>
  download: (qrDataURL: string, filename?: string) => void
  generateSVG: (value: string, options?: QRCodeOptions) => Promise<string>
}

interface StorageManager {
  local: <T>(key: string, defaultValue: T, options?: StorageOptions<T>) => StorageController<T>
  session: <T>(key: string, defaultValue: T, options?: StorageOptions<T>) => StorageController<T>
  persistent: <T>(key: string, defaultValue: T, options?: PersistentOptions<T>) => PersistentController<T>
}

interface StorageController<T> {
  get: () => T
  set: (value: T | ((prev: T) => T)) => void
  clear: () => void
  subscribe: (callback: (value: T) => void) => () => void
}

interface PersistentController<T> extends StorageController<T> {
  sync: () => Promise<void>
  isSyncing: () => boolean
  lastSynced: () => Date | null
}

interface StorageOptions<T = any> {
  serializer?: {
    stringify: (value: T) => string
    parse: (value: string) => T
  }
  syncAcrossTabs?: boolean
}

interface PersistentOptions<T = any> extends StorageOptions<T> {
  syncStrategy?: 'immediate' | 'batched' | 'manual'
}

// Local implementations for templates (similar to core implementations)
class PWAManagerImpl implements PWAManager {
  private swRegistration: ServiceWorkerRegistration | null = null
  private installPrompt: any = null
  private isInitialized = false

  constructor() {
    this.init()
  }

  private async init() {
    if (this.isInitialized || typeof window === 'undefined') return
    this.isInitialized = true

    console.log('♨️ Initializing Yukemuri PWA (Template)...')
    
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        console.log('✅ Service Worker registered:', this.swRegistration.scope)
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error)
      }
    }

    this.setupInstallPrompt()
  }

  private setupInstallPrompt() {
    if (typeof window === 'undefined') return

    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 PWA install prompt ready')
      e.preventDefault()
      this.installPrompt = e
    })

    window.addEventListener('appinstalled', () => {
      console.log('🎉 PWA installed successfully')
      this.installPrompt = null
    })
  }

  isInstallable(): boolean {
    return !!this.installPrompt
  }

  isInstalled(): boolean {
    if (typeof window === 'undefined') return false
    
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (window.navigator as any).standalone === true
  }

  getStatus(): PWAStatus {
    if (typeof window === 'undefined') {
      return {
        hasServiceWorker: false,
        hasManifest: false,
        isHTTPS: false,
        installPromptAvailable: false,
        isInstalled: false,
        notificationPermission: 'default' as NotificationPermission
      }
    }

    return {
      hasServiceWorker: !!this.swRegistration,
      hasManifest: !!document.querySelector('link[rel="manifest"]'),
      isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost',
      installPromptAvailable: !!this.installPrompt,
      isInstalled: this.isInstalled(),
      notificationPermission: 'Notification' in window ? Notification.permission : 'default' as NotificationPermission
    }
  }

  async install(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn('⚠️ Install prompt not available')
      return false
    }

    try {
      await this.installPrompt.prompt()
      const result = await this.installPrompt.userChoice
      
      console.log('📊 Install prompt result:', result.outcome)
      
      if (result.outcome === 'accepted') {
        console.log('✅ User accepted PWA install')
        return true
      } else {
        console.log('❌ User dismissed PWA install')
        return false
      }
    } catch (error) {
      console.error('❌ Install prompt failed:', error)
      return false
    }
  }
}

class NotificationManagerImpl implements NotificationManager {
  
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
    console.log('📬 Push subscription (template stub)')
    return null
  }

  getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined') return 'default'
    
    return 'Notification' in window ? Notification.permission : 'default'
  }
}

class QRCodeManagerImpl implements QRCodeManager {
  
  async generate(value: string, options?: QRCodeOptions): Promise<string> {
    if (typeof window === 'undefined') return ''

    try {
      // Try to use the existing qrcode library
      const QRCode = await import('qrcode')
      
      const dataURL = await QRCode.toDataURL(value, {
        width: options?.size || 200,
        margin: options?.margin || 2,
        color: {
          dark: options?.color?.dark || '#000000',
          light: options?.color?.light || '#FFFFFF'
        },
        errorCorrectionLevel: options?.errorCorrectionLevel || 'M'
      })
      
      return dataURL
    } catch (error) {
      console.error('❌ QR code generation failed:', error)
      return this.generateFallbackQR(value, options)
    }
  }

  async getCurrentURL(options?: QRCodeOptions): Promise<string> {
    if (typeof window === 'undefined') return ''
    
    return this.generate(window.location.href, options)
  }

  download(qrDataURL: string, filename: string = 'qrcode.png'): void {
    if (typeof window === 'undefined' || !qrDataURL) return

    try {
      const link = document.createElement('a')
      link.download = filename
      link.href = qrDataURL
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('📥 QR code downloaded:', filename)
    } catch (error) {
      console.error('❌ QR code download failed:', error)
    }
  }

  async generateSVG(value: string, options?: QRCodeOptions): Promise<string> {
    console.log('📐 SVG generation (template stub)')
    return this.generateFallbackSVG(value, options)
  }

  private generateFallbackQR(value: string, options?: QRCodeOptions): string {
    const canvas = document.createElement('canvas')
    const size = options?.size || 200
    canvas.width = size
    canvas.height = size
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // 背景色
    ctx.fillStyle = options?.color?.light || '#FFFFFF'
    ctx.fillRect(0, 0, size, size)

    // 境界線
    ctx.strokeStyle = options?.color?.dark || '#000000'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, size - 2, size - 2)

    // 中央にテキストを表示
    ctx.fillStyle = options?.color?.dark || '#000000'
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const shortValue = value.length > 30 ? value.substring(0, 27) + '...' : value
    ctx.fillText(shortValue, size / 2, size / 2 - 10)
    ctx.fillText('(QR Fallback)', size / 2, size / 2 + 10)

    return canvas.toDataURL('image/png')
  }

  private generateFallbackSVG(value: string, options?: QRCodeOptions): string {
    const size = options?.size || 200
    const dark = options?.color?.dark || '#000000'
    const light = options?.color?.light || '#FFFFFF'
    
    return `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${light}" stroke="${dark}" stroke-width="2"/>
        <text x="${size/2}" y="${size/2}" font-family="monospace" font-size="12" 
              text-anchor="middle" dominant-baseline="central" fill="${dark}">
          QR: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}
        </text>
      </svg>
    `.trim()
  }
}

class StorageManagerImpl implements StorageManager {
  private controllers = new Map<string, StorageController<any>>()
  private persistentControllers = new Map<string, PersistentController<any>>()

  local<T>(key: string, defaultValue: T, options?: StorageOptions<T>): StorageController<T> {
    const controllerId = `local:${key}`
    
    if (this.controllers.has(controllerId)) {
      return this.controllers.get(controllerId) as StorageController<T>
    }

    const controller = new LocalStorageController(key, defaultValue, options)
    this.controllers.set(controllerId, controller)
    return controller
  }

  session<T>(key: string, defaultValue: T, options?: StorageOptions<T>): StorageController<T> {
    const controllerId = `session:${key}`
    
    if (this.controllers.has(controllerId)) {
      return this.controllers.get(controllerId) as StorageController<T>
    }

    const controller = new SessionStorageController(key, defaultValue, options)
    this.controllers.set(controllerId, controller)
    return controller
  }

  persistent<T>(key: string, defaultValue: T, options?: PersistentOptions<T>): PersistentController<T> {
    const controllerId = `persistent:${key}`
    
    if (this.persistentControllers.has(controllerId)) {
      return this.persistentControllers.get(controllerId) as PersistentController<T>
    }

    const controller = new PersistentStorageController(key, defaultValue, options)
    this.persistentControllers.set(controllerId, controller)
    return controller
  }
}

class LocalStorageController<T> implements StorageController<T> {
  private listeners: Set<(value: T) => void> = new Set()
  private currentValue: T

  constructor(
    private key: string,
    private defaultValue: T,
    private options?: StorageOptions<T>
  ) {
    this.currentValue = this.loadValue()
    
    if (options?.syncAcrossTabs) {
      this.setupStorageListener()
    }
  }

  get(): T {
    return this.currentValue
  }

  set(value: T | ((prev: T) => T)): void {
    const newValue = typeof value === 'function' 
      ? (value as (prev: T) => T)(this.currentValue)
      : value

    this.currentValue = newValue
    this.saveValue(newValue)
    this.notifyListeners(newValue)
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key)
      this.currentValue = this.defaultValue
      this.notifyListeners(this.defaultValue)
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  subscribe(callback: (value: T) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private loadValue(): T {
    try {
      const stored = localStorage.getItem(this.key)
      if (stored === null) return this.defaultValue

      return this.options?.serializer 
        ? this.options.serializer.parse(stored)
        : JSON.parse(stored)
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
      return this.defaultValue
    }
  }

  private saveValue(value: T): void {
    try {
      const serialized = this.options?.serializer
        ? this.options.serializer.stringify(value)
        : JSON.stringify(value)
      
      localStorage.setItem(this.key, serialized)
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.key && event.newValue !== null) {
        try {
          const newValue = this.options?.serializer
            ? this.options.serializer.parse(event.newValue)
            : JSON.parse(event.newValue)
          
          this.currentValue = newValue
          this.notifyListeners(newValue)
        } catch (error) {
          console.warn('Failed to parse storage event:', error)
        }
      }
    })
  }

  private notifyListeners(value: T): void {
    this.listeners.forEach(listener => {
      try {
        listener(value)
      } catch (error) {
        console.warn('Storage listener error:', error)
      }
    })
  }
}

class SessionStorageController<T> implements StorageController<T> {
  private listeners: Set<(value: T) => void> = new Set()
  private currentValue: T

  constructor(
    private key: string,
    private defaultValue: T,
    private options?: StorageOptions<T>
  ) {
    this.currentValue = this.loadValue()
  }

  get(): T {
    return this.currentValue
  }

  set(value: T | ((prev: T) => T)): void {
    const newValue = typeof value === 'function' 
      ? (value as (prev: T) => T)(this.currentValue)
      : value

    this.currentValue = newValue
    this.saveValue(newValue)
    this.notifyListeners(newValue)
  }

  clear(): void {
    try {
      sessionStorage.removeItem(this.key)
      this.currentValue = this.defaultValue
      this.notifyListeners(this.defaultValue)
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error)
    }
  }

  subscribe(callback: (value: T) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private loadValue(): T {
    try {
      const stored = sessionStorage.getItem(this.key)
      if (stored === null) return this.defaultValue

      return this.options?.serializer 
        ? this.options.serializer.parse(stored)
        : JSON.parse(stored)
    } catch (error) {
      console.warn('Failed to load from sessionStorage:', error)
      return this.defaultValue
    }
  }

  private saveValue(value: T): void {
    try {
      const serialized = this.options?.serializer
        ? this.options.serializer.stringify(value)
        : JSON.stringify(value)
      
      sessionStorage.setItem(this.key, serialized)
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error)
    }
  }

  private notifyListeners(value: T): void {
    this.listeners.forEach(listener => {
      try {
        listener(value)
      } catch (error) {
        console.warn('Storage listener error:', error)
      }
    })
  }
}

class PersistentStorageController<T> implements PersistentController<T> {
  private listeners: Set<(value: T) => void> = new Set()
  private currentValue: T
  private isCurrentlySyncing = false
  private lastSyncTime: Date | null = null
  private dbName = 'yukemuri-persistent'
  private storeName = 'storage'

  constructor(
    private key: string,
    private defaultValue: T,
    private options?: PersistentOptions<T>
  ) {
    this.currentValue = this.defaultValue
    this.init()
  }

  get(): T {
    return this.currentValue
  }

  set(value: T | ((prev: T) => T)): void {
    const newValue = typeof value === 'function' 
      ? (value as (prev: T) => T)(this.currentValue)
      : value

    this.currentValue = newValue
    this.notifyListeners(newValue)

    const strategy = this.options?.syncStrategy || 'immediate'
    if (strategy === 'immediate') {
      this.sync()
    }
  }

  clear(): void {
    this.currentValue = this.defaultValue
    this.notifyListeners(this.defaultValue)
    this.deleteFromDB()
  }

  subscribe(callback: (value: T) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  async sync(): Promise<void> {
    if (this.isCurrentlySyncing) return

    this.isCurrentlySyncing = true
    try {
      await this.saveToDB(this.currentValue)
      this.lastSyncTime = new Date()
    } catch (error) {
      console.warn('Failed to sync to IndexedDB:', error)
    } finally {
      this.isCurrentlySyncing = false
    }
  }

  isSyncing(): boolean {
    return this.isCurrentlySyncing
  }

  lastSynced(): Date | null {
    return this.lastSyncTime
  }

  private async init(): Promise<void> {
    try {
      const value = await this.loadFromDB()
      if (value !== null) {
        this.currentValue = value
        this.lastSyncTime = new Date()
      }
    } catch (error) {
      console.warn('Failed to load from IndexedDB:', error)
    }
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }

  private async loadFromDB(): Promise<T | null> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.get(this.key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const result = request.result
          if (result === undefined) {
            resolve(null)
          } else {
            const value = this.options?.serializer
              ? this.options.serializer.parse(result)
              : result
            resolve(value)
          }
        }
      })
    } catch (error) {
      console.warn('Failed to load from IndexedDB:', error)
      return null
    }
  }

  private async saveToDB(value: T): Promise<void> {
    const db = await this.getDB()
    const transaction = db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)
    
    const serialized = this.options?.serializer
      ? this.options.serializer.stringify(value)
      : value

    return new Promise((resolve, reject) => {
      const request = store.put(serialized, this.key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  private async deleteFromDB(): Promise<void> {
    try {
      const db = await this.getDB()
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.delete(this.key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.warn('Failed to delete from IndexedDB:', error)
    }
  }

  private notifyListeners(value: T): void {
    this.listeners.forEach(listener => {
      try {
        listener(value)
      } catch (error) {
        console.warn('Storage listener error:', error)
      }
    })
  }
}

// Template Yukemuri client
export class Yukemuri {
  public readonly pwa: PWAManager
  public readonly notifications: NotificationManager
  public readonly qr: QRCodeManager
  public readonly storage: StorageManager

  constructor() {
    this.pwa = new PWAManagerImpl()
    this.notifications = new NotificationManagerImpl()
    this.qr = new QRCodeManagerImpl()
    this.storage = new StorageManagerImpl()
  }
}

// Global instance for template usage
export const yu = new Yukemuri()