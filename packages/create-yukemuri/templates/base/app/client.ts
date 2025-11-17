import { hydrate } from "preact"
import App from "./routes/index"
import "virtual:uno.css"

// SSRされたHTMLをハイドレート
const app = document.getElementById("app")
if (app) {
  hydrate(App(), app)
}

console.log("♨️ Yukemuri client initialized")

// Service Worker registration (execute immediately - don't wait for load event)
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    console.log("♨️ Service Worker API is available")

    try {
      console.log("♨️ Starting Service Worker registration...")

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      })

      console.log("♨️ Service Worker registered successfully!")
      console.log("   Scope:", registration.scope)
      console.log("   Registration:", registration)

      // Check active Service Worker status
      if (registration.active) {
        console.log("♨️ Service Worker is active:", registration.active.state)
      }

      if (registration.installing) {
        console.log("♨️ Service Worker is installing...")
      }

      if (registration.waiting) {
        console.log("♨️ Service Worker is waiting...")
      }

      // Service Worker の更新をチェック
      registration.addEventListener("updatefound", () => {
        console.log("♨️ Service Worker update found")
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            console.log("♨️ Service Worker state changed:", newWorker.state)
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("♨️ New Service Worker installed, content is cached")
            }
          })
        }
      })

      return registration
    } catch (error) {
      console.error("♨️ Service Worker registration failed:", error)
      console.error("   Error details:", error.message)
      throw error
    }
  } else {
    console.error("❌ Service Worker is not supported in this browser")
    throw new Error("Service Worker not supported")
  }
}

// 即座にService Workerを登録
registerServiceWorker()
  .then(() => {
    console.log("♨️ Service Worker registration completed")
  })
  .catch(error => {
    console.error("♨️ Service Worker registration failed:", error)
  })

// Service Workerの状態変化を監視
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("♨️ Service Worker controller changed")
  })
}
