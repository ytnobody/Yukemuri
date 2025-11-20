import type { Context } from "hono"
import { Logger } from "./logger"
import type { LoggingConfig } from "./types"

/**
 * Logging middleware for Hono
 * Automatically logs HTTP requests and responses
 */
export function createLoggingMiddleware(config: LoggingConfig = {}) {
  const logger = new Logger(config)

  return async (c: Context, next: () => Promise<void>) => {
    const startTime = Date.now()
    const method = c.req.method
    const path = new URL(c.req.url).pathname

    // Log request
    logger.info(`${method} ${path}`, {
      method,
      path,
      ip: c.req.header("x-forwarded-for") || "unknown",
    })

    try {
      // Call next middleware
      await next()

      // Log response
      const duration = Date.now() - startTime
      const status = c.res.status
      logger.info(`${method} ${path} ${status}`, {
        method,
        path,
        status,
        duration: `${duration}ms`,
      })
    } catch (error) {
      const duration = Date.now() - startTime
      if (error instanceof Error) {
        logger.error(`${method} ${path} failed`, error, {
          method,
          path,
          duration: `${duration}ms`,
        })
      } else {
        logger.error(`${method} ${path} failed`, undefined, {
          method,
          path,
          duration: `${duration}ms`,
          error: String(error),
        })
      }
      throw error
    }
  }
}

/**
 * Create a logger instance
 */
export function createLogger(config: LoggingConfig = {}): Logger {
  return new Logger(config)
}
