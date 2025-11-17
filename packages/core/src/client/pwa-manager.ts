import type { PWAManager, PWAStatus, PWAInstallPrompt } from "../types.js"

declare global {
  interface Window {
    deferredPrompt: PWAInstallPrompt | null
  }
}

export class PWAManagerImpl implements PWAManager {
  private swRegistration: ServiceWorkerRegistration | null = null
  private installPrompt: PWAInstallPrompt | null = null
  private isInitialized = false

  constructor() {
    this.init()
  }

  private async init() {
    if (this.isInitialized || typeof window === "undefined") return
    this.isInitialized = true

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
    if (typeof window === "undefined") return

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

  isInstallable(): boolean {
    if (typeof window === "undefined") return false
    return !!this.installPrompt
  }

  isInstalled(): boolean {
    if (typeof window === "undefined") return false

    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      (window.navigator as any).standalone === true
    )
  }

  getStatus(): PWAStatus {
    if (typeof window === "undefined") {
      return {
        hasServiceWorker: false,
        hasManifest: false,
        isHTTPS: false,
        installPromptAvailable: false,
        isInstalled: false,
        notificationPermission: "default" as NotificationPermission,
      }
    }

    return {
      hasServiceWorker: !!this.swRegistration,
      hasManifest: !!document.querySelector('link[rel="manifest"]'),
      isHTTPS: location.protocol === "https:" || location.hostname === "localhost",
      installPromptAvailable: !!this.installPrompt,
      isInstalled: this.isInstalled(),
      notificationPermission:
        "Notification" in window ? Notification.permission : ("default" as NotificationPermission),
    }
  }

  async install(): Promise<boolean> {
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
}
