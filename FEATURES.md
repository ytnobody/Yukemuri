# Yukemuri Framework Features Specification ♨️

Core features and API specifications provided by the Yukemuri framework

## 🏗️ Core Framework API

### `Yukemuri` Class
Main class of the framework. Entry point for accessing all features

**Basic Usage:**
```typescript
import { Yukemuri } from 'yukemuri'

const yu = new Yukemuri()
```

---

## 📱 PWA (Progressive Web App) Functions

### `yu.pwa`
API group for managing basic PWA features

**Feature Overview:**
- Application installation capability
- Check installation status
- PWA compatibility diagnostics

**API Specification:**
```typescript
interface PWAManager {
  install: () => Promise<boolean>
  isInstallable: () => boolean
  isInstalled: () => boolean
  getStatus: () => PWAStatus
}

interface PWAStatus {
  hasServiceWorker: boolean
  hasManifest: boolean
  isHTTPS: boolean
  installPromptAvailable: boolean
  isInstalled: boolean
  notificationPermission: NotificationPermission
}
```

**Usage Example:**
```typescript
const yu = new Yukemuri()

// Install the application
if (yu.pwa.isInstallable()) {
  await yu.pwa.install()
}

// Get PWA diagnostic information
const status = yu.pwa.getStatus()
console.log('PWA Status:', status)
```

---

### `yu.notifications`
API for managing push notifications

**Feature Overview:**
- Notification permission management
- Send push notifications
- VAPID-enabled push subscriptions

**API Specification:**
```typescript
interface NotificationManager {
  requestPermission: () => Promise<NotificationPermission>
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>
  subscribeToPush: () => Promise<PushSubscription | null>
  getPermissionStatus: () => NotificationPermission
}

interface NotificationOptions {
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}
```

**Usage Example:**
```typescript
const yu = new Yukemuri()

// Request notification permission
const permission = await yu.notifications.requestPermission()

if (permission === 'granted') {
  // Send test notification
  await yu.notifications.sendNotification('Yukemuri ♨️', {
    body: 'Notifications enabled!',
    icon: '/icons/icon-192x192.png'
  })
  
  // Subscribe to push notifications
  const subscription = await yu.notifications.subscribeToPush()
}
```

---

## 📊 QR Code Functions

### `yu.qr`
QR code generation and management functionality

**Feature Overview:**
- Generate QR code from any text
- Generate QR code from current URL
- Download QR codes
- Customizable styling

**API Specification:**
```typescript
interface QRCodeManager {
  generate: (value: string, options?: QRCodeOptions) => Promise<string>
  getCurrentURL: (options?: QRCodeOptions) => Promise<string>
  download: (qrDataURL: string, filename?: string) => void
  generateSVG: (value: string, options?: QRCodeOptions) => Promise<string>
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
```

**Usage Example:**
```typescript
const yu = new Yukemuri()

// Generate custom QR code
const qrDataURL = await yu.qr.generate('https://example.com', {
  size: 300,
  color: { dark: '#1a365d', light: '#ffffff' }
})

// Generate QR code for current page
const currentQR = await yu.qr.getCurrentURL({ size: 200 })

// Download QR code
yu.qr.download(qrDataURL, 'my-qr-code.png')
```

---

## 🔄 State Management Functions

### `yu.storage`
Storage synchronization functionality

**Feature Overview:**
- Automatic localStorage synchronization
- Automatic sessionStorage synchronization
- PWA-compatible offline state management
- Type-safe value management

**API Specification:**
```typescript
interface StorageManager {
  local: <T>(key: string, defaultValue: T, options?: StorageOptions) => StorageController<T>
  session: <T>(key: string, defaultValue: T, options?: StorageOptions) => StorageController<T>
  persistent: <T>(key: string, defaultValue: T, options?: PersistentOptions) => PersistentController<T>
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
```

**Usage Example:**
```typescript
const yu = new Yukemuri()

// localStorage
const username = yu.storage.local('username', '')
username.set('user123')
console.log(username.get()) // 'user123'

// sessionStorage  
const tempData = yu.storage.session('temp-data', { count: 0 })
tempData.set(prev => ({ ...prev, count: prev.count + 1 }))

// Persistent Storage (PWA-compatible)
const userData = yu.storage.persistent('user-data', { preferences: {} })
await userData.sync()
```

---

## 🌐 Network Functions

### `yu.network`
Network connection monitoring and offline support

**Feature Overview:**
- Real-time connection status monitoring
- Connection type detection
- Request queueing for offline mode
- Automatic synchronization when back online

**API Specification:**
```typescript
interface NetworkManager {
  status: NetworkStatus
  offlineSync: OfflineSyncManager
  onStatusChange: (callback: (status: NetworkStatus) => void) => () => void
}

interface NetworkStatus {
  isOnline: boolean
  isOffline: boolean
  connectionType: ConnectionType
  effectiveType: EffectiveConnectionType
  downlink: number
  rtt: number
  saveData: boolean
}

interface OfflineSyncManager {
  queueRequest: (request: QueuedRequest) => Promise<string>
  syncWhenOnline: () => Promise<SyncResult[]>
  getPendingRequests: () => QueuedRequest[]
  clearQueue: () => Promise<void>
  retryFailedRequests: () => Promise<SyncResult[]>
  issyncing: boolean
  pendingCount: number
}
```

**Usage Example:**
```typescript
const yu = new Yukemuri()

// Monitor network status
console.log('Online:', yu.network.status.isOnline)

yu.network.onStatusChange((status) => {
  if (status.isOffline) {
    showOfflineMessage()
  }
})

// Queue requests when offline
if (yu.network.status.isOffline) {
  await yu.network.offlineSync.queueRequest({
    url: '/api/users',
    method: 'POST',
    body: userData,
    priority: 'high'
  })
} else {
  // Send immediately when online
  await fetch('/api/users', { method: 'POST', body: JSON.stringify(userData) })
}
```

---

## 📱 Device Information Functions

### `yu.device`
Device information retrieval and responsive support

**Feature Overview:**
- Device type detection
- Screen size and viewport information
- Media query monitoring
- Touch device detection

**API Specification:**
```typescript
interface DeviceManager {
  info: DeviceInfo
  mediaQuery: (query: string) => boolean
  mediaQueries: (queries: Record<string, string>) => Record<string, boolean>
  onViewportChange: (callback: (viewport: ViewportInfo) => void) => () => void
  onOrientationChange: (callback: (orientation: 'portrait' | 'landscape') => void) => () => void
}

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  userAgent: string
  viewport: ViewportInfo
  orientation: 'portrait' | 'landscape'
  pixelRatio: number
  platform: string
}

interface ViewportInfo {
  width: number
  height: number
  availableWidth: number
  availableHeight: number
}
```

**Usage Example:**
```typescript
const yu = new Yukemuri()

// Get device information
const { isMobile, isTablet, viewport } = yu.device.info

// Adjust responsive layout
const layoutClass = isMobile ? 'mobile-layout' : isTablet ? 'tablet-layout' : 'desktop-layout'

// Monitor media queries
const isMobileView = yu.device.mediaQuery('(max-width: 768px)')

// Monitor multiple breakpoints
const breakpoints = yu.device.mediaQueries({
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)'
})

// Monitor viewport changes
yu.device.onViewportChange((viewport) => {
  console.log('Viewport changed:', viewport.width, 'x', viewport.height)
})
```

---

## 🛣️ Routing Functions

### `yu.router`
File-based routing control

**Feature Overview:**
- Programmatic navigation
- Route parameter extraction
- History management
- Navigation guards

**API Specification:**
```typescript
interface RouterManager {
  push: (path: string, state?: any) => void
  replace: (path: string, state?: any) => void
  back: () => void
  forward: () => void
  go: (delta: number) => void
  getCurrentPath: () => string
  getParams: () => Record<string, string>
  getQuery: () => URLSearchParams
  isActive: (path: string) => boolean
  onNavigate: (callback: (path: string) => void) => () => void
}
```

**Usage Example:**
```typescript
const yu = new Yukemuri()

// Programmatic navigation
const navigateToUser = (userId: string) => {
  yu.router.push(`/users/${userId}`)
}

// Get route parameters
const params = yu.router.getParams() // { id: "123" } for /users/123
const query = yu.router.getQuery()   // URLSearchParams for ?tab=profile&sort=name

// Conditional navigation
const handleSave = async () => {
  try {
    await saveData()
    yu.router.push('/success')
  } catch (error) {
    yu.router.push('/error', { error: error.message })
  }
}

// Monitor navigation
yu.router.onNavigate((path) => {
  console.log('Navigated to:', path)
})
```

---

## 🔧 Utility Functions

### `yu.utils`
Utility function collection

**Feature Overview:**
- Clipboard operations
- Web Share API integration
- Fullscreen control
- Additional utility functions

**API Specification:**
```typescript
interface UtilsManager {
  clipboard: ClipboardManager
  share: ShareManager
  fullscreen: FullscreenManager
}

interface ClipboardManager {
  copy: (text: string) => Promise<boolean>
  paste: () => Promise<string>
  isSupported: boolean
  isSecureContext: boolean
}

interface ShareManager {
  share: (data: ShareData) => Promise<boolean>
  canShare: (data?: ShareData) => boolean
  isSupported: boolean
}

interface FullscreenManager {
  enter: (element?: HTMLElement) => Promise<void>
  exit: () => Promise<void>
  toggle: (element?: HTMLElement) => Promise<void>
  isFullscreen: boolean
  isSupported: boolean
  element: Element | null
}
```

**Usage Example:**
```typescript
const yu = new Yukemuri()

// Clipboard operations
if (yu.utils.clipboard.isSupported) {
  const success = await yu.utils.clipboard.copy(window.location.href)
  if (success) {
    showToast('URL copied!')
  }
}

// Share functionality
const shareData = {
  title: 'Yukemuri App',
  text: 'Amazing PWA framework',
  url: window.location.href
}

if (yu.utils.share.canShare(shareData)) {
  await yu.utils.share.share(shareData)
}

// Fullscreen control
if (yu.utils.fullscreen.isSupported) {
  await yu.utils.fullscreen.toggle()
}
```

---

## 🏗️ Implementation Priority

### High Priority (Implement immediately)
- `yu.pwa` - Refactor existing code
- `yu.notifications` - Refactor existing code
- `yu.qr` - Convert existing components to functions
- `yu.router` - Integrate with file-based routing

### Medium Priority (Next phase)
- `yu.storage` - Basic state management features
- `yu.network` - PWA foundation features
- `yu.device` - Responsive support features

### Low Priority (Future implementation)
- `yu.storage.persistent()` - Advanced state management
- `yu.network.offlineSync` - Complex sync features
- `yu.utils` - Utility function collection

---

## 📋 Implementation Notes

### Framework Design Principles
- All features provided through Yukemuri class instance
- Type-safe implementation with TypeScript
- Optimized for Preact environment
- Consider Service Worker integration
- Standard error handling and loading states
- Browser compatibility and fallback support
- PWA requirement compliance
- Performance and memory efficiency optimization

### API Design Guidelines
- Consistent method naming conventions
- Promise-based asynchronous operations
- Flexible configuration through optional parameters
- Reactive updates through event listeners
- Intuitive API through method chaining