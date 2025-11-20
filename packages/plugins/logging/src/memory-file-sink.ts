import type { LogEntry, LogSink } from "./types"

/**
 * In-memory file sink that stores logs (useful for testing or temporary storage)
 */
export class MemoryFileSink implements LogSink {
  private logs: string[] = []

  write(entry: LogEntry): void {
    const logLine = JSON.stringify(entry)
    this.logs.push(logLine)
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return this.logs.map(line => JSON.parse(line))
  }

  /**
   * Get logs as raw strings
   */
  getRawLogs(): string[] {
    return [...this.logs]
  }

  /**
   * Clear all stored logs
   */
  clear(): void {
    this.logs = []
  }

  /**
   * Get number of stored logs
   */
  size(): number {
    return this.logs.length
  }

  close(): void {
    // No-op for in-memory sink
  }
}
