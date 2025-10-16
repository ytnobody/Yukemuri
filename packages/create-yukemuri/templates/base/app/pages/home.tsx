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
    console.log('♨️ [HOME] Requesting notification permission with Yukemuri API')
    console.log('♨️ [HOME] User interaction context check')
    console.log('♨️ [HOME] Document.hasFocus():', document.hasFocus())
    console.log('♨️ [HOME] Document.visibilityState:', document.visibilityState)
    console.log('♨️ [HOME] Window.focus():', window === window.top)
    
    try {
      // Ensure page has focus
      if (!document.hasFocus()) {
        console.log('🔔 [HOME] Page does not have focus, requesting focus...')
        window.focus()
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.error('❌ [HOME] Browser does not support notifications')
        alert('このブラウザは通知をサポートしていません')
        return
      }

      console.log('🔔 [HOME] Current permission before request:', Notification.permission)
      console.log('🔔 [HOME] Browser info:', {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
        isHTTPS: typeof location !== 'undefined' ? location.protocol === 'https:' : false,
        host: typeof location !== 'undefined' ? location.host : 'SSR'
      })
      
      // Show user what we're about to do
      const confirmRequest = confirm('通知許可をリクエストします。ブラウザのダイアログで「許可」を選択してください。')
      if (!confirmRequest) {
        console.log('🔔 [HOME] User cancelled permission request')
        return
      }
      
      const permission = await yu.notifications.requestPermission()
      console.log('🔔 [HOME] Permission result:', permission)
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        console.log('✅ [HOME] Notification permission granted')
        
        // Send test notification using yu.notifications API
        console.log('📢 [HOME] Sending test notification...')
        await yu.notifications.sendNotification('Yukemuri ♨️', {
          body: 'Notifications enabled successfully with Yukemuri API!',
          icon: '/icons/icon-192x192.png'
        })
        console.log('✅ [HOME] Test notification sent')
        alert('✅ 通知が有効になりました！テスト通知を送信しました。')
      } else if (permission === 'denied') {
        console.log('❌ [HOME] Notification permission denied')
        alert('❌ 通知が拒否されました。ブラウザの設定から通知を有効にしてください。\n\n手順:\n1. アドレスバーの🔒アイコンをクリック\n2. 「通知」を「許可」に変更\n3. ページを再読み込み')
      } else {
        console.log('⚠️ [HOME] Notification permission default/dismissed')
        alert('⚠️ 通知の許可が得られませんでした。もう一度お試しください。')
      }
    } catch (error) {
      console.error('❌ [HOME] Notification permission error:', error)
      alert('❌ 通知の設定でエラーが発生しました: ' + error.message)
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
            Status: <span className={`font-semibold ${
              notificationPermission === 'granted' ? 'text-green-600' :
              notificationPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {notificationPermission === 'granted' ? '✅ Granted' :
               notificationPermission === 'denied' ? '❌ Denied' : '⚠️ Not Set'}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={requestNotificationPermission}
              className={`px-4 py-2 rounded text-white ${
                notificationPermission === 'granted'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : notificationPermission === 'denied'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              disabled={notificationPermission === 'granted'}
            >
              {notificationPermission === 'granted' ? 'Already Enabled' :
               notificationPermission === 'denied' ? 'Try Again' : 'Enable Notifications'}
            </button>
            {notificationPermission === 'granted' && (
              <button
                onClick={() => {
                  console.log('📢 [HOME] Sending manual test notification')
                  yu.notifications.sendNotification('Test Notification ♨️', {
                    body: 'Manual test notification from Yukemuri!',
                    icon: '/icons/icon-192x192.png'
                  })
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Send Test
              </button>
            )}
          </div>
          {notificationPermission === 'denied' && (
            <p className="text-xs text-red-600 mt-2">
              ⚠️ 通知が拒否されています。ブラウザの設定（アドレスバーの🔒アイコン）から通知を有効にしてください。
            </p>
          )}
          
          {/* Notification Diagnostics */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
            <h4 className="font-semibold mb-2">🔧 通知診断情報</h4>
            <div className="space-y-1">
              <div>サポート状況: {typeof window !== 'undefined' && 'Notification' in window ? '✅ サポート' : '❌ 未サポート'}</div>
              <div>現在の許可: {notificationPermission}</div>
              <div>HTTPS: {typeof location !== 'undefined' && location.protocol === 'https:' ? '✅' : '❌'}</div>
              <div>フォーカス: {typeof document !== 'undefined' && document.hasFocus() ? '✅' : '❌'}</div>
              <div>ブラウザ: {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').pop() : 'Unknown'}</div>
            </div>
            <button
              onClick={() => {
                if (typeof window === 'undefined') {
                  alert('サーバーサイドレンダリング中のため診断情報を取得できません。')
                  return
                }
                
                const info = {
                  supported: 'Notification' in window,
                  permission: typeof Notification !== 'undefined' ? Notification.permission : 'undefined',
                  https: typeof location !== 'undefined' ? location.protocol === 'https:' : false,
                  focus: document.hasFocus(),
                  userAgent: navigator.userAgent,
                  host: typeof location !== 'undefined' ? location.host : 'SSR'
                }
                console.log('🔧 Notification Diagnostics:', info)
                alert('診断情報をコンソールに出力しました。F12を押してConsoleタブを確認してください。')
              }}
              className="mt-2 px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs"
            >
              診断情報を表示
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}