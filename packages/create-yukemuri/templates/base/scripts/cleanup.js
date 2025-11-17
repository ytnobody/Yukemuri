#!/usr/bin/env node

/**
 * Yukemuri Cleanup Script ♨️
 * Stops all development servers and tunnels
 */

import { spawn } from "child_process"

console.log("🛑 Stopping all Yukemuri processes...")

// Kill all node processes related to vite/dev servers
const killVite = spawn("pkill", ["-f", "vite.*dev"], { stdio: "inherit" })

killVite.on("close", () => {
  // Kill all ngrok processes
  const killNgrok = spawn("pkill", ["-f", "ngrok"], { stdio: "inherit" })

  killNgrok.on("close", () => {
    // Kill all npm run processes
    const killNpm = spawn("pkill", ["-f", "npm.*run"], { stdio: "inherit" })

    killNpm.on("close", () => {
      console.log("✅ All processes stopped")
      process.exit(0)
    })
  })
})
