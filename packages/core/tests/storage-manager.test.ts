import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StorageManagerImpl } from '../src/client/storage-manager.js'

// Mock IndexedDB for testing
const mockIndexedDB = {
  open: vi.fn(),
  databases: vi.fn(),
}

// Setup localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      return Object.keys(store)[index] || null
    },
  }
})()

// Setup sessionStorage mock
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      return Object.keys(store)[index] || null
    },
  }
})()

describe('StorageManager', () => {
  let manager: StorageManagerImpl

  beforeEach(() => {
    manager = new StorageManagerImpl()
    localStorageMock.clear()
    sessionStorageMock.clear()
    
    // Mock browser storage APIs
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    Object.defineProperty(global, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('local storage', () => {
    it('should get and set local storage values', () => {
      const controller = manager.local('test-key', 'default')
      
      expect(controller.get()).toBe('default')
      
      controller.set('new-value')
      expect(controller.get()).toBe('new-value')
    })

    it('should support function-based set for local storage', () => {
      const controller = manager.local('counter', 0)
      
      controller.set(prev => prev + 1)
      expect(controller.get()).toBe(1)
      
      controller.set(prev => prev + 1)
      expect(controller.get()).toBe(2)
    })

    it('should clear local storage', () => {
      const controller = manager.local('test-key', 'default')
      
      controller.set('value')
      expect(controller.get()).toBe('value')
      
      controller.clear()
      expect(controller.get()).toBe('default')
    })

    it('should subscribe to local storage changes', () => {
      const controller = manager.local('test-key', 'initial')
      const listener = vi.fn()
      
      const unsubscribe = controller.subscribe(listener)
      
      controller.set('new-value')
      expect(listener).toHaveBeenCalledWith('new-value')
      
      controller.set('another-value')
      expect(listener).toHaveBeenCalledTimes(2)
      
      unsubscribe()
      controller.set('final-value')
      expect(listener).toHaveBeenCalledTimes(2) // No additional calls
    })

    it('should handle objects in local storage', () => {
      const controller = manager.local('user', { name: '', age: 0 })
      
      const userData = { name: 'John', age: 30 }
      controller.set(userData)
      expect(controller.get()).toEqual(userData)
    })

    it('should return same controller instance for same key', () => {
      const controller1 = manager.local('same-key', 'default')
      const controller2 = manager.local('same-key', 'default')
      
      expect(controller1).toBe(controller2)
    })

    it('should support custom serializers', () => {
      const customSerializer = {
        stringify: (value: any) => `custom:${JSON.stringify(value)}`,
        parse: (value: string) => JSON.parse(value.replace('custom:', '')),
      }
      
      const controller = manager.local('custom', { value: 42 }, { serializer: customSerializer })
      controller.set({ value: 42 })
      expect(controller.get()).toEqual({ value: 42 })
    })
  })

  describe('session storage', () => {
    it('should get and set session storage values', () => {
      const controller = manager.session('test-key', 'default')
      
      expect(controller.get()).toBe('default')
      
      controller.set('new-value')
      expect(controller.get()).toBe('new-value')
    })

    it('should support function-based set for session storage', () => {
      const controller = manager.session('list', [] as string[])
      
      controller.set(prev => [...prev, 'item1'])
      expect(controller.get()).toEqual(['item1'])
      
      controller.set(prev => [...prev, 'item2'])
      expect(controller.get()).toEqual(['item1', 'item2'])
    })

    it('should clear session storage', () => {
      const controller = manager.session('test-key', 'default')
      
      controller.set('value')
      expect(controller.get()).toBe('value')
      
      controller.clear()
      expect(controller.get()).toBe('default')
    })

    it('should subscribe to session storage changes', () => {
      const controller = manager.session('test-key', 'initial')
      const listener = vi.fn()
      
      const unsubscribe = controller.subscribe(listener)
      
      controller.set('new-value')
      expect(listener).toHaveBeenCalledWith('new-value')
      
      unsubscribe()
      controller.set('final-value')
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should return same controller instance for same key', () => {
      const controller1 = manager.session('same-key', 'default')
      const controller2 = manager.session('same-key', 'default')
      
      expect(controller1).toBe(controller2)
    })
  })

  describe('persistent storage', () => {
    it('should get and set persistent storage values', async () => {
      const controller = manager.persistent('test-key', 'default')
      
      expect(controller.get()).toBe('default')
      
      controller.set('new-value')
      expect(controller.get()).toBe('new-value')
    })

    it('should support function-based set for persistent storage', async () => {
      const controller = manager.persistent('counter', 0)
      
      controller.set(prev => prev + 1)
      expect(controller.get()).toBe(1)
    })

    it('should have isSyncing method', () => {
      const controller = manager.persistent('test-key', 'default')
      
      expect(typeof controller.isSyncing).toBe('function')
      expect(controller.isSyncing()).toBe(false)
    })

    it('should have lastSynced method', () => {
      const controller = manager.persistent('test-key', 'default')
      
      expect(typeof controller.lastSynced).toBe('function')
      expect(controller.lastSynced()).toBeNull()
    })

    it('should have sync method', async () => {
      const controller = manager.persistent('test-key', 'default')
      
      expect(typeof controller.sync).toBe('function')
      
      controller.set('value')
      // Note: Actual sync would require IndexedDB to be available
    })

    it('should subscribe to persistent storage changes', () => {
      const controller = manager.persistent('test-key', 'initial')
      const listener = vi.fn()
      
      const unsubscribe = controller.subscribe(listener)
      
      controller.set('new-value')
      expect(listener).toHaveBeenCalledWith('new-value')
      
      unsubscribe()
      controller.set('final-value')
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should clear persistent storage', () => {
      const controller = manager.persistent('test-key', 'default')
      
      controller.set('value')
      expect(controller.get()).toBe('value')
      
      controller.clear()
      expect(controller.get()).toBe('default')
    })

    it('should return same controller instance for same key', () => {
      const controller1 = manager.persistent('same-key', 'default')
      const controller2 = manager.persistent('same-key', 'default')
      
      expect(controller1).toBe(controller2)
    })

    it('should support custom serializers for persistent storage', () => {
      const customSerializer = {
        stringify: (value: any) => `custom:${JSON.stringify(value)}`,
        parse: (value: string) => JSON.parse(value.replace('custom:', '')),
      }
      
      const controller = manager.persistent('custom', { value: 42 }, { serializer: customSerializer })
      controller.set({ value: 42 })
      expect(controller.get()).toEqual({ value: 42 })
    })

    it('should support immediate sync strategy', () => {
      const controller = manager.persistent('test-key', 'default', {
        syncStrategy: 'immediate',
      })
      
      controller.set('value')
      expect(controller.get()).toBe('value')
    })

    it('should support manual sync strategy', () => {
      const controller = manager.persistent('test-key', 'default', {
        syncStrategy: 'manual',
      })
      
      controller.set('value')
      expect(controller.get()).toBe('value')
    })

    it('should support batched sync strategy', () => {
      const controller = manager.persistent('test-key', 'default', {
        syncStrategy: 'batched',
      })
      
      controller.set('value1')
      controller.set('value2')
      expect(controller.get()).toBe('value2')
    })
  })

  describe('storage isolation', () => {
    it('should keep local and session storage separate', () => {
      const localController = manager.local('key', 'local-default')
      const sessionController = manager.session('key', 'session-default')
      
      localController.set('local-value')
      sessionController.set('session-value')
      
      expect(localController.get()).toBe('local-value')
      expect(sessionController.get()).toBe('session-value')
    })

    it('should keep local and persistent storage separate', () => {
      const localController = manager.local('key', 'local-default')
      const persistentController = manager.persistent('key', 'persistent-default')
      
      localController.set('local-value')
      persistentController.set('persistent-value')
      
      expect(localController.get()).toBe('local-value')
      expect(persistentController.get()).toBe('persistent-value')
    })
  })
})
