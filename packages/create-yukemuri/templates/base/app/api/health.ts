import { Hono } from "hono"
import type { Context } from "hono"

const health = new Hono()

// Export individual handler functions
export const getBasicHealth = (c: Context) => {
  return c.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
  })
}

export const getDetailedHealth = (c: Context) => {
  return c.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "development",
  })
}

// Define routes on the Hono instance
health.get("/", getBasicHealth)
health.get("/detailed", getDetailedHealth)

export default health
