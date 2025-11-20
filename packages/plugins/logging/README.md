# Logging Plugin

Structured logging plugin for Yukemuri with multi-sink support and configurable log levels.

## Features

- 🎯 **Structured Logging**: JSON-formatted log entries with timestamps
- 📊 **Multi-Sink Support**: Write logs to multiple destinations simultaneously
- 🔍 **Log Levels**: DEBUG, INFO, WARN, ERROR with level filtering
- 🪵 **Multiple Sinks**: Console, in-memory, and extensible custom sinks
- ⚡ **Async Support**: Non-blocking async sink operations
- 🔗 **Hono Integration**: Built-in middleware for automatic request/response logging

## Installation

```bash
npm install @yukemuri/plugin-logging
```

## Quick Start

### Basic Usage

```typescript
import { createLogger, LogLevel } from "@yukemuri/plugin-logging"

const logger = createLogger({
  minLevel: "info",
})

logger.info("Application started")
logger.warn("This is a warning", { code: "WARN_001" })
logger.error("An error occurred", new Error("Something went wrong"))
```

### With Hono Middleware

```typescript
import { Hono } from "hono"
import { createLoggingMiddleware } from "@yukemuri/plugin-logging"

const app = new Hono()

// Add logging middleware
app.use(createLoggingMiddleware({ minLevel: "info" }))

app.get("/", (c) => c.text("Hello"))
```

### Custom Sinks

```typescript
import { Logger, ConsoleSink, MemoryFileSink } from "@yukemuri/plugin-logging"

const memorySink = new MemoryFileSink()
const logger = new Logger({
  minLevel: "debug",
  sinks: [new ConsoleSink(), memorySink],
  console: false, // Disable default console sink
})

logger.info("Message")

// Retrieve stored logs
const logs = memorySink.getLogs()
console.log(logs)
```

### Custom Log Sinks

```typescript
import { Logger } from "@yukemuri/plugin-logging"
import type { LogEntry, LogSink } from "@yukemuri/plugin-logging"

class MyCustomSink implements LogSink {
  async write(entry: LogEntry): Promise<void> {
    // Send to external service
    await fetch("https://logs.example.com", {
      method: "POST",
      body: JSON.stringify(entry),
    })
  }
}

const logger = new Logger({
  sinks: [new MyCustomSink()],
  console: false,
})
```

## API Reference

### Logger

Main logger class for structured logging.

#### Constructor

```typescript
new Logger(config?: LoggingConfig)
```

#### Methods

- `debug(message: string, metadata?: Record<string, any>): void` - Log debug message
- `info(message: string, metadata?: Record<string, any>): void` - Log info message
- `warn(message: string, metadata?: Record<string, any>): void` - Log warning message
- `error(message: string, error?: Error, metadata?: Record<string, any>): void` - Log error message
- `addSink(sink: LogSink): void` - Add a log sink
- `removeSink(sink: LogSink): void` - Remove a log sink
- `setContextProvider(provider: Function): void` - Set context provider
- `close(): Promise<void>` - Close all sinks

### LoggingConfig

Configuration object for logger initialization.

```typescript
interface LoggingConfig {
  minLevel?: "debug" | "info" | "warn" | "error" // Default: "info"
  sinks?: LogSink[] // Custom sinks
  console?: boolean // Enable console output (default: true)
  includeRequestContext?: boolean // Add request context to logs
  contextProvider?: (context: any) => Record<string, any> // Custom context
}
```

### LogLevel

Enumeration of log levels:

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}
```

### LogEntry

Structured log entry:

```typescript
interface LogEntry {
  timestamp: string // ISO 8601 timestamp
  level: string // "debug" | "info" | "warn" | "error"
  message: string // Log message
  metadata?: Record<string, any> // Additional data
  error?: {
    name: string
    message: string
    stack?: string
  }
}
```

### LogSink

Interface for custom log sinks:

```typescript
interface LogSink {
  write(entry: LogEntry): void | Promise<void>
  close?(): void | Promise<void>
}
```

## Built-in Sinks

### ConsoleSink

Outputs logs to console (stdout/stderr).

```typescript
import { ConsoleSink } from "@yukemuri/plugin-logging"

const sink = new ConsoleSink()
```

### MemoryFileSink

Stores logs in memory (useful for testing).

```typescript
import { MemoryFileSink } from "@yukemuri/plugin-logging"

const sink = new MemoryFileSink()
const logs = sink.getLogs()
const count = sink.size()
sink.clear()
```

## Log Level Filtering

Only logs with level >= configured `minLevel` will be logged:

```typescript
const logger = new Logger({ minLevel: "warn" })

logger.debug("Not logged")
logger.info("Not logged")
logger.warn("Logged") // ✓
logger.error("Logged") // ✓
```

## Error Logging

Comprehensive error support:

```typescript
const error = new Error("Something failed")

// Log with Error object
logger.error("Operation failed", error)

// Log with Error object and additional metadata
logger.error("Operation failed", error, { userId: "123", action: "create" })

// Log with just metadata (no Error object)
logger.error("Operation failed", { code: "ERR_001", details: "..." })
```

## Testing

```bash
npm test
```

## License

MIT
