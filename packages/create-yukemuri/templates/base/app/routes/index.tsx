import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'

export default function App() {
  return (
    <div className="container">
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="text-8xl mb-4">♨️</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Yukemari!
        </h1>
        <p className="text-xl text-gray-600">
          This is a Hono + Preact powered PWA framework.
        </p>
      </div>
      
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
            <span className="mr-3">🚀</span>
            <span>Fast development with Hono</span>
          </li>
          <li className="flex items-center">
            <span className="mr-3">⚛️</span>
            <span>Interactive UI with Preact</span>
          </li>
          <li className="flex items-center">
            <span className="mr-3">�</span>
            <span>PWA features: installable, offline-ready, push notifications</span>
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Examples</h2>
        <div className="space-y-2">
          <p>
            <a 
              href="/api/users" 
              className="text-primary-600 hover:text-primary-800 underline"
            >
              GET /api/users
            </a>
            <span className="text-gray-600 ml-2">- Get users list</span>
          </p>
          <p>
            <a 
              href="/api/health" 
              className="text-primary-600 hover:text-primary-800 underline"
            >
              GET /api/health
            </a>
            <span className="text-gray-600 ml-2">- Health check</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="card mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Counter</h3>
      <p className="text-lg mb-6">
        Current count: <strong className="text-primary-600">{count}</strong>
      </p>
      <div className="flex gap-3">
        <button 
          className="btn-primary"
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
        <button 
          className="btn-danger"
          onClick={() => setCount(count - 1)}
        >
          Decrement
        </button>
        <button 
          className="btn-secondary"
          onClick={() => setCount(0)}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function PWAFeatures() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // PWA状態をチェック
    const checkPWAStatus = () => {
      // インストール状態をチェック
      const installed = window.matchMedia('(display-mode: standalone)').matches ||
                       window.matchMedia('(display-mode: fullscreen)').matches ||
                       (window.navigator as any).standalone === true
      setIsInstalled(installed)
      
      // 通知許可状態をチェック
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
      }
    }

    checkPWAStatus()

    // Install prompt イベントリスナー
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallApp = async () => {
    const deferredPrompt = (window as any).deferredPrompt
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      console.log('Install result:', result.outcome)
      if (result.outcome === 'accepted') {
        setIsInstallable(false)
      }
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        // テスト通知を送信
        new Notification('Yukemari ♨️', {
          body: 'Notifications enabled successfully!',
          icon: '/icons/icon-192x192.png'
        })
      }
    }
  }

  return (
    <div className="card mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">PWA Features ♨️</h3>
      
      <div className="space-y-4">
        {/* インストール状態 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">App Installation</h4>
            <p className="text-sm text-gray-600">
              {isInstalled ? 'App is installed' : 'App can be installed as PWA'}
            </p>
          </div>
          <div className="flex gap-2">
            {isInstalled && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                ✅ Installed
              </span>
            )}
            {isInstallable && !isInstalled && (
              <button 
                onClick={handleInstallApp}
                className="btn-primary"
                id="pwa-install-button"
              >
                📱 Install App
              </button>
            )}
          </div>
        </div>

        {/* 通知機能 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Push Notifications</h4>
            <p className="text-sm text-gray-600">
              Status: {notificationPermission === 'granted' ? 'Enabled' : 
                      notificationPermission === 'denied' ? 'Blocked' : 'Not requested'}
            </p>
          </div>
          <div className="flex gap-2">
            {notificationPermission === 'granted' && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                🔔 Enabled
              </span>
            )}
            {notificationPermission !== 'granted' && (
              <button 
                onClick={requestNotificationPermission}
                className="btn-secondary"
              >
                🔔 Enable Notifications
              </button>
            )}
          </div>
        </div>

        {/* オフライン機能 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Offline Support</h4>
            <p className="text-sm text-gray-600">
              Service Worker caches resources for offline use
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            🔄 Active
          </span>
        </div>
      </div>
    </div>
  )
}