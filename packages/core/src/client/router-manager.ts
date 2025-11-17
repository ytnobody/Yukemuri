import type { RouterManager } from "../types.js"

/**
 * Router parameter matcher for file-based routing
 * Matches URLs to route patterns like:
 * - /users/:id
 * - /blog/*slug (catch-all)
 * - /docs/**slug (optional catch-all)
 */
class RoutePatternMatcher {
  private routePattern: string
  private segments: SegmentPattern[]

  constructor(routePattern: string) {
    this.routePattern = routePattern
    this.segments = this.parsePattern(routePattern)
  }

  private parsePattern(pattern: string): SegmentPattern[] {
    if (!pattern || pattern === "/") return []

    return pattern
      .split("/")
      .filter(s => s !== "")
      .map(segment => {
        if (segment.startsWith(":")) {
          // Dynamic segment :id
          return { type: "dynamic", name: segment.slice(1) }
        } else if (segment.startsWith("**")) {
          // Optional catch-all segment **slug
          return { type: "catchall", name: segment.slice(2) }
        } else if (segment.startsWith("*")) {
          // Catch-all segment *slug
          return { type: "catchall", name: segment.slice(1) }
        } else {
          // Static segment
          return { type: "static", name: segment }
        }
      })
  }

  match(url: string): Record<string, string> | null {
    const urlSegments = url.split("/").filter(s => s !== "")
    const params: Record<string, string> = {}
    let urlIndex = 0

    for (const segment of this.segments) {
      if (segment.type === "static") {
        // Static segment must match exactly
        if (urlIndex >= urlSegments.length || urlSegments[urlIndex] !== segment.name) {
          return null
        }
        urlIndex++
      } else if (segment.type === "dynamic") {
        // Dynamic segment captures one URL segment
        if (urlIndex >= urlSegments.length) {
          return null
        }
        params[segment.name] = urlSegments[urlIndex]
        urlIndex++
      } else if (segment.type === "catchall") {
        // Catch-all captures remaining segments
        if (urlIndex < urlSegments.length) {
          params[segment.name] = urlSegments.slice(urlIndex).join("/")
        }
        return params
      }
    }

    // All URL segments must be consumed
    if (urlIndex === urlSegments.length) {
      return params
    }

    return null
  }
}

interface SegmentPattern {
  type: "static" | "dynamic" | "catchall"
  name: string
}

/**
 * RouterManager implementation
 * Handles client-side navigation and route management
 */
export class RouterManagerImpl implements RouterManager {
  private navigationListeners = new Set<(path: string) => void>()
  private currentParams: Record<string, string> = {}
  private routePatterns: Map<string, RoutePatternMatcher> = new Map()
  private isInitialized = false

  constructor() {
    this.init()
  }

  private init(): void {
    if (this.isInitialized || typeof window === "undefined") return
    this.isInitialized = true

    // Listen for browser back/forward
    window.addEventListener("popstate", () => {
      this.updateParams()
      this.triggerNavigationEvent()
    })

    // Update params on init
    this.updateParams()
  }

  push(path: string, state?: any): void {
    if (typeof window === "undefined") return

    window.history.pushState(state, "", path)
    this.updateParams()
    this.triggerNavigationEvent()
  }

  replace(path: string, state?: any): void {
    if (typeof window === "undefined") return

    window.history.replaceState(state, "", path)
    this.updateParams()
    this.triggerNavigationEvent()
  }

  back(): void {
    if (typeof window === "undefined") return
    window.history.back()
  }

  forward(): void {
    if (typeof window === "undefined") return
    window.history.forward()
  }

  go(delta: number): void {
    if (typeof window === "undefined") return
    window.history.go(delta)
  }

  getCurrentPath(): string {
    if (typeof window === "undefined") return "/"
    return window.location.pathname
  }

  getParams(): Record<string, string> {
    return { ...this.currentParams }
  }

  getQuery(): URLSearchParams {
    if (typeof window === "undefined") return new URLSearchParams()
    return new URLSearchParams(window.location.search)
  }

  isActive(path: string, exact: boolean = true): boolean {
    const currentPath = this.getCurrentPath()

    if (exact) {
      return currentPath === path
    }

    // Partial match - check if current path starts with the given path
    return currentPath.startsWith(path === "/" ? "/" : path)
  }

  onNavigate(callback: (path: string) => void): () => void {
    this.navigationListeners.add(callback)

    return () => {
      this.navigationListeners.delete(callback)
    }
  }

  /**
   * Register a route pattern for parameter extraction
   * Used internally to match dynamic routes
   *
   * @example
   * router.registerRoute('/users/:id', '/users/:id')
   * router.registerRoute('/blog/*slug', '/blog/*slug')
   */
  registerRoute(pattern: string): void {
    if (!this.routePatterns.has(pattern)) {
      this.routePatterns.set(pattern, new RoutePatternMatcher(pattern))
    }
  }

  /**
   * Manually match a URL against registered route patterns
   * Useful for dynamic parameter extraction
   *
   * @example
   * router.registerRoute('/users/:id')
   * router.registerRoute('/users/:id/posts/:postId')
   * const params = router.matchRoute('/users/123')  // { id: '123' }
   */
  matchRoute(url: string): Record<string, string> | null {
    // Try to match against all registered patterns
    for (const matcher of this.routePatterns.values()) {
      const params = matcher.match(url)
      if (params !== null) {
        return params
      }
    }

    return null
  }

  /**
   * Extract parameters from path using a route pattern
   *
   * @example
   * const params = router.extractParams('/users/:id', '/users/123')  // { id: '123' }
   */
  extractParams(pattern: string, path: string): Record<string, string> | null {
    const matcher = new RoutePatternMatcher(pattern)
    return matcher.match(path)
  }

  private updateParams(): void {
    const path = this.getCurrentPath()

    // Try to match with registered patterns
    const matchedParams = this.matchRoute(path)
    if (matchedParams !== null) {
      this.currentParams = matchedParams
    } else {
      this.currentParams = {}
    }
  }

  private triggerNavigationEvent(): void {
    const path = this.getCurrentPath()

    // Call all registered listeners
    this.navigationListeners.forEach(callback => {
      try {
        callback(path)
      } catch (error) {
        console.warn("Navigation listener error:", error)
      }
    })

    // Also dispatch custom event for DOM listeners
    if (typeof window !== "undefined") {
      const event = new CustomEvent("yukemuri:navigate", {
        detail: { path, params: this.currentParams },
      })
      window.dispatchEvent(event)
    }
  }
}
