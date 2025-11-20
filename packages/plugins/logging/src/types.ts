/**
 * Logging Plugin for Yukemuri
 * Provides structured logging with multi-sink support and log levels
 */

/**
 * Log level enumeration
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Log level string type
 */
export type LogLevelString = "debug" | "info" | "warn" | "error"

/**
 * Structured log entry
 */
export interface LogEntry {
  timestamp: string
  level: LogLevelString
  message: string
  metadata?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

/**
 * Log sink interface for handling log entries
 */
export interface LogSink {
  /**
   * Write a log entry
   */
  write(entry: LogEntry): void | Promise<void>

  /**
   * Close the sink
   */
  close?(): void | Promise<void>
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  /**
   * Minimum log level (debug, info, warn, error)
   */
  minLevel?: LogLevelString

  /**
   * Custom sinks for log output
   */
  sinks?: LogSink[]

  /**
   * Enable console output (default: true)
   */
  console?: boolean

  /**
   * Add request context to logs
   */
  includeRequestContext?: boolean

  /**
   * Custom context provider
   */
  contextProvider?: (context: any) => Record<string, any>
}

/**
 * Logger interface
 */
export interface ILogger {
  debug(message: string, metadata?: Record<string, any>): void
  info(message: string, metadata?: Record<string, any>): void
  warn(message: string, metadata?: Record<string, any>): void
  error(message: string, error?: Error | Record<string, any>, metadata?: Record<string, any>): void
}
