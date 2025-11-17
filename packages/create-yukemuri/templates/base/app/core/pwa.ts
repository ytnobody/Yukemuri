// Yukemuri PWA Utils ♨️

export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
  interface Window {
    deferredPrompt: PWAInstallPrompt | null
  }
}

export class YukemuriPWA {
  private static instance: YukemuriPWA
  private swRegistration: ServiceWorkerRegistration | null = null
  private installPrompt: PWAInstallPrompt | null = null

  private constructor() {
    this.init()
  }

  static getInstance(): YukemuriPWA {
    if (!YukemuriPWA.instance) {
      YukemuriPWA.instance = new YukemuriPWA()
    }
    return YukemuriPWA.instance
  }

  private async init() {
    console.log("♨️ Initializing Yukemuri PWA...")

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })
        console.log("✅ Service Worker registered:", this.swRegistration.scope)

        // Check for updates
        this.swRegistration.addEventListener("updatefound", () => {
          console.log("🔄 Service Worker update found")
          this.handleServiceWorkerUpdate()
        })
      } catch (error) {
        console.error("❌ Service Worker registration failed:", error)
      }
    }

    // Setup PWA install prompt handling
    this.setupInstallPrompt()
  }

  private setupInstallPrompt() {
    window.addEventListener("beforeinstallprompt", e => {
      console.log("📱 PWA install prompt ready")
      e.preventDefault()
      this.installPrompt = e as any as PWAInstallPrompt
      window.deferredPrompt = this.installPrompt

      // Show custom install button
      this.showInstallButton()
    })

    window.addEventListener("appinstalled", () => {
      console.log("🎉 PWA installed successfully")
      this.installPrompt = null
      window.deferredPrompt = null
      this.hideInstallButton()
    })
  }

  // Check if PWA is installable
  isInstallable(): boolean {
    return !!this.installPrompt
  }

  // Check if PWA is already installed
  isInstalled(): boolean {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      (window.navigator as any).standalone === true
    )
  }

  // Debug: Check PWA status
  getPWAStatus() {
    return {
      hasServiceWorker: !!this.swRegistration,
      hasManifest: !!document.querySelector('link[rel="manifest"]'),
      isHTTPS: location.protocol === "https:" || location.hostname === "localhost",
      installPromptAvailable: !!this.installPrompt,
      isInstalled: this.isInstalled(),
      notificationPermission: "Notification" in window ? Notification.permission : "not supported",
    }
  }

  // Show PWA install prompt
  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn("⚠️ Install prompt not available")
      return false
    }

    try {
      await this.installPrompt.prompt()
      const result = await this.installPrompt.userChoice

      console.log("📊 Install prompt result:", result.outcome)

      if (result.outcome === "accepted") {
        console.log("✅ User accepted PWA install")
        return true
      } else {
        console.log("❌ User dismissed PWA install")
        return false
      }
    } catch (error) {
      console.error("❌ Install prompt failed:", error)
      return false
    }
  }

  // Request push notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("⚠️ This browser does not support notifications")
      return "denied"
    }

    if (Notification.permission === "granted") {
      return "granted"
    }

    if (Notification.permission === "denied") {
      return "denied"
    }

    // Request permission
    const permission = await Notification.requestPermission()
    console.log("🔔 Notification permission:", permission)

    return permission
  }

  // Subscribe to push notifications (VAPID-compatible)
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error("❌ Service Worker not registered")
      return null
    }

    try {
      // Get VAPID public key from environment variables
      const vapidPublicKey = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        console.log("💡 VAPID public key not configured")
        console.log("💡 To enable push notifications:")
        console.log("1. Add VITE_VAPID_PUBLIC_KEY=your_public_key to .env file")
        console.log("2. Generate VAPID key pair: npm run generate-vapid")
        return null
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      })

      console.log("📬 Push subscription successful:", subscription)
      return subscription
    } catch (error) {
      console.error("❌ Push subscription failed:", error)
      return null
    }
  }

  // Send test notification
  async sendTestNotification(title: string = "Yukemuri ♨️", body: string = "PWA notification test") {
    const permission = await this.requestNotificationPermission()

    if (permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        tag: "yukemuri-test",
      })
    }
  }

  private handleServiceWorkerUpdate() {
    if (this.swRegistration?.waiting) {
      // New Service Worker is available
      if (confirm("🔄 A new version of the app is available. Would you like to update now?")) {
        this.swRegistration.waiting.postMessage({ type: "SKIP_WAITING" })
        window.location.reload()
      }
    }
  }

  private showInstallButton() {
    // Custom install button display logic
    const installButton = document.getElementById("pwa-install-button")
    if (installButton) {
      installButton.style.display = "block"
    }
  }

  private hideInstallButton() {
    // Custom install button hide logic
    const installButton = document.getElementById("pwa-install-button")
    if (installButton) {
      installButton.style.display = "none"
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

// Global instance
export const pwa = YukemuriPWA.getInstance()
