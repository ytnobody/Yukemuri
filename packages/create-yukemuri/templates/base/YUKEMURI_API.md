# Yukemuri Framework API Documentation

Welcome to Yukemuri! This documentation covers all the APIs available in your Yukemuri application for building progressive web applications with ease.

## Quick Start

```typescript
import { Yukemuri, yu } from './lib/yukemuri'

// Use the global instance (recommended)
const status = yu.pwa.getStatus()

// Or create your own instance
const yukemuri = new Yukemuri()
const isInstalled = yukemuri.pwa.isInstalled()
```

## Core APIs

### 1. PWA Management (`yu.pwa`)

The PWA manager handles Progressive Web App installation, service workers, and app manifest features.

#### Methods

##### `yu.pwa.install(): Promise<boolean>`
Triggers the PWA installation prompt.

```typescript
// Show install prompt when user clicks a button
const handleInstall = async () => {
  try {
    const installed = await yu.pwa.install()
    if (installed) {
      console.log('App installed successfully!')
    }
  } catch (error) {
    console.error('Installation failed:', error)
  }
}
```

##### `yu.pwa.isInstallable(): boolean`
Checks if the app can be installed.

```typescript
// Show install button only if app is installable
if (yu.pwa.isInstallable()) {
  showInstallButton()
}
```

##### `yu.pwa.isInstalled(): boolean`
Checks if the app is currently installed.

```typescript
// Show different UI for installed vs browser users
if (yu.pwa.isInstalled()) {
  showInstalledUserFeatures()
} else {
  showInstallPrompt()
}
```

##### `yu.pwa.getStatus(): PWAStatus`
Gets comprehensive PWA status information.

```typescript
const status = yu.pwa.getStatus()
console.log({
  hasServiceWorker: status.hasServiceWorker,
  hasManifest: status.hasManifest,
  isHTTPS: status.isHTTPS,
  installPromptAvailable: status.installPromptAvailable,
  isInstalled: status.isInstalled,
  notificationPermission: status.notificationPermission
})
```

### 2. Notifications (`yu.notifications`)

Manage push notifications with permission handling and subscription management.

#### Methods

##### `yu.notifications.requestPermission(): Promise<NotificationPermission>`
Requests notification permission from the user.

```typescript
const handleNotificationSetup = async () => {
  const permission = await yu.notifications.requestPermission()
  
  if (permission === 'granted') {
    console.log('Notifications enabled!')
    // Send welcome notification
    await yu.notifications.sendNotification('Welcome!', {
      body: 'You will now receive notifications from our app.',
      icon: '/icons/icon-192x192.png'
    })
  }
}
```

##### `yu.notifications.sendNotification(title: string, options?: NotificationOptions): Promise<void>`
Sends a notification to the user.

```typescript
// Simple notification
await yu.notifications.sendNotification('New Message', {
  body: 'You have received a new message.',
  icon: '/icons/message-icon.png'
})

// Notification with custom data
await yu.notifications.sendNotification('Order Complete', {
  body: 'Your order #1234 has been processed.',
  icon: '/icons/order-icon.png',
  badge: '/icons/badge.png',
  tag: 'order-1234',
  data: { orderId: 1234, action: 'view' }
})
```

##### `yu.notifications.getPermissionStatus(): NotificationPermission`
Gets the current notification permission status.

```typescript
const permission = yu.notifications.getPermissionStatus()

switch (permission) {
  case 'granted':
    showNotificationFeatures()
    break
  case 'denied':
    showPermissionDeniedMessage()
    break
  case 'default':
    showPermissionRequestButton()
    break
}
```

##### `yu.notifications.subscribeToPush(): Promise<PushSubscription | null>`
Subscribes to push notifications for server-sent messages.

```typescript
const setupPushNotifications = async () => {
  try {
    const subscription = await yu.notifications.subscribeToPush()
    if (subscription) {
      // Send subscription to your server
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })
    }
  } catch (error) {
    console.error('Push subscription failed:', error)
  }
}
```

### 3. QR Code Generation (`yu.qr`)

Generate QR codes for URLs, text, or current page sharing.

#### Methods

##### `yu.qr.generate(value: string, options?: QRCodeOptions): Promise<string>`
Generates a QR code as a data URL.

```typescript
// Basic QR code
const qrCode = await yu.qr.generate('https://example.com')
document.getElementById('qr-image').src = qrCode

// Customized QR code
const customQR = await yu.qr.generate('Hello World', {
  size: 300,
  margin: 4,
  color: {
    dark: '#FF0000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'H'
})
```

##### `yu.qr.getCurrentURL(options?: QRCodeOptions): Promise<string>`
Generates a QR code for the current page URL.

```typescript
// Share current page
const pageQR = await yu.qr.getCurrentURL({
  size: 200,
  margin: 2
})

// Display in modal or share dialog
showQRModal(pageQR)
```

##### `yu.qr.download(qrDataURL: string, filename?: string): void`
Downloads a QR code image.

```typescript
const qrCode = await yu.qr.generate('https://myapp.com')
yu.qr.download(qrCode, 'my-app-qr.png')
```

##### `yu.qr.generateSVG(value: string, options?: QRCodeOptions): Promise<string>`
Generates a QR code as an SVG string.

```typescript
const svgQR = await yu.qr.generateSVG('https://example.com', {
  size: 256,
  color: { dark: '#000', light: 'transparent' }
})

// Insert into DOM
document.getElementById('qr-container').innerHTML = svgQR
```

### 4. Storage Management (`yu.storage`)

Type-safe storage with automatic serialization and cross-tab synchronization.

#### Methods

##### `yu.storage.local<T>(key: string, defaultValue: T, options?: StorageOptions<T>): StorageController<T>`
Creates a localStorage controller.

```typescript
// Simple value storage
const nameStorage = yu.storage.local('user-name', '')
nameStorage.set('John Doe')
console.log(nameStorage.get()) // 'John Doe'

// Object storage with type safety
interface UserSettings {
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
}

const settingsStorage = yu.storage.local<UserSettings>('settings', {
  theme: 'light',
  language: 'en',
  notifications: true
})

// Update settings
settingsStorage.set(prev => ({
  ...prev,
  theme: 'dark'
}))

// Subscribe to changes
const unsubscribe = settingsStorage.subscribe(settings => {
  console.log('Settings changed:', settings)
})
```

##### `yu.storage.session<T>(key: string, defaultValue: T, options?: StorageOptions<T>): StorageController<T>`
Creates a sessionStorage controller (data persists only for the session).

```typescript
// Temporary form data
const formStorage = yu.storage.session('temp-form', {
  email: '',
  message: ''
})

// Auto-save form data
formStorage.set({ email: 'user@example.com', message: 'Hello!' })
```

##### `yu.storage.persistent<T>(key: string, defaultValue: T, options?: PersistentOptions<T>): PersistentController<T>`
Creates a persistent storage controller with cloud sync capabilities.

```typescript
// User data that syncs across devices
const userDataStorage = yu.storage.persistent('user-data', {
  preferences: {},
  bookmarks: [],
  history: []
}, {
  syncStrategy: 'immediate' // 'batched' or 'manual'
})

// Manual sync
await userDataStorage.sync()

// Check sync status
if (userDataStorage.isSyncing()) {
  showSyncIndicator()
}

console.log('Last synced:', userDataStorage.lastSynced())
```

#### Storage Options

```typescript
interface StorageOptions<T> {
  // Custom serialization (useful for Date objects, Maps, etc.)
  serializer?: {
    stringify: (value: T) => string
    parse: (value: string) => T
  }
  
  // Synchronize across browser tabs
  syncAcrossTabs?: boolean
}

// Example with custom serializer for Date objects
const dateStorage = yu.storage.local('last-visit', new Date(), {
  serializer: {
    stringify: (date: Date) => date.toISOString(),
    parse: (str: string) => new Date(str)
  }
})
```

## Preact Component Integration

### Using Yukemuri in Components

```typescript
import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { yu } from '../lib/yukemuri'

export default function MyComponent() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [settings, setSettings] = useState({ theme: 'light' })

  // Storage controller
  const settingsStorage = yu.storage.local('app-settings', { theme: 'light' })

  useEffect(() => {
    // Initialize state
    setIsInstalled(yu.pwa.isInstalled())
    setSettings(settingsStorage.get())

    // Subscribe to storage changes
    const unsubscribe = settingsStorage.subscribe(setSettings)
    return unsubscribe
  }, [])

  const handleInstall = async () => {
    const success = await yu.pwa.install()
    if (success) {
      setIsInstalled(true)
    }
  }

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    settingsStorage.set({ ...settings, theme: newTheme })
  }

  return (
    <div className={settings.theme}>
      <h1>My App</h1>
      
      {!isInstalled && (
        <button onClick={handleInstall}>
          Install App
        </button>
      )}
      
      <button onClick={toggleTheme}>
        Switch to {settings.theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>
    </div>
  )
}
```

### QR Code Component Example

```typescript
import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { yu } from '../lib/yukemuri'

interface QRCodeProps {
  value: string
  size?: number
}

export default function QRCode({ value, size = 200 }: QRCodeProps) {
  const [qrDataURL, setQrDataURL] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true)
        const dataURL = await yu.qr.generate(value, { size })
        setQrDataURL(dataURL)
      } catch (error) {
        console.error('QR generation failed:', error)
      } finally {
        setLoading(false)
      }
    }

    generateQR()
  }, [value, size])

  const handleDownload = () => {
    if (qrDataURL) {
      yu.qr.download(qrDataURL, `qr-${Date.now()}.png`)
    }
  }

  if (loading) {
    return <div>Generating QR code...</div>
  }

  return (
    <div>
      <img src={qrDataURL} alt={`QR Code for ${value}`} />
      <button onClick={handleDownload}>Download QR Code</button>
    </div>
  )
}
```

## Best Practices

### 1. Error Handling
Always wrap Yukemuri API calls in try-catch blocks:

```typescript
const safeNotification = async () => {
  try {
    await yu.notifications.sendNotification('Title', { body: 'Message' })
  } catch (error) {
    console.error('Notification failed:', error)
    // Fallback to in-app notification
    showInAppMessage('Message')
  }
}
```

### 2. Performance
- Use storage subscriptions instead of polling for reactive updates
- Generate QR codes asynchronously and show loading states
- Check PWA status before calling install methods

### 3. User Experience
- Always check permissions before requesting notifications
- Provide fallbacks for unsupported features
- Show loading states for async operations

```typescript
// Good: Check before requesting
if (yu.notifications.getPermissionStatus() === 'default') {
  await yu.notifications.requestPermission()
}

// Good: Graceful degradation
if (!yu.pwa.isInstallable()) {
  hideInstallButton()
  showWebAppFeatures()
}
```

## TypeScript Types

All Yukemuri APIs are fully typed. Import the types you need:

```typescript
import type {
  PWAStatus,
  NotificationOptions,
  QRCodeOptions,
  StorageOptions,
  StorageController
} from './lib/yukemuri'
```

## Migration from Other Libraries

### From localStorage directly:
```typescript
// Before
const data = JSON.parse(localStorage.getItem('key') || '{}')
localStorage.setItem('key', JSON.stringify(newData))

// After
const storage = yu.storage.local('key', {})
const data = storage.get()
storage.set(newData)
```

### From manual PWA detection:
```typescript
// Before
const isStandalone = window.matchMedia('(display-mode: standalone)').matches

// After
const isInstalled = yu.pwa.isInstalled()
```

This documentation covers all the essential Yukemuri APIs. For more advanced usage and customization, refer to the source code in `app/lib/yukemuri.ts`.