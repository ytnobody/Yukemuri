import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'

export default function App() {
  return (
    <div className="container">
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="text-8xl mb-4">♨️</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Yukemuri!
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
            <span className="mr-3">📱</span>
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
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // デバッグログ用関数
  const addDebugLog = (message: string) => {
    console.log('🐛 DEBUG:', message)
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addDebugLog('PWAFeatures component mounted')
    
    // PWA状態をチェック
    const checkPWAStatus = () => {
      addDebugLog('Checking PWA status...')
      
      // インストール状態をチェック
      const installed = window.matchMedia('(display-mode: standalone)').matches ||
                       window.matchMedia('(display-mode: fullscreen)').matches ||
                       (window.navigator as any).standalone === true
      setIsInstalled(installed)
      addDebugLog(`Install status: ${installed}`)
      
      // 通知許可状態をチェック
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
        addDebugLog(`Notification permission: ${Notification.permission}`)
      } else {
        addDebugLog('Notification API not available')
      }
    }

    checkPWAStatus()

    // Install prompt イベントリスナー
    const handleBeforeInstallPrompt = (e: Event) => {
      addDebugLog('beforeinstallprompt event fired')
      e.preventDefault()
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      addDebugLog('appinstalled event fired')
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
    addDebugLog('Install app button clicked')
    const deferredPrompt = (window as any).deferredPrompt
    if (deferredPrompt) {
      addDebugLog('Showing install prompt')
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      addDebugLog(`Install result: ${result.outcome}`)
      if (result.outcome === 'accepted') {
        setIsInstallable(false)
      }
    } else {
      addDebugLog('No deferred prompt available')
    }
  }

  const requestNotificationPermission = async () => {
    addDebugLog('Notification permission button clicked')
    
    try {
      if (!('Notification' in window)) {
        addDebugLog('Notification API not supported')
        alert('このブラウザは通知をサポートしていません')
        return
      }

      addDebugLog('Requesting notification permission...')
      const permission = await Notification.requestPermission()
      addDebugLog(`Permission result: ${permission}`)
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        addDebugLog('Permission granted, creating welcome notification')
        
        // シンプルなテスト通知
        try {
          const notification = new Notification('Yukemuri ♨️', {
            body: 'Notifications enabled successfully!',
            tag: 'yukemuri-welcome'
          })
          
          addDebugLog('Welcome notification created successfully')
          
          notification.onshow = () => {
            addDebugLog('Welcome notification shown')
          }
          
          notification.onerror = (error) => {
            addDebugLog(`Welcome notification error: ${error}`)
          }
          
          notification.onclick = () => {
            addDebugLog('Welcome notification clicked')
            notification.close()
          }
          
          // 3秒後に自動で閉じる
          setTimeout(() => {
            addDebugLog('Closing welcome notification')
            notification.close()
          }, 3000)
          
        } catch (notificationError) {
          addDebugLog(`Failed to create welcome notification: ${notificationError.message}`)
        }
        
      } else if (permission === 'denied') {
        addDebugLog('Permission denied')
        alert('通知が拒否されました。ブラウザの設定で許可してください。')
      } else {
        addDebugLog('Permission not determined')
      }
    } catch (error) {
      addDebugLog(`Error requesting permission: ${error.message}`)
      alert('通知の設定中にエラーが発生しました: ' + error.message)
    }
  }

  const sendTestNotification = () => {
    addDebugLog('Test notification button clicked')
    
    if (notificationPermission !== 'granted') {
      addDebugLog('Permission not granted, showing alert')
      alert('通知が許可されていません。まず通知を有効にしてください。')
      return
    }

    try {
      const messages = [
        { title: 'Yukemuri ♨️', body: 'こんにちは！温泉フレームワークからお知らせです。' },
        { title: 'PWA更新 ♨️', body: 'アプリが最新版に更新されました！' },
        { title: 'オフライン対応 ♨️', body: 'インターネットが切断されてもご利用いただけます。' },
        { title: 'Yukemuri Tips ♨️', body: 'PWA機能をフル活用して快適な開発を！' },
        { title: 'Hot Springs ♨️', body: '温泉のようにリラックスできる開発体験をお届け。' }
      ]
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      addDebugLog(`Sending notification: ${randomMessage.title}`)
      
      const notification = new Notification(randomMessage.title, {
        body: randomMessage.body,
        tag: 'yukemuri-test',
        requireInteraction: false
      })
      
      addDebugLog('Test notification created')
      
      notification.onshow = () => {
        addDebugLog('Test notification shown')
      }
      
      notification.onerror = (error) => {
        addDebugLog(`Test notification error: ${error}`)
      }
      
      notification.onclick = () => {
        addDebugLog('Test notification clicked')
        window.focus()
        notification.close()
      }
      
      // 5秒後に自動で閉じる
      setTimeout(() => {
        addDebugLog('Closing test notification')
        notification.close()
      }, 5000)
      
    } catch (error) {
      addDebugLog(`Failed to send test notification: ${error.message}`)
      alert('通知の送信に失敗しました: ' + error.message)
    }
  }

  // シンプルな即座通知テスト
  const sendImmediateNotification = () => {
    addDebugLog('Immediate notification test started')
    
    if (!('Notification' in window)) {
      addDebugLog('Notification API not available')
      alert('通知APIが利用できません')
      return
    }
    
    if (Notification.permission !== 'granted') {
      addDebugLog('Permission not granted for immediate notification')
      alert('通知許可が必要です')
      return
    }
    
    try {
      addDebugLog('Creating immediate notification...')
      const notification = new Notification('即座テスト ♨️', {
        body: 'この通知は即座に表示されるはずです',
        tag: 'immediate-test'
      })
      
      addDebugLog('Immediate notification created')
      
      notification.onshow = () => addDebugLog('Immediate notification shown')
      notification.onerror = (e) => addDebugLog(`Immediate notification error: ${e}`)
      notification.onclick = () => {
        addDebugLog('Immediate notification clicked')
        notification.close()
      }
      
      setTimeout(() => notification.close(), 3000)
      
    } catch (error) {
      addDebugLog(`Immediate notification failed: ${error.message}`)
    }
  }

  // 10秒後遅延通知テスト
  const sendDelayedNotification = () => {
    addDebugLog('Delayed notification test started (10 seconds)')
    
    if (!('Notification' in window)) {
      alert('通知APIが利用できません')
      return
    }
    
    if (Notification.permission !== 'granted') {
      alert('通知許可が必要です')
      return
    }
    
    // カウントダウン表示
    let countdown = 10
    const countdownInterval = setInterval(() => {
      addDebugLog(`Delayed notification in ${countdown} seconds...`)
      countdown--
      
      if (countdown <= 0) {
        clearInterval(countdownInterval)
      }
    }, 1000)
    
    // 10秒後に通知を送信
    setTimeout(() => {
      try {
        addDebugLog('Creating delayed notification now!')
        
        const notification = new Notification('Yukemuri 遅延通知 ♨️', {
          body: '10秒後に表示される通知テストです。バックグラウンドからの通知確認！',
          tag: 'delayed-test',
          requireInteraction: true // 手動で閉じる必要がある
        })
        
        addDebugLog('Delayed notification created')
        
        notification.onshow = () => {
          addDebugLog('Delayed notification shown successfully!')
        }
        
        notification.onerror = (e) => {
          addDebugLog(`Delayed notification error: ${e}`)
        }
        
        notification.onclick = () => {
          addDebugLog('Delayed notification clicked')
          window.focus() // ウィンドウをフォーカス
          notification.close()
        }
        
        // 15秒後に自動クローズ（通常より長め）
        setTimeout(() => {
          addDebugLog('Auto-closing delayed notification')
          notification.close()
        }, 15000)
        
      } catch (error) {
        addDebugLog(`Failed to create delayed notification: ${error.message}`)
      }
    }, 10000) // 10秒 = 10000ms
    
    // 即座にユーザーにフィードバック
    alert('⏰ 10秒後に通知が表示されます。\n\nページをバックグラウンドに送って、通知が来るかテストしてください！')
  }

  return (
    <div className="card mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">PWA Features ♨️</h3>
      
      {/* デバッグ情報 */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-medium text-yellow-900 mb-2">🐛 Debug Info</h4>
        <div className="text-xs text-yellow-800 space-y-1">
          {debugInfo.map((info, index) => (
            <div key={index}>{info}</div>
          ))}
        </div>
      </div>
      
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
              <>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  🔔 Enabled
                </span>
                <button 
                  onClick={sendTestNotification}
                  className="btn-primary text-sm"
                >
                  📨 Send Test
                </button>
                <button 
                  onClick={sendImmediateNotification}
                  className="btn-secondary text-sm"
                >
                  ⚡ 即座テスト
                </button>
                <button 
                  onClick={sendDelayedNotification}
                  className="btn-secondary text-sm"
                >
                  ⏰ 10秒後テスト
                </button>
              </>
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

  // デスクトップ通知 + ダイアログ併用テスト
  const sendVisibleNotification = () => {
    addDebugLog('Visible notification test started')
    
    if (!('Notification' in window)) {
      alert('通知APIが利用できません')
      return
    }
    
    if (Notification.permission !== 'granted') {
      alert('通知許可が必要です')
      return
    }
    
    try {
      // デスクトップ通知
      const notification = new Notification('Yukemuri 確認テスト ♨️', {
        body: 'デスクトップ通知 + アラートダイアログの両方でテストします',
        tag: 'visible-test'
      })
      
      addDebugLog('Visible notification created')
      
      notification.onshow = () => {
        addDebugLog('Visible notification shown')
        // 通知が表示されたらアラートも表示
        setTimeout(() => {
          alert('✅ デスクトップ通知が正常に表示されました！\n\n通知が見えない場合は、Windows の通知設定や集中モードを確認してください。')
        }, 100)
      }
      
      notification.onerror = (e) => {
        addDebugLog(`Visible notification error: ${e}`)
        alert('❌ 通知の表示に失敗しました')
      }
      
      notification.onclick = () => {
        addDebugLog('Visible notification clicked')
        notification.close()
      }
      
      // 通知が表示されない場合のフォールバック
      setTimeout(() => {
        alert('📋 通知テスト完了\n\nWindows で通知が見えない場合：\n1. Windows設定 > システム > 通知 を確認\n2. 集中モードがオフか確認\n3. ブラウザの通知設定を確認')
        notification.close()
      }, 2000)
      
    } catch (error) {
      addDebugLog(`Visible notification failed: ${error.message}`)
      alert(`通知作成失敗: ${error.message}`)
    }
  }

