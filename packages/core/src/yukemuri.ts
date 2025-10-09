import { createApp } from './app.js';
import type { YukemariConfig, YukemariApp } from './types.js';

/**
 * Yukemariフレームワークのファクトリー関数
 */
export function Yukemari(config?: Partial<YukemariConfig>): YukemariApp {
  return createApp(config);
}

/**
 * 開発用のクイック設定
 */
export function createDevApp(config?: Partial<YukemariConfig>): YukemariApp {
  return createApp({
    dev: true,
    ...config,
  });
}

/**
 * 本番用の設定
 */
export function createProdApp(config?: Partial<YukemariConfig>): YukemariApp {
  return createApp({
    dev: false,
    ...config,
  });
}