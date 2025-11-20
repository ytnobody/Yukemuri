import type { LogEntry, LogSink } from "./types"

/**
 * Console sink for outputting logs to stdout/stderr
 */
export class ConsoleSink implements LogSink {
  write(entry: LogEntry): void {
    const timestamp = entry.timestamp
    const level = entry.level.toUpperCase()
    const message = entry.message

    // Build the base log message
    let output = `[${timestamp}] ${level}: ${message}`

    // Add metadata if present
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      output += ` ${JSON.stringify(entry.metadata)}`
    }

    // Add error info if present
    if (entry.error) {
      output += `\nError: ${entry.error.name}: ${entry.error.message}`
      if (entry.error.stack) {
        output += `\n${entry.error.stack}`
      }
    }

    // Use appropriate console method based on level
    const consoleMethod = this.getConsoleMethod(entry.level)
    consoleMethod(output)
  }

  private getConsoleMethod(level: string): typeof console.log {
    switch (level) {
      case "debug":
        return console.debug
      case "error":
        return console.error
      case "warn":
        return console.warn
      case "info":
      default:
        return console.log
    }
  }
}
