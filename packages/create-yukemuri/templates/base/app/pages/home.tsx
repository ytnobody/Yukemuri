import { h } from 'preact'
import { useState } from 'preact/hooks'
import CurrentURLQRCode from '../components/CurrentURLQRCode'

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
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  const handleInstall = async () => {
    if ('serviceWorker' in navigator) {
      // Service Worker install prompt logic
      console.log('Install prompt triggered')
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        new Notification('Yukemuri ♨️', {
          body: 'Notifications enabled successfully!',
          icon: '/static/icons/icon-192x192.svg'
        })
      }
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">PWA Features</h2>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <h3 className="font-semibold mb-2">📱 App Installation</h3>
          <button
            onClick={handleInstall}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Install App
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