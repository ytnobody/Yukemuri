# Yukemuri Quick Reference

## Initialization
```typescript
import { yu } from './lib/yukemuri'
// Global instance ready to use!
```

## PWA APIs
```typescript
// Check if app can be installed
yu.pwa.isInstallable()

// Install the app
await yu.pwa.install()

// Check installation status
yu.pwa.isInstalled()

// Get full PWA status
const status = yu.pwa.getStatus()
```

## Notification APIs
```typescript
// Request permission
await yu.notifications.requestPermission()

// Send notification
await yu.notifications.sendNotification('Title', {
  body: 'Message body',
  icon: '/icon.png'
})

// Check permission
yu.notifications.getPermissionStatus()

// Subscribe to push
await yu.notifications.subscribeToPush()
```

## QR Code APIs
```typescript
// Generate QR code
const qr = await yu.qr.generate('https://example.com')

// Generate for current URL
const currentQR = await yu.qr.getCurrentURL()

// Download QR code
yu.qr.download(qrDataURL, 'filename.png')

// Generate SVG
const svg = await yu.qr.generateSVG('text')
```

## Storage APIs
```typescript
// Local storage (persistent across sessions)
const local = yu.storage.local('key', defaultValue)
local.set(newValue)
const value = local.get()

// Session storage (cleared when tab closes)
const session = yu.storage.session('key', defaultValue)

// Persistent storage (cloud sync)
const persistent = yu.storage.persistent('key', defaultValue)
await persistent.sync()

// Subscribe to changes
const unsubscribe = local.subscribe(value => {
  console.log('Value changed:', value)
})
```

## Type-Safe Storage
```typescript
interface UserSettings {
  theme: 'light' | 'dark'
  language: string
}

const settings = yu.storage.local<UserSettings>('settings', {
  theme: 'light',
  language: 'en'
})

// TypeScript will ensure type safety
settings.set({ theme: 'dark', language: 'fr' })
```

## Preact Integration
```typescript
import { yu } from '../lib/yukemuri'
import { useState, useEffect } from 'preact/hooks'

export default function MyComponent() {
  const [data, setData] = useState('')
  const storage = yu.storage.local('my-data', '')

  useEffect(() => {
    setData(storage.get())
    return storage.subscribe(setData)
  }, [])

  return <div>{data}</div>
}
```