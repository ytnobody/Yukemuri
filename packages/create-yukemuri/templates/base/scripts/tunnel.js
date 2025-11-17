#!/usr/bin/env node

/**
 * Yukemuri Tunnel Script ♨️
 * Automatically starts development server and creates ngrok tunnel
 * Requires ngrok to be installed globally: npm install -g ngrok
 */

import { spawn } from "child_process"

const DEV_PORT_START = 5173 // Starting port to try

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function log(message, color = "") {
  console.log(`${color}${message}${colors.reset}`)
}

function logHeader() {
  log("\n♨️  Yukemuri Tunnel Setup", colors.bold + colors.cyan)
  log("━".repeat(50), colors.cyan)
}

// Check if ngrok is installed
function checkNgrokInstalled() {
  return new Promise(resolve => {
    const child = spawn("ngrok", ["--version"], { stdio: "pipe" })
    child.on("close", code => {
      resolve(code === 0)
    })
    child.on("error", () => {
      resolve(false)
    })
  })
}

async function startDevServer() {
  log("🚀 Starting development server...", colors.blue)

  const devServer = spawn("npm", ["run", "dev:host"], {
    stdio: "pipe",
    env: { ...process.env },
  })

  let serverReady = false
  let actualPort = null

  return new Promise((resolve, reject) => {
    devServer.stdout.on("data", data => {
      const output = data.toString()
      process.stdout.write(output)

      // Extract actual port from Vite output
      const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)\//)
      if (portMatch && !actualPort) {
        actualPort = parseInt(portMatch[1])
        log(`📱 Detected server port: ${actualPort}`, colors.cyan)
      }

      if (output.includes("ready in") && !serverReady) {
        serverReady = true
        clearTimeout(timeoutId)

        // Use detected port or default to 5173
        const finalPort = actualPort || 5173
        log(`📱 Local server started on port: ${finalPort}`, colors.cyan)
        resolve({ process: devServer, port: finalPort })
      }
    })

    devServer.stderr.on("data", data => {
      const output = data.toString()
      // Filter out non-critical WebSocket errors
      if (!output.includes("WebSocket server error") && !output.includes("EADDRNOTAVAIL")) {
        process.stderr.write(output)
      }
    })

    devServer.on("error", error => {
      reject(error)
    })

    // Timeout after 30 seconds
    const timeoutId = setTimeout(() => {
      if (!serverReady) {
        reject(new Error("Development server failed to start within 30 seconds"))
      }
    }, 30000)
  })
}

async function createTunnel(port) {
  log("🌐 Creating ngrok tunnel...", colors.blue)

  // Start ngrok tunnel using system ngrok with JSON logging
  const tunnel = spawn("ngrok", ["http", port.toString(), "--log=stdout", "--log-format=json"], {
    stdio: "pipe",
  })

  return new Promise((resolve, reject) => {
    let urlFound = false

    tunnel.stdout.on("data", data => {
      const lines = data.toString().split("\n")

      for (const line of lines) {
        if (line.trim()) {
          try {
            const logEntry = JSON.parse(line)

            // Look for tunnel started log entry
            if (logEntry.msg === "started tunnel" && logEntry.url && !urlFound) {
              urlFound = true
              const url = logEntry.url

              log(`✅ Tunnel created: ${url}`, colors.green)
              log(`📱 Local URL:  http://localhost:${port}`, colors.cyan)
              log(`🌍 Public URL: ${url}`, colors.green)
              log("\n🔄 HMR will work through ngrok tunnel", colors.cyan)
              log("\n⚠️  Press Ctrl+C to stop tunnel", colors.yellow)
              resolve({ url, process: tunnel })
              return
            }
          } catch (e) {
            // Ignore JSON parse errors for non-JSON lines
          }
        }
      }
    })

    tunnel.stderr.on("data", data => {
      const error = data.toString()
      if (error.includes("command not found") || error.includes("not found")) {
        reject(new Error("ngrok not found. Please install ngrok globally: npm install -g ngrok"))
      } else if (
        error.includes("tunnel session failed") ||
        error.includes("authentication failed")
      ) {
        reject(new Error("ngrok authentication failed. Please run: ngrok authtoken YOUR_TOKEN"))
      }
    })

    tunnel.on("error", error => {
      reject(error)
    })

    // Timeout after 15 seconds
    setTimeout(() => {
      if (!urlFound) {
        tunnel.kill()
        reject(new Error("Failed to create tunnel within 15 seconds"))
      }
    }, 15000)
  })
}

async function main() {
  try {
    logHeader()

    // Check if ngrok is installed
    const ngrokInstalled = await checkNgrokInstalled()
    if (!ngrokInstalled) {
      log("❌ ngrok not found", colors.red)
      log("\n📦 Please install ngrok first:", colors.yellow)
      log("   npm install -g ngrok", colors.cyan)
      log("   # OR download from https://ngrok.com", colors.cyan)
      log("\n🔑 Then set your authtoken:", colors.yellow)
      log("   ngrok authtoken YOUR_TOKEN", colors.cyan)
      process.exit(1)
    }

    // 1. Start development server first and get actual port
    const { process: devServer, port: actualPort } = await startDevServer()

    // 2. Create tunnel for the actual port
    const { url: ngrokUrl, process: tunnelProcess } = await createTunnel(actualPort)

    // Handle cleanup
    const cleanup = () => {
      log("\n🛑 Stopping services...", colors.yellow)

      // Kill processes more specifically
      if (tunnelProcess && !tunnelProcess.killed) {
        tunnelProcess.kill("SIGTERM")
        setTimeout(() => {
          if (!tunnelProcess.killed) {
            tunnelProcess.kill("SIGKILL")
          }
        }, 2000)
      }

      if (devServer && !devServer.killed) {
        devServer.kill("SIGTERM")
        setTimeout(() => {
          if (!devServer.killed) {
            devServer.kill("SIGKILL")
          }
        }, 2000)
      }

      log("✅ Services stopped", colors.green)
      process.exit(0)
    }

    process.on("SIGINT", cleanup)
    process.on("SIGTERM", cleanup)

    // Keep process alive
    process.stdin.resume()
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red)

    if (error.message.includes("ngrok not found")) {
      log("\n📦 Install ngrok:", colors.yellow)
      log("   npm install -g ngrok", colors.cyan)
      log("   # OR download from https://ngrok.com", colors.cyan)
    } else if (error.message.includes("authentication failed")) {
      log("\n🔑 Set your authtoken:", colors.yellow)
      log("   ngrok authtoken YOUR_TOKEN", colors.cyan)
      log("   # Get token from https://ngrok.com", colors.cyan)
    }

    process.exit(1)
  }
}

main()
