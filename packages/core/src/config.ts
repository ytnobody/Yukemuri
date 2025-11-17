import type { YukemuriConfig } from "./types.js"

/**
 * Define Yukemuri configuration
 */
export function defineConfig(config: YukemuriConfig): YukemuriConfig {
  return {
    dev: process.env.NODE_ENV !== "production",
    version: "1.0.0",
    ...config,
  }
}

/**
 * Get default configuration
 */
export function getDefaultConfig(): YukemuriConfig {
  return {
    name: "yukemuri-app",
    version: "1.0.0",
    dev: process.env.NODE_ENV !== "production",
    plugins: [],
    routes: [],
    middleware: [],
  }
}

/**
 * Merge configurations
 */
export function mergeConfig(
  base: YukemuriConfig,
  override: Partial<YukemuriConfig>
): YukemuriConfig {
  return {
    ...base,
    ...override,
    plugins: [...(base.plugins || []), ...(override.plugins || [])],
    routes: [...(base.routes || []), ...(override.routes || [])],
    middleware: [...(base.middleware || []), ...(override.middleware || [])],
  }
}
