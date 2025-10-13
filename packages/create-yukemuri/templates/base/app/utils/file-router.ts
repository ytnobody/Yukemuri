import { readdirSync, statSync } from 'fs'
import { join, relative, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

export interface RouteInfo {
  path: string
  filePath: string
  isDynamic: boolean
  segments: RouteSegment[]
  component?: any
}

export interface RouteSegment {
  name: string
  isDynamic: boolean
  isCatchAll: boolean
  isOptional: boolean
}

/**
 * Next.js App Router style file-based routing
 * 
 * File patterns:
 * - page.tsx → renders the route
 * - layout.tsx → shared layout
 * - loading.tsx → loading UI
 * - error.tsx → error boundary
 * - not-found.tsx → 404 page
 * 
 * Dynamic routes:
 * - [id]/page.tsx → /users/:id
 * - [...slug]/page.tsx → /blog/*
 * - [[...slug]]/page.tsx → /docs/* (optional catch-all)
 */
export class FileRouter {
  private routes: Map<string, RouteInfo> = new Map()
  private routesDir: string

  constructor(routesDir: string) {
    this.routesDir = routesDir
  }

  /**
   * Scan the routes directory and build route map
   */
  scanRoutes(): RouteInfo[] {
    const routes: RouteInfo[] = []
    
    this.walkDirectory(this.routesDir, '', routes)
    
    // Sort routes by specificity (static routes first, then dynamic)
    routes.sort((a, b) => {
      if (!a.isDynamic && b.isDynamic) return -1
      if (a.isDynamic && !b.isDynamic) return 1
      return a.path.localeCompare(b.path)
    })
    
    routes.forEach(route => {
      this.routes.set(route.path, route)
    })
    
    return routes
  }

  private walkDirectory(dir: string, currentPath: string, routes: RouteInfo[]) {
    try {
      const items = readdirSync(dir)
      
      for (const item of items) {
        const fullPath = join(dir, item)
        const stat = statSync(fullPath)
        
        if (stat.isDirectory()) {
          // Handle directory (route segment)
          const segmentPath = currentPath + '/' + item
          this.walkDirectory(fullPath, segmentPath, routes)
        } else if (item === 'page.tsx' || item === 'page.ts') {
          // Found a page file - create route
          const route = this.createRoute(currentPath, fullPath)
          if (route) {
            routes.push(route)
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to scan directory ${dir}:`, error)
    }
  }

  private createRoute(routePath: string, filePath: string): RouteInfo | null {
    // Convert file path to URL path
    const urlPath = this.filePathToUrlPath(routePath)
    const segments = this.parseSegments(routePath)
    
    const isDynamic = segments.some(seg => seg.isDynamic)
    
    return {
      path: urlPath,
      filePath,
      isDynamic,
      segments
    }
  }

  private filePathToUrlPath(routePath: string): string {
    if (!routePath || routePath === '/') {
      return '/'
    }
    
    return routePath
      .split('/')
      .filter(segment => segment !== '')
      .map(segment => this.convertSegment(segment))
      .join('/')
      .replace(/^/, '/')
  }

  private convertSegment(segment: string): string {
    // [id] → :id (dynamic segment)
    if (segment.startsWith('[') && segment.endsWith(']')) {
      const inner = segment.slice(1, -1)
      
      // [...slug] → *slug (catch-all)
      if (inner.startsWith('...')) {
        return '*' + inner.slice(3)
      }
      
      // [[...slug]] → *slug (optional catch-all)
      if (inner.startsWith('[...') && inner.endsWith(']')) {
        return '*' + inner.slice(4, -1)
      }
      
      // [id] → :id (regular dynamic segment)
      return ':' + inner
    }
    
    return segment
  }

  private parseSegments(routePath: string): RouteSegment[] {
    if (!routePath || routePath === '/') {
      return []
    }
    
    return routePath
      .split('/')
      .filter(segment => segment !== '')
      .map(segment => {
        if (segment.startsWith('[') && segment.endsWith(']')) {
          const inner = segment.slice(1, -1)
          
          if (inner.startsWith('...')) {
            return {
              name: inner.slice(3),
              isDynamic: true,
              isCatchAll: true,
              isOptional: false
            }
          }
          
          if (inner.startsWith('[...') && inner.endsWith(']')) {
            return {
              name: inner.slice(4, -1),
              isDynamic: true,
              isCatchAll: true,
              isOptional: true
            }
          }
          
          return {
            name: inner,
            isDynamic: true,
            isCatchAll: false,
            isOptional: false
          }
        }
        
        return {
          name: segment,
          isDynamic: false,
          isCatchAll: false,
          isOptional: false
        }
      })
  }

  /**
   * Match a URL path to a route
   */
  matchRoute(urlPath: string): { route: RouteInfo; params: Record<string, string> } | null {
    // Try exact match first
    const exactRoute = this.routes.get(urlPath)
    if (exactRoute && !exactRoute.isDynamic) {
      return { route: exactRoute, params: {} }
    }
    
    // Try dynamic routes
    for (const route of this.routes.values()) {
      if (route.isDynamic) {
        const match = this.matchDynamicRoute(urlPath, route)
        if (match) {
          return { route, params: match }
        }
      }
    }
    
    return null
  }

  private matchDynamicRoute(urlPath: string, route: RouteInfo): Record<string, string> | null {
    const urlSegments = urlPath.split('/').filter(s => s !== '')
    const routeSegments = route.segments
    
    const params: Record<string, string> = {}
    let urlIndex = 0
    
    for (let i = 0; i < routeSegments.length; i++) {
      const segment = routeSegments[i]
      
      if (!segment.isDynamic) {
        // Static segment - must match exactly
        if (urlSegments[urlIndex] !== segment.name) {
          return null
        }
        urlIndex++
      } else if (segment.isCatchAll) {
        // Catch-all segment - captures remaining path
        if (segment.isOptional || urlIndex < urlSegments.length) {
          const remainingPath = urlSegments.slice(urlIndex).join('/')
          params[segment.name] = remainingPath
          return params
        }
      } else {
        // Dynamic segment - capture one segment
        if (urlIndex >= urlSegments.length) {
          return null
        }
        params[segment.name] = urlSegments[urlIndex]
        urlIndex++
      }
    }
    
    // Check if we consumed all URL segments
    if (urlIndex === urlSegments.length) {
      return params
    }
    
    return null
  }

  getRoutes(): RouteInfo[] {
    return Array.from(this.routes.values())
  }
}

/**
 * Create and configure the file router
 */
export function createFileRouter(routesDir: string): FileRouter {
  const router = new FileRouter(routesDir)
  router.scanRoutes()
  return router
}