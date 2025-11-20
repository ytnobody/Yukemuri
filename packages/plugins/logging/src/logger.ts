import type { LogEntry, LoggingConfig, LogSink, ILogger, LogLevelString } from "./types"
import { LogLevel } from "./types"
import { ConsoleSink } from "./console-sink"

/**
 * Logger implementation with multi-sink support
 */
export class Logger implements ILogger {
  private sinks: LogSink[] = []
  private minLevel: LogLevel = LogLevel.INFO
  private contextProvider?: (context: any) => Record<string, any>

  constructor(config: LoggingConfig = {}) {
    // Set minimum log level
    if (config.minLevel) {
      this.minLevel = this.parseLevelString(config.minLevel)
    }

    // Set context provider
    this.contextProvider = config.contextProvider

    // Initialize sinks
    if (config.sinks && config.sinks.length > 0) {
      this.sinks = config.sinks
    }

    // Add console sink if enabled (default: true)
    if (config.console !== false && !this.sinks.some(s => s instanceof ConsoleSink)) {
      this.sinks.push(new ConsoleSink())
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, undefined, metadata)
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, undefined, metadata)
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, undefined, metadata)
  }

  error(
    message: string,
    error?: Error | Record<string, any>,
    metadata?: Record<string, any>
  ): void {
    // Handle case where error is actually metadata
    let errorObj: Error | undefined
    let finalMetadata: Record<string, any> | undefined

    if (error instanceof Error) {
      errorObj = error
      finalMetadata = metadata
    } else if (error && typeof error === "object") {
      finalMetadata = { ...error, ...metadata }
    } else {
      finalMetadata = metadata
    }

    this.log(LogLevel.ERROR, message, errorObj, finalMetadata)
  }

  /**
   * Add a sink
   */
  addSink(sink: LogSink): void {
    this.sinks.push(sink)
  }

  /**
   * Remove a sink
   */
  removeSink(sink: LogSink): void {
    const index = this.sinks.indexOf(sink)
    if (index >= 0) {
      this.sinks.splice(index, 1)
    }
  }

  /**
   * Set context provider
   */
  setContextProvider(provider: (context: any) => Record<string, any>): void {
    this.contextProvider = provider
  }

  /**
   * Close all sinks
   */
  async close(): Promise<void> {
    await Promise.all(this.sinks.filter(sink => sink.close).map(sink => sink.close!()))
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    metadata?: Record<string, any>
  ): void {
    // Check if this log level should be processed
    if (level < this.minLevel) {
      return
    }

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: this.levelToString(level),
      message,
      metadata,
    }

    // Add error information if provided
    if (error) {
      entry.error = {
        name: error.name || "Error",
        message: error.message,
        stack: error.stack,
      }
    }

    // Write to all sinks
    for (const sink of this.sinks) {
      try {
        const result = sink.write(entry)
        // Handle async sinks
        if (result instanceof Promise) {
          result.catch(err => {
            console.error("Error writing to log sink:", err)
          })
        }
      } catch (err) {
        console.error("Error writing to log sink:", err)
      }
    }
  }

  /**
   * Convert LogLevel enum to string
   */
  private levelToString(level: LogLevel): LogLevelString {
    switch (level) {
      case LogLevel.DEBUG:
        return "debug"
      case LogLevel.INFO:
        return "info"
      case LogLevel.WARN:
        return "warn"
      case LogLevel.ERROR:
        return "error"
    }
  }

  /**
   * Parse log level string to LogLevel enum
   */
  private parseLevelString(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case "debug":
        return LogLevel.DEBUG
      case "warn":
        return LogLevel.WARN
      case "error":
        return LogLevel.ERROR
      case "info":
      default:
        return LogLevel.INFO
    }
  }
}
