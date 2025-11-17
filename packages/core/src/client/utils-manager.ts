import type {
  UtilsManager,
  ClipboardManager,
  ShareManager,
  FullscreenManager,
  ShareData,
} from "../types.js"

class ClipboardManagerImpl implements ClipboardManager {
  async copy(text: string): Promise<boolean> {
    if (typeof window === "undefined") return false

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // Fallback for insecure contexts
        const textArea = document.createElement("textarea")
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        const success = document.execCommand("copy")
        document.body.removeChild(textArea)
        return success
      }
    } catch (error) {
      console.error("❌ Clipboard copy failed:", error)
      return false
    }
  }

  async paste(): Promise<string> {
    if (typeof window === "undefined") return ""

    try {
      if (navigator.clipboard && window.isSecureContext) {
        return await navigator.clipboard.readText()
      } else {
        console.warn("⚠️ Clipboard paste not available in insecure context")
        return ""
      }
    } catch (error) {
      console.error("❌ Clipboard paste failed:", error)
      return ""
    }
  }

  get isSupported(): boolean {
    if (typeof window === "undefined") return false

    return !!(navigator.clipboard || document.execCommand)
  }

  get isSecureContext(): boolean {
    if (typeof window === "undefined") return false

    return window.isSecureContext
  }
}

class ShareManagerImpl implements ShareManager {
  async share(data: ShareData): Promise<boolean> {
    if (typeof window === "undefined") return false

    try {
      if (navigator.share && this.canShare(data)) {
        await navigator.share(data)
        return true
      } else {
        console.warn("⚠️ Web Share API not supported")
        return false
      }
    } catch (error) {
      console.error("❌ Share failed:", error)
      return false
    }
  }

  canShare(data?: ShareData): boolean {
    if (typeof window === "undefined") return false

    if (!navigator.share) return false

    if (!data) return true

    // Check if navigator.canShare exists and call it if available
    if (navigator.canShare) {
      return navigator.canShare(data)
    }

    return true
  }

  get isSupported(): boolean {
    if (typeof window === "undefined") return false

    return !!navigator.share
  }
}

class FullscreenManagerImpl implements FullscreenManager {
  async enter(element?: HTMLElement): Promise<void> {
    if (typeof window === "undefined") return

    const target = element || document.documentElement

    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen()
      } else if ((target as any).webkitRequestFullscreen) {
        await (target as any).webkitRequestFullscreen()
      } else if ((target as any).msRequestFullscreen) {
        await (target as any).msRequestFullscreen()
      }
    } catch (error) {
      console.error("❌ Fullscreen enter failed:", error)
    }
  }

  async exit(): Promise<void> {
    if (typeof window === "undefined") return

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }
    } catch (error) {
      console.error("❌ Fullscreen exit failed:", error)
    }
  }

  async toggle(element?: HTMLElement): Promise<void> {
    if (this.isFullscreen) {
      await this.exit()
    } else {
      await this.enter(element)
    }
  }

  get isFullscreen(): boolean {
    if (typeof window === "undefined") return false

    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    )
  }

  get isSupported(): boolean {
    if (typeof window === "undefined") return false

    return !!(
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).msRequestFullscreen
    )
  }

  get element(): Element | null {
    if (typeof window === "undefined") return null

    return (
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement ||
      null
    )
  }
}

export class UtilsManagerImpl implements UtilsManager {
  public readonly clipboard = new ClipboardManagerImpl()
  public readonly share = new ShareManagerImpl()
  public readonly fullscreen = new FullscreenManagerImpl()
}
