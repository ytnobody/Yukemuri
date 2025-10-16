import type { YukemuriConfig } from './types.js';

/**
 * Yukemuriの設定を定義する
 */
export function defineConfig(config: YukemuriConfig): YukemuriConfig {
  return {
    dev: process.env.NODE_ENV !== 'production',
    version: '1.0.0',
    ...config,
  };
}

/**
 * デフォルト設定を取得する
 */
export function getDefaultConfig(): YukemuriConfig {
  return {
    name: 'yukemuri-app',
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
export function mergeConfig(base: YukemuriConfig, override: Partial<YukemuriConfig>): YukemuriConfig {
  return {
    ...base,
    ...override,
    plugins: [...(base.plugins || []), ...(override.plugins || [])],
    routes: [...(base.routes || []), ...(override.routes || [])],
    middleware: [...(base.middleware || []), ...(override.middleware || [])],
  };
}