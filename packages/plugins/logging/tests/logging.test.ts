import { describe, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert"
import { Logger } from "../src/logger"
import { ConsoleSink } from "../src/console-sink"
import { MemoryFileSink } from "../src/memory-file-sink"
import { LogLevel } from "../src/types"

describe("Logging Plugin", () => {
  describe("Logger", () => {
    let logger: Logger
    let memorySink: MemoryFileSink

    beforeEach(() => {
      memorySink = new MemoryFileSink()
      logger = new Logger({
        sinks: [memorySink],
        console: false,
      })
    })

    afterEach(async () => {
      await logger.close()
    })

    it("should log debug messages", async () => {
      // Need to use debug level to see debug messages
      const debugLogger = new Logger({
        sinks: [memorySink],
        console: false,
        minLevel: "debug",
      })
      debugLogger.debug("Debug message", { key: "value" })

      const logs = memorySink.getLogs()
      assert.strictEqual(logs.length, 1)
      assert.strictEqual(logs[0].level, "debug")
      assert.strictEqual(logs[0].message, "Debug message")
      assert.deepStrictEqual(logs[0].metadata, { key: "value" })

      await debugLogger.close()
    })

    it("should log info messages", async () => {
      logger.info("Info message")

      const logs = memorySink.getLogs()
      assert.strictEqual(logs.length, 1)
      assert.strictEqual(logs[0].level, "info")
      assert.strictEqual(logs[0].message, "Info message")
    })

    it("should log warning messages", async () => {
      logger.warn("Warning message", { warning: true })

      const logs = memorySink.getLogs()
      assert.strictEqual(logs.length, 1)
      assert.strictEqual(logs[0].level, "warn")
      assert.strictEqual(logs[0].message, "Warning message")
    })

    it("should log error messages with Error object", async () => {
      const error = new Error("Test error")
      logger.error("An error occurred", error)

      const logs = memorySink.getLogs()
      assert.strictEqual(logs.length, 1)
      assert.strictEqual(logs[0].level, "error")
      assert.strictEqual(logs[0].message, "An error occurred")
      assert.ok(logs[0].error)
      assert.strictEqual(logs[0].error?.message, "Test error")
    })

    it("should log error messages with metadata", async () => {
      const error = new Error("Test error")
      logger.error("An error occurred", error, { userId: "123" })

      const logs = memorySink.getLogs()
      assert.strictEqual(logs.length, 1)
      assert.deepStrictEqual(logs[0].metadata, { userId: "123" })
      assert.ok(logs[0].error)
    })

    it("should handle error as metadata if not an Error object", async () => {
      logger.error("Error", { code: "ERR_001" }, { detail: "details" })

      const logs = memorySink.getLogs()
      assert.strictEqual(logs.length, 1)
      assert.deepStrictEqual(logs[0].metadata, {
        code: "ERR_001",
        detail: "details",
      })
    })

    it("should respect minimum log level", async () => {
      const logger2 = new Logger({
        sinks: [memorySink],
        console: false,
        minLevel: "warn",
      })

      logger2.debug("Debug")
      logger2.info("Info")
      logger2.warn("Warning")
      logger2.error("Error")

      const logs = memorySink.getLogs()
      assert.strictEqual(logs.length, 2)
      assert.strictEqual(logs[0].level, "warn")
      assert.strictEqual(logs[1].level, "error")

      await logger2.close()
    })

    it("should add timestamp to all log entries", async () => {
      logger.info("Test message")

      const logs = memorySink.getLogs()
      assert.ok(logs[0].timestamp)
      // Check if it's a valid ISO date string
      assert.doesNotThrow(() => new Date(logs[0].timestamp))
    })

    it("should support multiple sinks", async () => {
      const sink2 = new MemoryFileSink()
      logger.addSink(sink2)

      logger.info("Message to both sinks")

      assert.strictEqual(memorySink.size(), 1)
      assert.strictEqual(sink2.size(), 1)
      assert.strictEqual(memorySink.getLogs()[0].message, "Message to both sinks")
      assert.strictEqual(sink2.getLogs()[0].message, "Message to both sinks")
    })

    it("should be able to remove sinks", async () => {
      const sink2 = new MemoryFileSink()
      logger.addSink(sink2)

      logger.info("Message 1")
      logger.removeSink(memorySink)
      logger.info("Message 2")

      assert.strictEqual(memorySink.size(), 1)
      assert.strictEqual(sink2.size(), 2)
    })
  })

  describe("ConsoleSink", () => {
    it("should write to console", () => {
      const sink = new ConsoleSink()
      let capturedOutput = ""

      // Mock console.log
      const originalLog = console.log
      console.log = (msg: string) => {
        capturedOutput = msg
      }

      try {
        sink.write({
          timestamp: "2024-01-01T00:00:00Z",
          level: "info",
          message: "Test message",
          metadata: { key: "value" },
        })

        assert.ok(capturedOutput.includes("Test message"))
        assert.ok(capturedOutput.includes("INFO"))
        assert.ok(capturedOutput.includes("2024-01-01T00:00:00Z"))
      } finally {
        console.log = originalLog
      }
    })

    it("should use correct console method based on level", () => {
      const sink = new ConsoleSink()

      const originalError = console.error
      let errorCalled = false
      console.error = () => {
        errorCalled = true
      }

      try {
        sink.write({
          timestamp: "2024-01-01T00:00:00Z",
          level: "error",
          message: "Error message",
        })

        assert.ok(errorCalled)
      } finally {
        console.error = originalError
      }
    })

    it("should include error information", () => {
      const sink = new ConsoleSink()
      let capturedOutput = ""

      const originalError = console.error
      console.error = (msg: string) => {
        capturedOutput = msg
      }

      try {
        sink.write({
          timestamp: "2024-01-01T00:00:00Z",
          level: "error",
          message: "Error occurred",
          error: {
            name: "TestError",
            message: "Test error message",
            stack: "at test.ts:1:1",
          },
        })

        assert.ok(capturedOutput.includes("TestError"))
        assert.ok(capturedOutput.includes("Test error message"))
      } finally {
        console.error = originalError
      }
    })
  })

  describe("MemoryFileSink", () => {
    let sink: MemoryFileSink

    beforeEach(() => {
      sink = new MemoryFileSink()
    })

    it("should store logs in memory", () => {
      sink.write({
        timestamp: "2024-01-01T00:00:00Z",
        level: "info",
        message: "Test 1",
      })

      sink.write({
        timestamp: "2024-01-01T00:00:01Z",
        level: "warn",
        message: "Test 2",
      })

      assert.strictEqual(sink.size(), 2)
    })

    it("should retrieve stored logs", () => {
      sink.write({
        timestamp: "2024-01-01T00:00:00Z",
        level: "info",
        message: "Test message",
        metadata: { key: "value" },
      })

      const logs = sink.getLogs()
      assert.strictEqual(logs.length, 1)
      assert.strictEqual(logs[0].message, "Test message")
      assert.deepStrictEqual(logs[0].metadata, { key: "value" })
    })

    it("should retrieve raw logs as strings", () => {
      sink.write({
        timestamp: "2024-01-01T00:00:00Z",
        level: "info",
        message: "Test",
      })

      const rawLogs = sink.getRawLogs()
      assert.strictEqual(rawLogs.length, 1)
      assert.strictEqual(typeof rawLogs[0], "string")
      assert.ok(rawLogs[0].includes("Test"))
    })

    it("should clear stored logs", () => {
      sink.write({
        timestamp: "2024-01-01T00:00:00Z",
        level: "info",
        message: "Test",
      })

      assert.strictEqual(sink.size(), 1)
      sink.clear()
      assert.strictEqual(sink.size(), 0)
    })
  })

  describe("Log Levels", () => {
    it("should have correct LogLevel enum values", () => {
      assert.strictEqual(LogLevel.DEBUG, 0)
      assert.strictEqual(LogLevel.INFO, 1)
      assert.strictEqual(LogLevel.WARN, 2)
      assert.strictEqual(LogLevel.ERROR, 3)
    })
  })
})
