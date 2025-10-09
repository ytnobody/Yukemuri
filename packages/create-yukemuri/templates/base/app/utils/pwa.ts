// Yukemuri PWA Utils ♨️

export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    deferredPrompt: PWAInstallPrompt | null
  }
}

export class YukemariPWA {
  private static instance: YukemariPWA
  private swRegistration: ServiceWorkerRegistration | null = null
  private installPrompt: PWAInstallPrompt | null = null

  private constructor() {
    this.init()
  }

  static getInstance(): YukemariPWA {
    if (!YukemariPWA.instance) {
      YukemariPWA.instance = new YukemariPWA()
    }
    return YukemariPWA.instance
  }

  private async init() {
    console.log('♨️ Initializing Yukemari PWA...')
    
    // Service Worker の登録
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        console.log('✅ Service Worker registered:', this.swRegistration.scope)
        
        // 更新チェック
        this.swRegistration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker update found')
          this.handleServiceWorkerUpdate()
        })
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error)
      }
    }

    // PWAインストールプロンプトの処理
    this.setupInstallPrompt()
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 PWA install prompt ready')
      e.preventDefault()
      this.installPrompt = e as any as PWAInstallPrompt
      window.deferredPrompt = this.installPrompt
      
      // カスタムインストールボタンを表示
      this.showInstallButton()
    })

    window.addEventListener('appinstalled', () => {
      console.log('🎉 PWA installed successfully')
      this.installPrompt = null
      window.deferredPrompt = null
      this.hideInstallButton()
    })
  }

  // PWAがインストール可能かチェック
  isInstallable(): boolean {
    return !!this.installPrompt
  }

  // PWAがインストール済みかチェック
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (window.navigator as any).standalone === true
  }

  // PWAインストールプロンプトを表示
  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn('⚠️ Install prompt not available')
      return false
    }

    try {
      await this.installPrompt.prompt()
      const result = await this.installPrompt.userChoice
      
      console.log('📊 Install prompt result:', result.outcome)
      
      if (result.outcome === 'accepted') {
        console.log('✅ User accepted PWA install')
        return true
      } else {
        console.log('❌ User dismissed PWA install')
        return false
      }
    } catch (error) {
      console.error('❌ Install prompt failed:', error)
      return false
    }
  }

  // Push通知の許可を要求
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('⚠️ This browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    // 許可を要求
    const permission = await Notification.requestPermission()
    console.log('🔔 Notification permission:', permission)
    
    return permission
  }

  // Push通知の購読
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('❌ Service Worker not registered')
      return null
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // VAPID公開鍵（実際の実装では環境変数から取得）
          'YOUR_VAPID_PUBLIC_KEY_HERE'
        ) as BufferSource
      })

      console.log('📬 Push subscription created:', subscription)
      return subscription
    } catch (error) {
      console.error('❌ Push subscription failed:', error)
      return null
    }
  }

  // テスト通知を送信
  async sendTestNotification(title: string = 'Yukemari ♨️', body: string = 'PWA notification test') {
    const permission = await this.requestNotificationPermission()
    
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'yukemari-test'
      })
    }
  }

  private handleServiceWorkerUpdate() {
    if (this.swRegistration?.waiting) {
      // 新しいService Workerが利用可能
      if (confirm('🔄 アプリの新しいバージョンが利用可能です。今すぐ更新しますか？')) {
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }
    }
  }

  private showInstallButton() {
    // カスタムインストールボタンの表示ロジック
    const installButton = document.getElementById('pwa-install-button')
    if (installButton) {
      installButton.style.display = 'block'
    }
  }

  private hideInstallButton() {
    // カスタムインストールボタンの非表示ロジック
    const installButton = document.getElementById('pwa-install-button')
    if (installButton) {
      installButton.style.display = 'none'
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

// グローバルインスタンス
export const pwa = YukemariPWA.getInstance()