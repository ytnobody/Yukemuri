// フレームワークのメインエクスポート
export {
  YukemuriFactory as createYukemuriApp,
  Yukemuri,
  createDevApp,
  createProdApp,
} from "./yukemuri.js"
export { createApp } from "./app.js"
export { defineConfig, getDefaultConfig, mergeConfig } from "./config.js"
export { createPlugin, createConfigSchema, validatePluginConfig } from "./plugins/index.js"

// 型定義のエクスポート
export type {
  YukemuriApp,
  YukemuriConfig,
  YukemuriPlugin,
  YukemuriClient,
  RouteConfig,
  MiddlewareConfig,
  DatabaseConfig,
  CLICommand,
  ProjectTemplate,
  // Client API 型定義
  PWAManager,
  PWAStatus,
  NotificationManager,
  NotificationOptions,
  QRCodeManager,
  QRCodeOptions,
  StorageManager,
  StorageController,
  PersistentController,
  StorageOptions,
  PersistentOptions,
  NetworkManager,
  NetworkStatus,
  OfflineSyncManager,
  QueuedRequest,
  SyncResult,
  DeviceManager,
  DeviceInfo,
  ViewportInfo,
  RouterManager,
  UtilsManager,
  ClipboardManager,
  ShareManager,
  ShareData,
  FullscreenManager,
} from "./types.js"

// ユーティリティのエクスポート
export {
  createLogger,
  getEnv,
  requireEnv,
  normalizePath,
  deepMerge,
  retry,
  sleep,
  generateId,
} from "./utils/index.js"
