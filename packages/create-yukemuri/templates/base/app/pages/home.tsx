import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import CurrentURLQRCode from '../components/CurrentURLQRCode'
import { Yukemuri } from '../lib/yukemuri'

const yu = new Yukemuri()

export default function Home() {
  return (
    <div className="container">
      <div className="text-center mb-8">
        <div className="text-8xl">
          <div>♨️</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Yukemuri!
        </h1>
        <p className="text-xl text-gray-600">
          This is a Hono + Preact powered PWA framework with file-based routing.
        </p>
      </div>
      
      <CurrentURLQRCode />
      
      <Counter />
      
      <PWAFeatures />
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className="mr-3">⚡</span>
            <span>Edge-first with Cloudflare Workers</span>
          </li>
          <li className="flex items-center">
            <span className="mr-3">🔒</span>
            <span>Type-safe with TypeScript</span>
          </li>
          <li className="flex items-center">
            <span className="mr-3">📱</span>
            <span>PWA Ready with Service Worker</span>
          </li>
          <li className="flex items-center">
            <span className="mr-3">🎨</span>
            <span>UnoCSS for styling</span>
          </li>
          <li className="flex items-center">
            <span className="mr-3">🛣️</span>
            <span>File-based routing with preact-router</span>
          </li>
        </ul>
      </div>
      
      <div className="text-center">
        <p className="text-gray-600">
          Start building your PWA by editing files in <code className="bg-gray-100 px-2 py-1 rounded">app/routes/</code>
        </p>
      </div>
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Interactive Counter</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg mb-4">Count: <span className="font-bold text-blue-600">{count}</span></p>
        <div className="space-x-2">
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            +1
          </button>
          <button
            onClick={() => setCount(count - 1)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            -1
          </button>
          <button
            onClick={() => setCount(0)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

function PWAFeatures() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [pwaStatus, setPwaStatus] = useState<any>(null)

  // 新しいYukemuri APIを使用したPWA機能
  useEffect(() => {
    const initPWAStatus = async () => {
      console.log('♨️ Initializing PWA status with Yukemuri API')
      
      // yu.pwa API を使用
      const status = yu.pwa.getStatus()
      setPwaStatus(status)
      
      setIsInstallable(yu.pwa.isInstallable())
      setIsInstalled(yu.pwa.isInstalled())
      setNotificationPermission(yu.notifications.getPermissionStatus())
      
      console.log('✅ PWA status loaded:', status)
    }

    initPWAStatus()
    
    // 定期的に状態をチェック
    const interval = setInterval(initPWAStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleInstall = async () => {
    console.log('♨️ Attempting PWA install with Yukemuri API')
    
    try {
      const success = await yu.pwa.install()
      if (success) {
        console.log('✅ PWA installed successfully')
        setIsInstalled(true)
        setIsInstallable(false)
      } else {
        console.log('❌ PWA install cancelled or failed')
      }
    } catch (error) {
      console.error('❌ PWA install error:', error)
    }
  }

  const requestNotificationPermission = async () => {
    console.log('♨️ Requesting notification permission with Yukemuri API')
    
    try {
      const permission = await yu.notifications.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted')
        
        // Send test notification using yu.notifications API
        await yu.notifications.sendNotification('Yukemuri ♨️', {
          body: 'Notifications enabled successfully with Yukemuri API!',
          icon: '/icons/icon-192x192.png'
        })
      } else {
        console.log('❌ Notification permission denied')
      }
    } catch (error) {
      console.error('❌ Notification permission error:', error)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">PWA Features (Yukemuri API)</h2>
      
      {/* PWA Status Debug Info */}
      {pwaStatus && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm">
          <h3 className="font-semibold mb-2">🔍 PWA Status Debug</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Service Worker: {pwaStatus.hasServiceWorker ? '✅' : '❌'}</div>
            <div>Manifest: {pwaStatus.hasManifest ? '✅' : '❌'}</div>
            <div>HTTPS: {pwaStatus.isHTTPS ? '✅' : '❌'}</div>
            <div>Install Prompt: {pwaStatus.installPromptAvailable ? '✅' : '❌'}</div>
            <div>Installed: {pwaStatus.isInstalled ? '✅' : '❌'}</div>
            <div>Notifications: {pwaStatus.notificationPermission}</div>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <h3 className="font-semibold mb-2">📱 App Installation</h3>
          <p className="text-sm text-gray-600 mb-2">
            Installable: {isInstallable ? '✅ Yes' : '❌ No'} | 
            Installed: {isInstalled ? '✅ Yes' : '❌ No'}
          </p>
          <button
            onClick={handleInstall}
            className={`px-4 py-2 rounded text-white ${
              isInstallable 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!isInstallable}
          >
            {isInstalled ? 'Already Installed' : 'Install App'}
          </button>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">🔔 Push Notifications</h3>
          <p className="text-sm text-gray-600 mb-2">
            Status: {notificationPermission}
          </p>
          <button
            onClick={requestNotificationPermission}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  )
}