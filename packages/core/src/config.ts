import type { YukemariConfig } from './types.js';

/**
 * Yukemariの設定を定義する
 */
export function defineConfig(config: YukemariConfig): YukemariConfig {
  return {
    dev: process.env.NODE_ENV !== 'production',
    version: '1.0.0',
    ...config,
  };
}

/**
 * デフォルト設定を取得する
 */
export function getDefaultConfig(): YukemariConfig {
  return {
    name: 'yukemari-app',
    version: '1.0.0',
    dev: process.env.NODE_ENV !== 'production',
    plugins: [],
    routes: [],
    middleware: [],
  };
}

/**
 * 設定をマージする
 */
export function mergeConfig(base: YukemariConfig, override: Partial<YukemariConfig>): YukemariConfig {
  return {
    ...base,
    ...override,
    plugins: [...(base.plugins || []), ...(override.plugins || [])],
    routes: [...(base.routes || []), ...(override.routes || [])],
    middleware: [...(base.middleware || []), ...(override.middleware || [])],
  };
}