# Yukemuri Framework Examples

Complete examples showing how to use Yukemuri APIs in real applications.

## 1. PWA Installation Component

```typescript
import { h } from 'preact'
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
}
```

## 2. Notification Manager Component

```typescript
import { h } from 'preact'
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
}
```

## 3. QR Code Share Component

```typescript
import { h } from 'preact'
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
      yu.qr.download(qrCode, `share-${Date.now()}.png`)
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
}
```

## 4. Settings Manager with Storage

```typescript
import { h } from 'preact'
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

      {/* Language Setting */}
      <div>
        <label className="block text-sm font-medium mb-2">Language</label>
        <select 
          value={settings.language}
          onChange={(e) => updateSetting('language', e.currentTarget.value as AppSettings['language'])}
          className="w-full p-2 border rounded"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ja">日本語</option>
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

      {/* Data Usage */}
      <div>
        <label className="block text-sm font-medium mb-2">Data Usage</label>
        <div className="space-x-4">
          {(['low', 'normal', 'high'] as const).map(level => (
            <label key={level} className="inline-flex items-center">
              <input 
                type="radio"
                name="dataUsage"
                value={level}
                checked={settings.dataUsage === level}
                onChange={(e) => updateSetting('dataUsage', e.currentTarget.value as AppSettings['dataUsage'])}
                className="mr-1"
              />
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </label>
          ))}
        </div>
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
}
```

## 5. Complete App with All Features

```typescript
import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { yu } from '../lib/yukemuri'
import InstallPrompt from './InstallPrompt'
import NotificationManager from './NotificationManager'
import ShareQR from './ShareQR'
import SettingsManager from './SettingsManager'

export default function YukemuriDemo() {
  const [activeTab, setActiveTab] = useState('pwa')
  const [pwaTesting, setPwaTesting] = useState(false)

  // Test all Yukemuri features
  const runFullTest = async () => {
    setPwaTesting(true)
    console.log('🧪 Running Yukemuri feature test...')

    try {
      // 1. Test PWA status
      const status = yu.pwa.getStatus()
      console.log('PWA Status:', status)

      // 2. Test notification permission
      const permission = yu.notifications.getPermissionStatus()
      console.log('Notification Permission:', permission)

      // 3. Test QR code generation
      const qr = await yu.qr.generate('https://yukemuri.dev', { size: 100 })
      console.log('QR Code generated:', qr.length, 'characters')

      // 4. Test storage
      const testStorage = yu.storage.local('test', { count: 0 })
      testStorage.set({ count: testStorage.get().count + 1 })
      console.log('Storage test:', testStorage.get())

      console.log('✅ All Yukemuri features working!')
    } catch (error) {
      console.error('❌ Feature test failed:', error)
    } finally {
      setPwaTesting(false)
    }
  }

  const tabs = [
    { id: 'pwa', label: '📱 PWA', component: <InstallPrompt /> },
    { id: 'notifications', label: '🔔 Notifications', component: <NotificationManager /> },
    { id: 'qr', label: '📱 QR Share', component: <ShareQR /> },
    { id: 'settings', label: '⚙️ Settings', component: <SettingsManager /> }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">♨️ Yukemuri Demo</h1>
        <p className="text-gray-600">
          Progressive Web App framework with powerful client APIs
        </p>
        
        <button 
          onClick={runFullTest}
          disabled={pwaTesting}
          className="mt-4 bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {pwaTesting ? 'Testing...' : '🧪 Test All Features'}
        </button>
      </header>

      {/* Tab Navigation */}
      <nav className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="bg-white rounded-lg shadow-sm border p-6">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>
          Built with ♨️ Yukemuri Framework | 
          <a href="./YUKEMURI_API.md" className="text-blue-500 ml-1">
            View API Documentation
          </a>
        </p>
      </footer>
    </div>
  )
}
```

These examples demonstrate how to build complete, production-ready components using Yukemuri's APIs. Each component handles loading states, errors, and provides a smooth user experience while leveraging the full power of the framework.