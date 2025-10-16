import { h } from 'preact'
import { useState } from 'preact/hooks'

export default function ExamplesPage() {
  const [activeExample, setActiveExample] = useState('install')

  const examples = [
    {
      id: 'install',
      title: '📱 PWA Installation',
      description: 'Complete PWA installation component with status checking'
    },
    {
      id: 'notifications',
      title: '🔔 Notification Manager',
      description: 'Full notification system with permissions and push subscriptions'
    },
    {
      id: 'qr-share',
      title: '📱 QR Code Sharing',
      description: 'Generate and share QR codes with download functionality'
    },
    {
      id: 'settings',
      title: '⚙️ Settings Manager',
      description: 'Type-safe settings with local and cloud storage sync'
    }
  ]

  const codeExamples = {
    install: `import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { yu } from '../lib/yukemuri'

export default function InstallPrompt() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    setCanInstall(yu.pwa.isInstallable())
    setIsInstalled(yu.pwa.isInstalled())
  }, [])

  const handleInstall = async () => {
    setInstalling(true)
    try {
      const success = await yu.pwa.install()
      if (success) {
        setIsInstalled(true)
        setCanInstall(false)
      }
    } catch (error) {
      console.error('Installation failed:', error)
    } finally {
      setInstalling(false)
    }
  }

  if (isInstalled) {
    return (
      <div className="bg-green-100 p-4 rounded">
        ✅ App installed successfully!
      </div>
    )
  }

  if (!canInstall) {
    return null
  }

  return (
    <div className="bg-blue-100 p-4 rounded">
      <h3>Install Our App</h3>
      <p>Get faster access and offline functionality</p>
      <button 
        onClick={handleInstall}
        disabled={installing}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {installing ? 'Installing...' : 'Install App'}
      </button>
    </div>
  )
}`,

    notifications: `import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { yu } from '../lib/yukemuri'

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    setPermission(yu.notifications.getPermissionStatus())
  }, [])

  const requestPermission = async () => {
    const result = await yu.notifications.requestPermission()
    setPermission(result)
    
    if (result === 'granted') {
      // Send welcome notification
      await yu.notifications.sendNotification('Notifications Enabled!', {
        body: 'You will now receive important updates.',
        icon: '/icons/notification-icon.png'
      })
    }
  }

  const subscribeToPush = async () => {
    try {
      const subscription = await yu.notifications.subscribeToPush()
      if (subscription) {
        setSubscribed(true)
        // Send subscription to your backend
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

  const sendTestNotification = async () => {
    await yu.notifications.sendNotification('Test Notification', {
      body: 'This is a test notification from your app!',
      icon: '/icons/icon-192x192.png',
      tag: 'test',
      data: { type: 'test', timestamp: Date.now() }
    })
  }

  return (
    <div className="space-y-4">
      <h3>Notification Settings</h3>
      
      <div className="bg-gray-100 p-4 rounded">
        <p>Status: <strong>{permission}</strong></p>
        {subscribed && <p>✅ Subscribed to push notifications</p>}
      </div>

      {permission === 'default' && (
        <button 
          onClick={requestPermission}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Enable Notifications
        </button>
      )}

      {permission === 'granted' && (
        <div className="space-x-2">
          <button 
            onClick={sendTestNotification}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Send Test
          </button>
          
          {!subscribed && (
            <button 
              onClick={subscribeToPush}
              className="bg-purple-500 text-white px-4 py-2 rounded"
            >
              Subscribe to Push
            </button>
          )}
        </div>
      )}

      {permission === 'denied' && (
        <div className="bg-red-100 p-4 rounded">
          <p>Notifications are blocked. Enable them in browser settings:</p>
          <ol className="list-decimal list-inside mt-2">
            <li>Click the 🔒 icon in the address bar</li>
            <li>Change "Notifications" to "Allow"</li>
            <li>Reload the page</li>
          </ol>
        </div>
      )}
    </div>
  )
}`,

    'qr-share': `import { h } from 'preact'
import { useState } from 'preact/hooks'
import { yu } from '../lib/yukemuri'

interface ShareQRProps {
  url?: string
  title?: string
}

export default function ShareQR({ url, title = 'Share this page' }: ShareQRProps) {
  const [qrCode, setQrCode] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const generateQR = async () => {
    setLoading(true)
    setError('')
    
    try {
      const dataURL = url 
        ? await yu.qr.generate(url, { size: 256, margin: 2 })
        : await yu.qr.getCurrentURL({ size: 256, margin: 2 })
      
      setQrCode(dataURL)
    } catch (err) {
      setError('Failed to generate QR code')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    if (qrCode) {
      yu.qr.download(qrCode, \`share-\${Date.now()}.png\`)
    }
  }

  const shareNative = async () => {
    if (navigator.share && url) {
      try {
        await navigator.share({
          title: title,
          url: url
        })
      } catch (err) {
        console.log('Share cancelled or failed')
      }
    }
  }

  return (
    <div className="text-center space-y-4">
      <h3>{title}</h3>
      
      {!qrCode && !loading && (
        <button 
          onClick={generateQR}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Generate QR Code
        </button>
      )}

      {loading && (
        <div className="bg-gray-100 p-8 rounded">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Generating QR code...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 p-4 rounded text-red-700">
          {error}
        </div>
      )}

      {qrCode && (
        <div className="space-y-4">
          <img 
            src={qrCode} 
            alt="QR Code" 
            className="mx-auto border rounded"
          />
          
          <div className="flex justify-center space-x-2">
            <button 
              onClick={downloadQR}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              📥 Download
            </button>
            
            {navigator.share && (
              <button 
                onClick={shareNative}
                className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
              >
                🔗 Share
              </button>
            )}
          </div>
          
          <p className="text-xs text-gray-600 break-all">
            {url || window.location.href}
          </p>
        </div>
      )}
    </div>
  )
}`,

    settings: `import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { yu } from '../lib/yukemuri'

interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  language: 'en' | 'es' | 'fr' | 'de' | 'ja'
  notifications: boolean
  autoSave: boolean
  dataUsage: 'low' | 'normal' | 'high'
}

const defaultSettings: AppSettings = {
  theme: 'auto',
  language: 'en',
  notifications: true,
  autoSave: true,
  dataUsage: 'normal'
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Local storage for quick access
  const localSettings = yu.storage.local('app-settings', defaultSettings, {
    syncAcrossTabs: true
  })

  // Persistent storage for cloud sync
  const persistentSettings = yu.storage.persistent('user-settings', defaultSettings, {
    syncStrategy: 'batched'
  })

  useEffect(() => {
    // Load settings
    const stored = localSettings.get()
    setSettings(stored)
    setLastSaved(persistentSettings.lastSynced())

    // Subscribe to changes across tabs
    const unsubscribe = localSettings.subscribe(newSettings => {
      setSettings(newSettings)
    })

    return unsubscribe
  }, [])

  const updateSetting = <K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localSettings.set(newSettings)

    // Auto-save to persistent storage if enabled
    if (settings.autoSave) {
      saveToCloud(newSettings)
    }
  }

  const saveToCloud = async (settingsToSave = settings) => {
    setSaving(true)
    try {
      persistentSettings.set(settingsToSave)
      await persistentSettings.sync()
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to sync settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localSettings.set(defaultSettings)
    if (settings.autoSave) {
      saveToCloud(defaultSettings)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2>Settings</h2>

      {/* Theme Setting */}
      <div>
        <label className="block text-sm font-medium mb-2">Theme</label>
        <select 
          value={settings.theme}
          onChange={(e) => updateSetting('theme', e.currentTarget.value as AppSettings['theme'])}
          className="w-full p-2 border rounded"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      {/* Toggle Settings */}
      <div className="space-y-3">
        <label className="flex items-center">
          <input 
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => updateSetting('notifications', e.currentTarget.checked)}
            className="mr-2"
          />
          Enable notifications
        </label>

        <label className="flex items-center">
          <input 
            type="checkbox"
            checked={settings.autoSave}
            onChange={(e) => updateSetting('autoSave', e.currentTarget.checked)}
            className="mr-2"
          />
          Auto-save to cloud
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <button 
          onClick={() => saveToCloud()}
          disabled={saving}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save to Cloud'}
        </button>

        <button 
          onClick={resetSettings}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>

      {/* Status */}
      <div className="text-xs text-gray-600">
        {lastSaved ? (
          <p>Last synced: {lastSaved.toLocaleString()}</p>
        ) : (
          <p>Not synced yet</p>
        )}
        {persistentSettings.isSyncing() && (
          <p>🔄 Syncing...</p>
        )}
      </div>
    </div>
  )
}`
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">♨️ Yukemuri Examples</h1>
        <p className="text-xl text-gray-600">
          Complete component examples showing real-world Yukemuri usage
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Examples</h3>
            <nav className="space-y-2">
              {examples.map(example => (
                <button
                  key={example.id}
                  onClick={() => setActiveExample(example.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeExample === example.id
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                      : 'hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium text-sm">{example.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{example.description}</div>
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <a 
                href="/docs" 
                className="text-sm text-blue-600 hover:underline"
              >
                📖 API Documentation
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {examples.find(e => e.id === activeExample)?.title}
              </h2>
              <p className="text-gray-600 mt-1">
                {examples.find(e => e.id === activeExample)?.description}
              </p>
            </div>

            {/* Code */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Complete Component Code</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(codeExamples[activeExample as keyof typeof codeExamples])}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                  >
                    📋 Copy Code
                  </button>
                </div>
                
                <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-800 text-sm font-medium">
                    {activeExample}.tsx
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm">
                      <code>
                        {codeExamples[activeExample as keyof typeof codeExamples]}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* Usage Notes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Usage Notes</h4>
                <div className="text-blue-700 text-sm space-y-2">
                  {activeExample === 'install' && (
                    <div>
                      <p>• This component automatically detects if PWA installation is available</p>
                      <p>• Handles loading states and error cases gracefully</p>
                      <p>• Updates UI when installation status changes</p>
                    </div>
                  )}
                  {activeExample === 'notifications' && (
                    <div>
                      <p>• Manages notification permissions with clear user feedback</p>
                      <p>• Includes push notification subscription for server-sent messages</p>
                      <p>• Provides fallback instructions for denied permissions</p>
                    </div>
                  )}
                  {activeExample === 'qr-share' && (
                    <div>
                      <p>• Generates QR codes on-demand to avoid unnecessary processing</p>
                      <p>• Supports both custom URLs and current page sharing</p>
                      <p>• Includes native Web Share API integration when available</p>
                    </div>
                  )}
                  {activeExample === 'settings' && (
                    <div>
                      <p>• Demonstrates type-safe storage with complex data structures</p>
                      <p>• Combines local storage for speed with persistent storage for sync</p>
                      <p>• Includes cross-tab synchronization and cloud sync status</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t text-center text-gray-500">
        <div className="space-x-4 text-sm">
          <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
          <a href="/docs" className="text-blue-600 hover:underline">API Documentation</a>
          <a href="/about" className="text-blue-600 hover:underline">About</a>
        </div>
      </footer>
    </div>
  )
}