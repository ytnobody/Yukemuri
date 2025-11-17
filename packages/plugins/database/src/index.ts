import { DatabaseManager, type DatabaseConfig } from "./manager"

/**
 * Database plugin configuration schema
 */
const configSchema = {
  url: { type: "string", required: true, description: "Database URL" },
  authToken: { type: "string", required: false, description: "Authentication token" },
  syncInterval: { type: "number", required: false, description: "Sync interval in milliseconds" },
  maxRetries: { type: "number", required: false, description: "Maximum retry attempts" },
}

/**
 * Default configuration
 */
const defaultConfig: DatabaseConfig = {
  url: "file:./app.db",
  syncInterval: 3000,
  maxRetries: 3,
}

/**
 * Database plugin for Yukemuri
 * Provides SQLite/Turso database management capabilities
 */
export interface DatabasePluginDefinition {
  name: string
  version: string
  description: string
  configSchema: Record<string, any>
  defaultConfig: DatabaseConfig
  init: (config: DatabaseConfig, app: any) => Promise<() => Promise<void>>
}

/**
 * Create database plugin
 */
export function createDatabasePlugin(): DatabasePluginDefinition {
  return {
    name: "@yukemuri/plugin-database",
    version: "1.0.0",
    description: "Database plugin for SQLite/Turso support",
    configSchema,
    defaultConfig,

    /**
     * Initialize database plugin
     */
    async init(config: DatabaseConfig, app: any) {
      const dbManager = new DatabaseManager()

      // Connect to database
      await dbManager.connect(config)

      // Store database manager in app context
      ;(app as any).db = dbManager

      // Add database health check endpoint
      app.get("/api/health/db", async (c: any) => {
        try {
          const stats = await dbManager.getStats()
          return c.json({
            status: stats.isConnected ? "healthy" : "disconnected",
            tables: stats.tableCount,
            totalRows: stats.totalRows,
          })
        } catch (error) {
          return c.json(
            {
              status: "error",
              message: error instanceof Error ? error.message : "Unknown error",
            },
            500
          )
        }
      })

      // Add database info endpoint
      app.get("/api/db/stats", async (c: any) => {
        try {
          const stats = await dbManager.getStats()
          return c.json(stats)
        } catch (error) {
          return c.json(
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
            500
          )
        }
      })

      // Add table info endpoint
      app.get("/api/db/tables/:name", async (c: any) => {
        try {
          const tableName = c.req.param("name")
          const info = await dbManager.getTableInfo(tableName)
          return c.json({ table: tableName, columns: info })
        } catch (error) {
          return c.json(
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
            500
          )
        }
      })

      /**
       * Cleanup on app shutdown
       */
      return async () => {
        await dbManager.disconnect()
      }
    },
  }
}

/**
 * Export singleton instance
 */
export const databasePlugin = createDatabasePlugin()

/**
 * Type-safe database plugin context extension
 */
declare global {
  interface AppContext {
    db: DatabaseManager
  }
}

/**
 * Export database manager for external use
 */
export { DatabaseManager, type DatabaseConfig, type QueryResult } from "./manager"

/**
 * Export plugin as default
 */
export default databasePlugin
