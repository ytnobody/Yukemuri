import type { YukemuriPlugin, YukemuriApp, ConfigSchema, PluginContext, Logger } from "../types.js"

/**
 * Plugin Manager
 * Handles plugin lifecycle, dependency resolution, and runtime management
 */
export class PluginManager {
  private plugins: Map<string, LoadedPlugin> = new Map()
  private loadOrder: string[] = []
  private logger: Logger
  private app: YukemuriApp

  constructor(app: YukemuriApp, logger: Logger) {
    this.app = app
    this.logger = logger
  }

  /**
   * Register a plugin
   */
  async register(plugin: YukemuriPlugin, config: any = {}): Promise<void> {
    this.logger.info(`Registering plugin: ${plugin.name}@${plugin.version}`)

    // Validate plugin
    this.validatePlugin(plugin)

    // Validate configuration
    if (plugin.configSchema) {
      const validation = this.validateConfig(config, plugin.configSchema)
      if (!validation.valid) {
        throw new Error(
          `Plugin ${plugin.name} configuration invalid: ${validation.errors.join(", ")}`
        )
      }
    }

    // Merge with default config
    const finalConfig = { ...plugin.defaultConfig, ...config }

    // Check dependencies
    await this.checkDependencies(plugin)

    // Store plugin
    const loadedPlugin: LoadedPlugin = {
      plugin,
      config: finalConfig,
      loaded: false,
      initialized: false,
      context: null,
    }

    this.plugins.set(plugin.name, loadedPlugin)
    this.logger.info(`Plugin ${plugin.name} registered successfully`)
  }

  /**
   * Load all registered plugins in dependency order
   */
  async loadAll(): Promise<void> {
    this.logger.info("Loading all plugins...")

    // Resolve load order
    this.loadOrder = this.resolveDependencyOrder()

    // Load plugins in order
    for (const pluginName of this.loadOrder) {
      await this.loadPlugin(pluginName)
    }

    this.logger.info("All plugins loaded successfully")
  }

  /**
   * Load a specific plugin
   */
  async loadPlugin(pluginName: string): Promise<void> {
    const loadedPlugin = this.plugins.get(pluginName)
    if (!loadedPlugin) {
      throw new Error(`Plugin ${pluginName} not found`)
    }

    if (loadedPlugin.loaded) {
      return // Already loaded
    }

    this.logger.info(`Loading plugin: ${pluginName}`)

    const { plugin, config } = loadedPlugin

    // Create plugin context
    const context: PluginContext = {
      app: this.app,
      config,
      logger: this.logger.child({ plugin: pluginName }),
      utils: new PluginUtils(this.app, this.logger),
      dependencies: this.getDependencies(plugin),
    }

    loadedPlugin.context = context

    try {
      // Initialize plugin
      if (plugin.init) {
        await plugin.init(context)
      }

      // Register middleware
      if (plugin.middleware) {
        for (const middleware of plugin.middleware) {
          this.app.hono.use(middleware.path || "*", middleware.middleware)
        }
      }

      // Register routes
      if (plugin.routes) {
        for (const route of plugin.routes) {
          switch (route.method.toLowerCase()) {
            case "get":
              this.app.hono.get(route.path, route.handler)
              break
            case "post":
              this.app.hono.post(route.path, route.handler)
              break
            case "put":
              this.app.hono.put(route.path, route.handler)
              break
            case "delete":
              this.app.hono.delete(route.path, route.handler)
              break
            case "patch":
              this.app.hono.patch(route.path, route.handler)
              break
            default:
              throw new Error(`Unsupported HTTP method: ${route.method}`)
          }
        }
      }

      // Register assets
      if (plugin.assets) {
        for (const asset of plugin.assets) {
          this.app.hono.get(`${asset.to}/*`, async c => {
            const filePath = c.req.path.replace(asset.to, asset.from)
            return c.notFound()
          })
        }
      }

      loadedPlugin.loaded = true
      loadedPlugin.initialized = true

      this.logger.info(`Plugin ${pluginName} loaded successfully`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      this.logger.error(`Failed to load plugin ${pluginName}: ${message}`)
      throw error
    }
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginName: string): Promise<void> {
    const loadedPlugin = this.plugins.get(pluginName)
    if (!loadedPlugin || !loadedPlugin.loaded) {
      return
    }

    this.logger.info(`Unloading plugin: ${pluginName}`)

    try {
      // Call teardown hook
      if (loadedPlugin.plugin.teardown && loadedPlugin.context) {
        await loadedPlugin.plugin.teardown(loadedPlugin.context)
      }

      loadedPlugin.loaded = false
      loadedPlugin.initialized = false
      loadedPlugin.context = null

      this.logger.info(`Plugin ${pluginName} unloaded successfully`)
    } catch (error) {
      this.logger.error(`Failed to unload plugin ${pluginName}:`, error)
      throw error
    }
  }

  /**
   * Get loaded plugin information
   */
  getPlugin(name: string): LoadedPlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * Get all loaded plugins
   */
  getAllPlugins(): LoadedPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Check if plugin is loaded
   */
  isLoaded(name: string): boolean {
    const plugin = this.plugins.get(name)
    return plugin?.loaded || false
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: YukemuriPlugin): void {
    if (!plugin.name) {
      throw new Error("Plugin must have a name")
    }

    if (!plugin.version) {
      throw new Error("Plugin must have a version")
    }

    // Validate name format
    const nameRegex = /^[a-z0-9-_@/]+$/
    if (!nameRegex.test(plugin.name)) {
      throw new Error(`Invalid plugin name: ${plugin.name}`)
    }

    // Validate version format
    const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/
    if (!versionRegex.test(plugin.version)) {
      throw new Error(`Invalid plugin version: ${plugin.version}`)
    }
  }

  /**
   * Validate plugin configuration
   */
  private validateConfig(config: any, schema: ConfigSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (schema.type !== "object") {
      errors.push("Config schema must be of type object")
      return { valid: false, errors }
    }

    // Check required properties
    if (schema.required) {
      for (const required of schema.required) {
        if (!(required in config)) {
          errors.push(`Required property "${required}" is missing`)
        }
      }
    }

    // Validate properties
    if (schema.properties) {
      for (const [key, property] of Object.entries(schema.properties)) {
        if (key in config) {
          const value = config[key]
          const result = this.validateProperty(value, property, key)
          errors.push(...result)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate a single property
   */
  private validateProperty(value: any, property: any, path: string): string[] {
    const errors: string[] = []

    // Type validation
    if (!this.checkType(value, property.type)) {
      errors.push(`Property "${path}" must be of type ${property.type}`)
      return errors
    }

    // Enum validation
    if (property.enum && !property.enum.includes(value)) {
      errors.push(`Property "${path}" must be one of: ${property.enum.join(", ")}`)
    }

    // Range validation for numbers
    if (property.type === "number") {
      if (property.minimum !== undefined && value < property.minimum) {
        errors.push(`Property "${path}" must be >= ${property.minimum}`)
      }
      if (property.maximum !== undefined && value > property.maximum) {
        errors.push(`Property "${path}" must be <= ${property.maximum}`)
      }
    }

    // Pattern validation for strings
    if (property.type === "string" && property.pattern) {
      const regex = new RegExp(property.pattern)
      if (!regex.test(value)) {
        errors.push(`Property "${path}" must match pattern: ${property.pattern}`)
      }
    }

    // Custom validation
    if (property.validation) {
      const result = property.validation(value)
      if (typeof result === "string") {
        errors.push(`Property "${path}": ${result}`)
      } else if (!result) {
        errors.push(`Property "${path}" failed validation`)
      }
    }

    return errors
  }

  /**
   * Check if value matches expected type
   */
  private checkType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case "string":
        return typeof value === "string"
      case "number":
        return typeof value === "number" && !isNaN(value)
      case "boolean":
        return typeof value === "boolean"
      case "object":
        return typeof value === "object" && value !== null && !Array.isArray(value)
      case "array":
        return Array.isArray(value)
      default:
        return true
    }
  }

  /**
   * Check plugin dependencies
   */
  private async checkDependencies(plugin: YukemuriPlugin): Promise<void> {
    if (!plugin.dependencies) {
      return
    }

    for (const dependency of plugin.dependencies) {
      if (!this.plugins.has(dependency)) {
        throw new Error(`Plugin ${plugin.name} requires dependency: ${dependency}`)
      }
    }
  }

  /**
   * Resolve plugin loading order based on dependencies
   */
  private resolveDependencyOrder(): string[] {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []

    const visit = (pluginName: string) => {
      if (visited.has(pluginName)) {
        return
      }

      if (visiting.has(pluginName)) {
        throw new Error(`Circular dependency detected involving plugin: ${pluginName}`)
      }

      visiting.add(pluginName)

      const plugin = this.plugins.get(pluginName)
      if (plugin && plugin.plugin.dependencies) {
        for (const dependency of plugin.plugin.dependencies) {
          visit(dependency)
        }
      }

      visiting.delete(pluginName)
      visited.add(pluginName)
      order.push(pluginName)
    }

    for (const pluginName of this.plugins.keys()) {
      visit(pluginName)
    }

    return order
  }

  /**
   * Get plugin dependencies
   */
  private getDependencies(plugin: YukemuriPlugin): Record<string, any> {
    const dependencies: Record<string, any> = {}

    if (plugin.dependencies) {
      for (const depName of plugin.dependencies) {
        const dep = this.plugins.get(depName)
        if (dep?.context) {
          dependencies[depName] = dep.context
        }
      }
    }

    return dependencies
  }
}

/**
 * Plugin utilities
 */
export class PluginUtils {
  constructor(
    private app: YukemuriApp,
    private logger: Logger
  ) {}

  /**
   * Get environment variable with fallback
   */
  env(key: string, fallback?: string): string | undefined {
    return process.env[key] || fallback
  }

  /**
   * Create a scoped logger
   */
  createLogger(scope: string): Logger {
    return this.logger.child({ scope })
  }

  /**
   * Register a global utility
   */
  registerGlobal(name: string, value: any): void {
    ;(globalThis as any)[name] = value
  }

  /**
   * Schedule a task
   */
  schedule(fn: () => void | Promise<void>, delay: number): void {
    setTimeout(fn, delay)
  }

  /**
   * Create a database connection (if database plugin is loaded)
   */
  getDatabase(name: string = "default"): any {
    // This would integrate with database plugin
    return null
  }
}

/**
 * Loaded plugin interface
 */
export interface LoadedPlugin {
  plugin: YukemuriPlugin
  config: any
  loaded: boolean
  initialized: boolean
  context: PluginContext | null
}

/**
 * Plugin development utilities
 */
export class PluginDev {
  /**
   * Hot reload a plugin
   */
  static async hotReload(manager: PluginManager, pluginName: string): Promise<void> {
    await manager.unloadPlugin(pluginName)
    await manager.loadPlugin(pluginName)
  }

  /**
   * Watch plugin files for changes
   */
  static watchPlugin(pluginPath: string, onChange: () => void): void {
    // File watching implementation
    console.log(`Watching plugin at ${pluginPath}`)
    // This would use fs.watch or chokidar
  }
}
