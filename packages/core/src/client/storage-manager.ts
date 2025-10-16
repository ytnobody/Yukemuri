import type { 
  StorageManager, 
  StorageController, 
  PersistentController,
  StorageOptions,
  PersistentOptions
} from '../types.js'

/**
 * StorageManager実装
 * localStorage、sessionStorage、および永続化ストレージを管理
 */
export class StorageManagerImpl implements StorageManager {
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

/**
 * LocalStorage コントローラー
 */
class LocalStorageController<T> implements StorageController<T> {
  private listeners: Set<(value: T) => void> = new Set()
  private currentValue: T

  constructor(
    private key: string,
    private defaultValue: T,
    private options?: StorageOptions<T>
  ) {
    this.currentValue = this.loadValue()
    
    // タブ間同期が有効な場合
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

/**
 * SessionStorage コントローラー
 */
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

/**
 * 永続化ストレージ コントローラー (IndexedDB使用)
 */
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

    // 同期戦略に応じて保存
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