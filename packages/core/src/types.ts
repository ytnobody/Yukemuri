import type { Hono, Context, MiddlewareHandler } from 'hono';

// ===== 基本型定義 =====

/**
 * Yukemuriアプリケーションの設定
 */
export interface YukemuriConfig {
  /** アプリケーション名 */
  name: string;
  /** バージョン */
  version?: string;
  /** 開発モードかどうか */
  dev?: boolean;
  /** データベース設定 */
  database?: DatabaseConfig;
  /** プラグイン設定 */
  plugins?: YukemuriPlugin[];
  /** カスタムルート */
  routes?: RouteConfig[];
  /** ミドルウェア設定 */
  middleware?: MiddlewareConfig[];
}

/**
 * データベース設定
 */
export interface DatabaseConfig {
  /** データベースURL */
  url: string;
  /** 認証トークン */
  authToken?: string;
  /** マイグレーションの実行 */
  migrate?: boolean;
}

/**
 * ルート設定
 */
export interface RouteConfig {
  /** HTTPメソッド */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  /** パス */
  path: string;
  /** ハンドラー */
  handler: (c: Context) => Response | Promise<Response>;
  /** ミドルウェア */
  middleware?: MiddlewareFunction[];
}

/**
 * ミドルウェア設定
 */
export interface MiddlewareConfig {
  /** パスパターン */
  path?: string;
  /** ミドルウェア関数 */
  middleware: MiddlewareFunction;
}

/**
 * ミドルウェア関数の型
 */
export type MiddlewareFunction = MiddlewareHandler;

// ===== プラグイン関連型 =====

/**
 * Yukemuriプラグイン
 */
export interface YukemuriPlugin {
  /** プラグイン名 */
  name: string;
  /** バージョン */
  version: string;
  /** 説明 */
  description?: string;
  /** 依存関係 */
  dependencies?: string[];
  /** 設定スキーマ */
  configSchema?: Record<string, ConfigProperty>;
  /** プラグインの初期化関数 */
  init: (app: YukemuriApp, config?: any) => Promise<void> | void;
  /** 追加ルート */
  routes?: RouteConfig[];
  /** 追加ミドルウェア */
  middleware?: MiddlewareConfig[];
  /** 静的ファイル */
  assets?: AssetConfig[];
}

/**
 * 設定プロパティ
 */
export interface ConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  default?: any;
  description?: string;
  validation?: (value: any) => boolean | string;
}

/**
 * 静的ファイル設定
 */
export interface AssetConfig {
  /** ローカルパス */
  from: string;
  /** 公開パス */
  to: string;
}

// ===== アプリケーション型 =====

/**
 * Yukemuriアプリケーション
 */
export interface YukemuriApp {
  /** 内部のHonoインスタンス */
  hono: Hono;
  /** 設定 */
  config: YukemuriConfig;
  /** プラグインを追加 */
  use(plugin: YukemuriPlugin, config?: any): Promise<YukemuriApp>;
  /** ルートを追加 */
  route(config: RouteConfig): YukemuriApp;
  /** ミドルウェアを追加 */
  middleware(config: MiddlewareConfig): YukemuriApp;
  /** アプリケーションを開始 */
  start(port?: number): Promise<void>;
  /** リクエストハンドラーを取得（Cloudflare Workers用） */
  fetch: (request: Request) => Promise<Response>;
}

// ===== CLI関連型 =====

/**
 * CLIコマンドの型
 */
export interface CLICommand {
  name: string;
  description: string;
  options?: CLIOption[];
  action: (...args: any[]) => Promise<void> | void;
}

/**
 * CLIオプションの型
 */
export interface CLIOption {
  flags: string;
  description: string;
  default?: any;
}

// ===== テンプレート関連型 =====

/**
 * プロジェクトテンプレート
 */
export interface ProjectTemplate {
  name: string;
  description: string;
  files: TemplateFile[];
  dependencies: string[];
  devDependencies?: string[];
  scripts?: Record<string, string>;
}

/**
 * テンプレートファイル
 */
export interface TemplateFile {
  path: string;
  content: string;
  template?: boolean; // Mustacheテンプレートかどうか
}

// ===== Yukemuri Client API関連型 =====

/**
 * PWAインストールプロンプト
 */
export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA管理機能
 */
export interface PWAManager {
  install: () => Promise<boolean>
  isInstallable: () => boolean
  isInstalled: () => boolean
  getStatus: () => PWAStatus
}

/**
 * PWA状態情報
 */
export interface PWAStatus {
  hasServiceWorker: boolean
  hasManifest: boolean
  isHTTPS: boolean
  installPromptAvailable: boolean
  isInstalled: boolean
  notificationPermission: NotificationPermission
}

/**
 * 通知管理機能
 */
export interface NotificationManager {
  requestPermission: () => Promise<NotificationPermission>
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>
  subscribeToPush: () => Promise<PushSubscription | null>
  getPermissionStatus: () => NotificationPermission
}

/**
 * 通知オプション
 */
export interface NotificationOptions {
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

/**
 * QRコード管理機能
 */
export interface QRCodeManager {
  generate: (value: string, options?: QRCodeOptions) => Promise<string>
  getCurrentURL: (options?: QRCodeOptions) => Promise<string>
  download: (qrDataURL: string, filename?: string) => void
  generateSVG: (value: string, options?: QRCodeOptions) => Promise<string>
}

/**
 * QRコードオプション
 */
export interface QRCodeOptions {
  size?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  type?: 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number
}

/**
 * ストレージ管理機能
 */
export interface StorageManager {
  local: <T>(key: string, defaultValue: T, options?: StorageOptions<T>) => StorageController<T>
  session: <T>(key: string, defaultValue: T, options?: StorageOptions<T>) => StorageController<T>
  persistent: <T>(key: string, defaultValue: T, options?: PersistentOptions<T>) => PersistentController<T>
}

/**
 * ストレージコントローラー
 */
export interface StorageController<T> {
  get: () => T
  set: (value: T | ((prev: T) => T)) => void
  clear: () => void
  subscribe: (callback: (value: T) => void) => () => void
}

/**
 * 永続化ストレージコントローラー
 */
export interface PersistentController<T> extends StorageController<T> {
  sync: () => Promise<void>
  isSyncing: () => boolean
  lastSynced: () => Date | null
}

/**
 * ストレージオプション
 */
export interface StorageOptions<T = any> {
  serializer?: {
    stringify: (value: T) => string
    parse: (value: string) => T
  }
  syncAcrossTabs?: boolean
}

/**
 * 永続化オプション
 */
export interface PersistentOptions<T = any> extends StorageOptions<T> {
  syncStrategy?: 'immediate' | 'batched' | 'manual'
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge'
  ttl?: number // Time to live in milliseconds
}

/**
 * ネットワーク管理機能
 */
export interface NetworkManager {
  status: NetworkStatus
  offlineSync: OfflineSyncManager
  onStatusChange: (callback: (status: NetworkStatus) => void) => () => void
}

/**
 * ネットワーク状態
 */
export interface NetworkStatus {
  isOnline: boolean
  isOffline: boolean
  connectionType: ConnectionType
  effectiveType: EffectiveConnectionType
  downlink: number
  rtt: number
  saveData: boolean
}

/**
 * 接続タイプ
 */
export type ConnectionType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'

/**
 * 実効接続タイプ
 */
export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g'

/**
 * オフライン同期管理
 */
export interface OfflineSyncManager {
  queueRequest: (request: QueuedRequest) => Promise<string>
  syncWhenOnline: () => Promise<SyncResult[]>
  getPendingRequests: () => QueuedRequest[]
  clearQueue: () => Promise<void>
  retryFailedRequests: () => Promise<SyncResult[]>
  issyncing: boolean
  pendingCount: number
}

/**
 * キューイングリクエスト
 */
export interface QueuedRequest {
  id?: string
  url: string
  method: string
  headers?: Record<string, string>
  body?: any
  priority?: 'high' | 'normal' | 'low'
  maxRetries?: number
}

/**
 * 同期結果
 */
export interface SyncResult {
  id: string
  success: boolean
  response?: Response
  error?: Error
}

/**
 * デバイス管理機能
 */
export interface DeviceManager {
  info: DeviceInfo
  mediaQuery: (query: string) => boolean
  mediaQueries: (queries: Record<string, string>) => Record<string, boolean>
  onViewportChange: (callback: (viewport: ViewportInfo) => void) => () => void
  onOrientationChange: (callback: (orientation: 'portrait' | 'landscape') => void) => () => void
}

/**
 * デバイス情報
 */
export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  userAgent: string
  viewport: ViewportInfo
  orientation: 'portrait' | 'landscape'
  pixelRatio: number
  platform: string
}

/**
 * ビューポート情報
 */
export interface ViewportInfo {
  width: number
  height: number
  availableWidth: number
  availableHeight: number
}

/**
 * ルーター管理機能
 */
export interface RouterManager {
  push: (path: string, state?: any) => void
  replace: (path: string, state?: any) => void
  back: () => void
  forward: () => void
  go: (delta: number) => void
  getCurrentPath: () => string
  getParams: () => Record<string, string>
  getQuery: () => URLSearchParams
  isActive: (path: string) => boolean
  onNavigate: (callback: (path: string) => void) => () => void
}

/**
 * ユーティリティ管理機能
 */
export interface UtilsManager {
  clipboard: ClipboardManager
  share: ShareManager
  fullscreen: FullscreenManager
}

/**
 * クリップボード管理
 */
export interface ClipboardManager {
  copy: (text: string) => Promise<boolean>
  paste: () => Promise<string>
  isSupported: boolean
  isSecureContext: boolean
}

/**
 * 共有管理
 */
export interface ShareManager {
  share: (data: ShareData) => Promise<boolean>
  canShare: (data?: ShareData) => boolean
  isSupported: boolean
}

/**
 * 共有データ
 */
export interface ShareData {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

/**
 * フルスクリーン管理
 */
export interface FullscreenManager {
  enter: (element?: HTMLElement) => Promise<void>
  exit: () => Promise<void>
  toggle: (element?: HTMLElement) => Promise<void>
  isFullscreen: boolean
  isSupported: boolean
  element: Element | null
}

/**
 * Yukemuri クライアントAPI
 */
export interface YukemuriClient {
  pwa: PWAManager
  notifications: NotificationManager
  qr: QRCodeManager
  storage: StorageManager
  network: NetworkManager
  device: DeviceManager
  router: RouterManager
  utils: UtilsManager
}