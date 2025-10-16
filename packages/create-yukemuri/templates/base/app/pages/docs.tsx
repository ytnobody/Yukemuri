import { h } from 'preact'

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">♨️ Yukemuri API Documentation</h1>
        <p className="text-xl text-gray-600">
          Complete guide to building PWAs with Yukemuri framework
        </p>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-50 p-4 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-3">Quick Navigation</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Core APIs</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#pwa-api" className="text-blue-600 hover:underline">PWA Management</a></li>
              <li><a href="#notifications-api" className="text-blue-600 hover:underline">Notifications</a></li>
              <li><a href="#qr-api" className="text-blue-600 hover:underline">QR Code Generation</a></li>
              <li><a href="#storage-api" className="text-blue-600 hover:underline">Storage Management</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Getting Started</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#quick-start" className="text-blue-600 hover:underline">Quick Start</a></li>
              <li><a href="#examples" className="text-blue-600 hover:underline">Examples</a></li>
              <li><a href="#best-practices" className="text-blue-600 hover:underline">Best Practices</a></li>
              <li><a href="#typescript" className="text-blue-600 hover:underline">TypeScript Types</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Quick Start Section */}
      <section id="quick-start" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Start</h2>
        
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-6">
          <pre className="text-sm overflow-x-auto">
            <code>{`import { Yukemuri, yu } from './lib/yukemuri'

// Use the global instance (recommended)
const status = yu.pwa.getStatus()

// Or create your own instance
const yukemuri = new Yukemuri()
const isInstalled = yukemuri.pwa.isInstalled()`}</code>
          </pre>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🚀 PWA Features</h3>
            <div className="bg-white p-3 rounded text-sm">
              <pre><code>{`// Install the app
await yu.pwa.install()

// Check status
yu.pwa.isInstalled()`}</code></pre>
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🔔 Notifications</h3>
            <div className="bg-white p-3 rounded text-sm">
              <pre><code>{`// Request permission
await yu.notifications.requestPermission()

// Send notification
await yu.notifications.sendNotification('Hello!')`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      {/* PWA API Section */}
      <section id="pwa-api" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">PWA Management API</h2>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3"><code>yu.pwa.install(): Promise&lt;boolean&gt;</code></h3>
            <p className="text-gray-600 mb-4">Triggers the PWA installation prompt.</p>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded">
              <pre className="text-sm overflow-x-auto">
                <code>{`const handleInstall = async () => {
  try {
    const installed = await yu.pwa.install()
    if (installed) {
      console.log('App installed successfully!')
    }
  } catch (error) {
    console.error('Installation failed:', error)
  }
}`}</code>
              </pre>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3"><code>yu.pwa.getStatus(): PWAStatus</code></h3>
            <p className="text-gray-600 mb-4">Gets comprehensive PWA status information.</p>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded">
              <pre className="text-sm overflow-x-auto">
                <code>{`const status = yu.pwa.getStatus()
console.log({
  hasServiceWorker: status.hasServiceWorker,
  hasManifest: status.hasManifest,
  isHTTPS: status.isHTTPS,
  installPromptAvailable: status.installPromptAvailable,
  isInstalled: status.isInstalled,
  notificationPermission: status.notificationPermission
})`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications API Section */}
      <section id="notifications-api" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Notifications API</h2>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3"><code>yu.notifications.sendNotification(title, options)</code></h3>
            <p className="text-gray-600 mb-4">Sends a notification to the user.</p>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded">
              <pre className="text-sm overflow-x-auto">
                <code>{`// Simple notification
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
})`}</code>
              </pre>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3"><code>yu.notifications.requestPermission()</code></h3>
            <p className="text-gray-600 mb-4">Requests notification permission from the user.</p>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded">
              <pre className="text-sm overflow-x-auto">
                <code>{`const permission = await yu.notifications.requestPermission()

if (permission === 'granted') {
  console.log('Notifications enabled!')
  await yu.notifications.sendNotification('Welcome!', {
    body: 'You will now receive notifications.',
    icon: '/icons/icon-192x192.png'
  })
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code API Section */}
      <section id="qr-api" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">QR Code API</h2>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3"><code>yu.qr.generate(value, options)</code></h3>
            <p className="text-gray-600 mb-4">Generates a QR code as a data URL.</p>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded">
              <pre className="text-sm overflow-x-auto">
                <code>{`// Basic QR code
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
})`}</code>
              </pre>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3"><code>yu.qr.getCurrentURL(options)</code></h3>
            <p className="text-gray-600 mb-4">Generates a QR code for the current page URL.</p>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded">
              <pre className="text-sm overflow-x-auto">
                <code>{`// Share current page
const pageQR = await yu.qr.getCurrentURL({
  size: 200,
  margin: 2
})

// Display in modal or share dialog
showQRModal(pageQR)`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Storage API Section */}
      <section id="storage-api" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Storage Management API</h2>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3"><code>yu.storage.local&lt;T&gt;(key, defaultValue, options)</code></h3>
            <p className="text-gray-600 mb-4">Creates a localStorage controller with type safety.</p>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded">
              <pre className="text-sm overflow-x-auto">
                <code>{`// Simple value storage
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
})`}</code>
              </pre>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3"><code>yu.storage.persistent&lt;T&gt;(key, defaultValue, options)</code></h3>
            <p className="text-gray-600 mb-4">Creates a persistent storage controller with cloud sync capabilities.</p>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded">
              <pre className="text-sm overflow-x-auto">
                <code>{`// User data that syncs across devices
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

console.log('Last synced:', userDataStorage.lastSynced())`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Preact Integration Section */}
      <section id="examples" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Preact Component Integration</h2>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Basic Component Example</h3>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded">
            <pre className="text-sm overflow-x-auto">
              <code>{`import { h } from 'preact'
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
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Best Practices Section */}
      <section id="best-practices" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practices</h2>
        
        <div className="grid md:grid-cols-1 gap-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">🛡️ Error Handling</h3>
            <p className="text-yellow-700 mb-3">Always wrap Yukemuri API calls in try-catch blocks:</p>
            
            <div className="bg-white p-3 rounded">
              <pre className="text-sm overflow-x-auto">
                <code>{`const safeNotification = async () => {
  try {
    await yu.notifications.sendNotification('Title', { body: 'Message' })
  } catch (error) {
    console.error('Notification failed:', error)
    // Fallback to in-app notification
    showInAppMessage('Message')
  }
}`}</code>
              </pre>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">⚡ Performance</h3>
            <ul className="text-blue-700 space-y-2">
              <li>• Use storage subscriptions instead of polling for reactive updates</li>
              <li>• Generate QR codes asynchronously and show loading states</li>
              <li>• Check PWA status before calling install methods</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">👤 User Experience</h3>
            <ul className="text-green-700 space-y-2">
              <li>• Always check permissions before requesting notifications</li>
              <li>• Provide fallbacks for unsupported features</li>
              <li>• Show loading states for async operations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* TypeScript Section */}
      <section id="typescript" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">TypeScript Types</h2>
        
        <div className="border rounded-lg p-6">
          <p className="text-gray-600 mb-4">All Yukemuri APIs are fully typed. Import the types you need:</p>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded">
            <pre className="text-sm overflow-x-auto">
              <code>{`import type {
  PWAStatus,
  NotificationOptions,
  QRCodeOptions,
  StorageOptions,
  StorageController
} from './lib/yukemuri'`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t pt-8 mt-12 text-center text-gray-500">
        <p className="mb-4">
          Built with ♨️ Yukemuri Framework
        </p>
        <div className="space-x-4 text-sm">
          <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
          <a href="/about" className="text-blue-600 hover:underline">About</a>
          <a href="https://github.com/ytnobody/Yukemuri" className="text-blue-600 hover:underline">GitHub</a>
        </div>
      </footer>
    </div>
  )
}