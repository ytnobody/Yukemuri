import { Hono } from "hono"
import type {
  YukemuriConfig,
  YukemuriApp,
  YukemuriPlugin,
  RouteConfig,
  MiddlewareConfig,
  Logger,
  PluginUtils,
} from "./types.js"
import { getDefaultConfig, mergeConfig } from "./config.js"

/**
 * Create a Yukemuri application
 */
export function createApp(userConfig?: Partial<YukemuriConfig>): YukemuriApp {
  const config = mergeConfig(getDefaultConfig(), userConfig || {})
  const hono = new Hono()

  // Internal state
  const state = {
    plugins: new Map<string, YukemuriPlugin>(),
    initialized: false,
  }

  /**
   * Register a plugin
   */
  const use = async (plugin: YukemuriPlugin, pluginConfig?: any): Promise<YukemuriApp> => {
    if (state.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`)
    }

    // Register plugin
    state.plugins.set(plugin.name, plugin)

    // Initialize plugin
    if (plugin.init) {
      const logger: Logger = {
        info: (msg: string) => console.log(`[${plugin.name}] ${msg}`),
        warn: (msg: string) => console.warn(`[${plugin.name}] ${msg}`),
        error: (msg: string) => console.error(`[${plugin.name}] ${msg}`),
        debug: (msg: string) => console.debug(`[${plugin.name}] ${msg}`),
        child: (metadata: Record<string, any>) => logger,
      }
      const utils = {
        env: (key: string, fallback?: string) => process.env[key] || fallback,
        createLogger: (scope: string) => logger,
        registerGlobal: (name: string, value: any) => {
          ;(globalThis as any)[name] = value
        },
        schedule: (fn: () => void | Promise<void>, delay: number) => {
          setInterval(fn, delay)
        },
        getDatabase: (name?: string) => null,
      }
      await plugin.init({ app, config: pluginConfig, logger, utils, dependencies: {} })
    }

    // Register plugin routes
    if (plugin.routes) {
      plugin.routes.forEach(route => {
        addRoute(route)
      })
    }

    // Register plugin middleware
    if (plugin.middleware) {
      plugin.middleware.forEach(middleware => {
        addMiddleware(middleware)
      })
    }

    return app
  }

  /**
   * Register a route
   */
  const route = (routeConfig: RouteConfig): YukemuriApp => {
    addRoute(routeConfig)
    return app
  }

  /**
   * Register middleware
   */
  const middleware = (middlewareConfig: MiddlewareConfig): YukemuriApp => {
    addMiddleware(middlewareConfig)
    return app
  }

  /**
   * Start the application (development mode)
   */
  const start = async (port = 3000): Promise<void> => {
    if (!state.initialized) {
      await initialize()
    }

    console.log(`🚀 Yukemuri server starting on http://localhost:${port}`)

    // Startup on Node.js environment (for development)
    const { serve } = await import("@hono/node-server")
    serve({
      fetch: hono.fetch,
      port,
    })
  }

  /**
   * Get fetch handler (for Cloudflare Workers)
   */
  const fetch = async (request: Request): Promise<Response> => {
    if (!state.initialized) {
      await initialize()
    }
    return hono.fetch(request)
  }

  /**
   * Initialization processing
   */
  const initialize = async (): Promise<void> => {
    if (state.initialized) return

    // Add routes from configuration
    config.routes?.forEach(routeConfig => {
      addRoute(routeConfig)
    })

    // Add middleware from configuration
    config.middleware?.forEach(middlewareConfig => {
      addMiddleware(middlewareConfig)
    })

    // Add plugins from configuration
    if (config.plugins) {
      for (const plugin of config.plugins) {
        await use(plugin)
      }
    }

    state.initialized = true
  }

  /**
   * Internal function: Add route
   */
  const addRoute = (routeConfig: RouteConfig): void => {
    const { method, path, handler, middleware: routeMiddleware } = routeConfig

    if (routeMiddleware && routeMiddleware.length > 0) {
      // Route with middleware - register each middleware first
      routeMiddleware.forEach(mw => hono.use(path, mw))
      hono.on(method.toLowerCase() as any, path, handler)
    } else {
      // Simple route
      hono.on(method.toLowerCase() as any, path, handler)
    }
  }

  /**
   * Internal function: Add middleware
   */
  const addMiddleware = (middlewareConfig: MiddlewareConfig): void => {
    if (middlewareConfig.path) {
      hono.use(middlewareConfig.path, middlewareConfig.middleware)
    } else {
      hono.use(middlewareConfig.middleware)
    }
  }

  // Build application object
  const app: YukemuriApp = {
    hono,
    config,
    use,
    route,
    middleware,
    start,
    fetch,
  }

  return app
}
