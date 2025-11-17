import type { DeviceManager, DeviceInfo, ViewportInfo } from "../types.js"

export class DeviceManagerImpl implements DeviceManager {
  get info(): DeviceInfo {
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        userAgent: "",
        viewport: { width: 1920, height: 1080, availableWidth: 1920, availableHeight: 1080 },
        orientation: "landscape",
        pixelRatio: 1,
        platform: "server",
      }
    }

    const userAgent = navigator.userAgent
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent)

    return {
      isMobile: isMobile && !isTablet,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      isTouchDevice: "ontouchstart" in window,
      userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        availableWidth: screen.availWidth,
        availableHeight: screen.availHeight,
      },
      orientation: window.innerWidth > window.innerHeight ? "landscape" : "portrait",
      pixelRatio: window.devicePixelRatio,
      platform: navigator.platform,
    }
  }

  mediaQuery(query: string): boolean {
    if (typeof window === "undefined") return false

    return window.matchMedia(query).matches
  }

  mediaQueries(queries: Record<string, string>): Record<string, boolean> {
    const result: Record<string, boolean> = {}

    for (const [key, query] of Object.entries(queries)) {
      result[key] = this.mediaQuery(query)
    }

    return result
  }

  onViewportChange(callback: (viewport: ViewportInfo) => void): () => void {
    if (typeof window === "undefined") return () => {}

    const handleResize = () => {
      callback(this.info.viewport)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }

  onOrientationChange(callback: (orientation: "portrait" | "landscape") => void): () => void {
    if (typeof window === "undefined") return () => {}

    const handleOrientationChange = () => {
      callback(this.info.orientation)
    }

    window.addEventListener("orientationchange", handleOrientationChange)
    window.addEventListener("resize", handleOrientationChange)

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange)
      window.removeEventListener("resize", handleOrientationChange)
    }
  }
}
