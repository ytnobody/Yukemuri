import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'

export default function App() {
  useEffect(() => {
    // UnoCSSロード後にスタイルを強制適用
    const forceEmojiStyle = () => {
      const emojiElements = document.querySelectorAll('.yukemuri-emoji')
      emojiElements.forEach(element => {
        const htmlElement = element as HTMLElement
        htmlElement.style.fontSize = '6rem'
        htmlElement.style.lineHeight = '1'
        htmlElement.style.display = 'block'
      })
    }
    
    // 初回とUnoCSSロード後に適用
    forceEmojiStyle()
    setTimeout(forceEmojiStyle, 100)
    setTimeout(forceEmojiStyle, 500)
  }, [])

  return (
    <div className="container">
      <style dangerouslySetInnerHTML={{
        __html: `
          .yukemuri-emoji {
            font-size: 6rem !important;
            line-height: 1 !important;
            display: block !important;
          }
        `
      }} />
      
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="text-8xl yukemuri-emoji mb-4" style={{ fontSize: '6rem', lineHeight: '1', display: 'block' }}>♨️</div>
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

  // Debug log function
  const addDebugLog = (message: string) => {
    console.log('🐛 DEBUG:', message)
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addDebugLog('PWAFeatures component mounted')
    
    // Check PWA status
    const checkPWAStatus = () => {
      addDebugLog('Checking PWA status...')
      
      // Check installation status
      const installed = window.matchMedia('(display-mode: standalone)').matches ||
                       window.matchMedia('(display-mode: fullscreen)').matches ||
                       (window.navigator as any).standalone === true
      setIsInstalled(installed)
      addDebugLog(`Install status: ${installed}`)
      
      // Check notification permission status
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
        addDebugLog(`Notification permission: ${Notification.permission}`)
      } else {
        addDebugLog('Notification API not available')
      }
    }

    checkPWAStatus()

    // Install prompt event listener
    const handleBeforeInstallPrompt = (e: Event) => {
      addDebugLog('beforeinstallprompt event fired')
      e.preventDefault()
      // @ts-ignore
      window.deferredPrompt = e
      setIsInstallable(true)
      addDebugLog('Install prompt deferred and ready')
    }

    const handleAppInstalled = () => {
      addDebugLog('appinstalled event fired')
      setIsInstalled(true)
      setIsInstallable(false)
      // @ts-ignore
      window.deferredPrompt = null
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check PWA installability periodically
    const checkInstallability = () => {
      // Check if Service Worker is registered
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            addDebugLog('Service Worker is registered')
          } else {
            addDebugLog('Service Worker not registered yet')
          }
        })
      }

      // Check if Manifest is loaded
      const manifestLink = document.querySelector('link[rel="manifest"]')
      if (manifestLink) {
        addDebugLog('Manifest link found in head')
      } else {
        addDebugLog('Manifest link not found - this may prevent PWA installation')
      }
    }

    // Check installability after 2 seconds
    setTimeout(checkInstallability, 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallApp = async () => {
    addDebugLog('Install app button clicked')
    // @ts-ignore
    const deferredPrompt = window.deferredPrompt
    if (deferredPrompt) {
      addDebugLog('Showing install prompt')
      try {
        deferredPrompt.prompt()
        const result = await deferredPrompt.userChoice
        addDebugLog(`Install result: ${result.outcome}`)
        if (result.outcome === 'accepted') {
          addDebugLog('User accepted the install prompt')
          setIsInstallable(false)
        } else {
          addDebugLog('User dismissed the install prompt')
        }
        // @ts-ignore
        window.deferredPrompt = null
      } catch (error) {
        addDebugLog(`Install prompt error: ${error.message}`)
      }
    } else {
      addDebugLog('No deferred prompt available')
      alert('Install prompt is not available.\n\nPlease look for the "Install app" icon in your browser\'s address bar.')
    }
  }

  const requestNotificationPermission = async () => {
    addDebugLog('Notification permission button clicked')
    
    try {
      if (!('Notification' in window)) {
        addDebugLog('Notification API not supported')
        alert('This browser does not support notifications')
        return
      }

      addDebugLog('Requesting notification permission...')
      const permission = await Notification.requestPermission()
      addDebugLog(`Permission result: ${permission}`)
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        addDebugLog('Permission granted, creating welcome notification')
        
        // Simple test notification
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
        alert('Notifications were denied. Please allow them in your browser settings.')
      } else {
        addDebugLog('Permission not determined')
      }
    } catch (error) {
      addDebugLog(`Error requesting permission: ${error.message}`)
      alert('An error occurred while setting up notifications: ' + error.message)
    }
  }

  const sendTestNotification = () => {
    addDebugLog('Test notification button clicked')
    
    if (notificationPermission !== 'granted') {
      addDebugLog('Permission not granted, showing alert')
      alert('Notifications are not allowed. Please enable notifications first.')
      return
    }

    try {
      const messages = [
        { title: 'Yukemuri ♨️', body: 'Hello! This is a notification from the hot spring framework.' },
        { title: 'PWA Update ♨️', body: 'The app has been updated to the latest version!' },
        { title: 'Offline Support ♨️', body: 'You can use this even when the internet is disconnected.' },
        { title: 'Yukemuri Tips ♨️', body: 'Make full use of PWA features for comfortable development!' },
        { title: 'Hot Springs ♨️', body: 'Delivering a relaxing development experience like hot springs.' }
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
      alert('Failed to send notification: ' + error.message)
    }
  }

  // Simple immediate notification test
  const sendImmediateNotification = () => {
    addDebugLog('Immediate notification test started')
    
    if (!('Notification' in window)) {
      addDebugLog('Notification API not available')
      alert('Notification API is not available')
      return
    }
    
    if (Notification.permission !== 'granted') {
      addDebugLog('Permission not granted for immediate notification')
      alert('Notification permission is required')
      return
    }
    
    try {
      addDebugLog('Creating immediate notification...')
      const notification = new Notification('Immediate Test ♨️', {
        body: 'This notification should be displayed immediately',
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

  // 10-second delayed notification test
  const sendDelayedNotification = () => {
    addDebugLog('Delayed notification test started (10 seconds)')
    
    if (!('Notification' in window)) {
      alert('Notification API is not available')
      return
    }
    
    if (Notification.permission !== 'granted') {
      alert('Notification permission is required')
      return
    }
    
    // Countdown display
    let countdown = 10
    const countdownInterval = setInterval(() => {
      addDebugLog(`Delayed notification in ${countdown} seconds...`)
      countdown--
      
      if (countdown <= 0) {
        clearInterval(countdownInterval)
      }
    }, 1000)
    
    // Send notification after 10 seconds
    setTimeout(() => {
      try {
        addDebugLog('Creating delayed notification now!')
        
        const notification = new Notification('Yukemuri Delayed Notification ♨️', {
          body: 'This is a 10-second delayed notification test. Background notification verification!',
          tag: 'delayed-test',
          requireInteraction: true // Requires manual closing
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
          window.focus() // Focus window
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
    
    // Immediate user feedback
    alert('⏰ A notification will appear in 10 seconds.\n\nPlease put the page in the background and test if the notification comes!')
  }

  // Desktop notification + dialog combined test
  const sendVisibleNotification = () => {
    addDebugLog('Visible notification test started')
    
    if (!('Notification' in window)) {
      alert('Notification API is not available')
      return
    }
    
    if (Notification.permission !== 'granted') {
      alert('Notification permission is required')
      return
    }
    
    try {
      // Desktop notification
      const notification = new Notification('Yukemuri Verification Test ♨️', {
        body: 'Testing with both desktop notification and alert dialog',
        tag: 'visible-test'
      })
      
      addDebugLog('Visible notification created')
      
      notification.onshow = () => {
        addDebugLog('Visible notification shown')
        // Show alert when notification is displayed
        setTimeout(() => {
          alert('✅ Desktop notification displayed successfully!\n\nIf you cannot see the notification, please check Windows notification settings or focus mode.')
        }, 100)
      }
      
      notification.onerror = (e) => {
        addDebugLog(`Visible notification error: ${e}`)
        alert('❌ Failed to display notification')
      }
      
      notification.onclick = () => {
        addDebugLog('Visible notification clicked')
        notification.close()
      }
      
      // Fallback if notification is not displayed
      setTimeout(() => {
        alert('📋 Notification test completed\n\nIf notifications are not visible on Windows:\n1. Check Windows Settings > System > Notifications\n2. Check if focus mode is off\n3. Check browser notification settings')
        notification.close()
      }, 2000)
      
    } catch (error) {
      addDebugLog(`Visible notification failed: ${error.message}`)
      alert(`Notification creation failed: ${error.message}`)
    }
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
        {/* Installation Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">App Installation</h4>
            <p className="text-sm text-gray-600">
              {isInstalled ? 'App is installed as PWA' : 
               isInstallable ? 'App is ready to install' : 
               'App will be installable after PWA criteria are met'}
            </p>
            {!isInstalled && !isInstallable && (
              <p className="text-xs text-gray-500 mt-1">
                The "📱 Install App" icon will appear in your browser's address bar
              </p>
            )}
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
            {!isInstallable && !isInstalled && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                ⏳ Loading...
              </span>
            )}
          </div>
        </div>

        {/* Notification Features */}
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
                  ⚡ Immediate Test
                </button>
                <button 
                  onClick={sendDelayedNotification}
                  className="btn-secondary text-sm"
                >
                  ⏰ 10-second Test
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

        {/* Offline Features */}
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

