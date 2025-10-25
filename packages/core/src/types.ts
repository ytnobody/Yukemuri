import type { Hono, Context, MiddlewareHandler } from 'hono';

// ===== Basic Type Definitions =====

/**
 * Yukemuri application configuration
 */
export interface YukemuriConfig {
  /** Application name */
  name: string;
  /** Version */
  version?: string;
  /** Whether in development mode */
  dev?: boolean;
  /** Database configuration */
  database?: DatabaseConfig;
  /** Plugin configuration */
  plugins?: YukemuriPlugin[];
  /** Custom routes */
  routes?: RouteConfig[];
  /** Middleware configuration */
  middleware?: MiddlewareConfig[];
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  /** Database URL */
  url: string;
  /** Authentication token */
  authToken?: string;
  /** Execute migrations */
  migrate?: boolean;
}

/**
 * Route configuration
 */
export interface RouteConfig {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  /** Path */
  path: string;
  /** Route handler */
  handler: (c: Context) => Response | Promise<Response>;
  /** Middleware */
  middleware?: MiddlewareFunction[];
}

/**
 * Middleware configuration
 */
export interface MiddlewareConfig {
  /** Path pattern */
  path?: string;
  /** Middleware function */
  middleware: MiddlewareFunction;
}

/**
 * Middleware function type
 */
export type MiddlewareFunction = MiddlewareHandler;

// ===== Plugin-Related Types =====

/**
 * Yukemuri plugin
 */
export interface YukemuriPlugin {
  /** Plugin name */
  name: string;
  /** Version */
  version: string;
  /** Description */
  description?: string;
  /** Author */
  author?: string;
  /** License */
  license?: string;
  /** Homepage */
  homepage?: string;
  /** Repository */
  repository?: string;
  /** Dependencies */
  dependencies?: string[];
  /** Peer dependencies */
  peerDependencies?: string[];
  /** Engine requirements */
  engines?: {
    yukemuri?: string;
    node?: string;
  };
  /** Configuration schema */
  configSchema?: ConfigSchema;
  /** Default configuration */
  defaultConfig?: any;
  /** Plugin initialization function */
  init?: InitHook;
  /** Setup hook */
  setup?: SetupHook;
  /** Teardown hook */
  teardown?: TeardownHook;
  /** Additional routes */
  routes?: RouteConfig[];
  /** Additional middleware */
  middleware?: MiddlewareConfig[];
  /** Static files */
  assets?: AssetConfig[];
  /** CLI commands */
  commands?: CommandConfig[];
  /** Client extensions */
  clientExtensions?: ClientExtensions;
}

/**
 * Configuration schema
 */
export interface ConfigSchema {
  type: 'object';
  properties?: Record<string, ConfigProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * Configuration property
 */
export interface ConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
  items?: ConfigProperty;
  properties?: Record<string, ConfigProperty>;
  required?: boolean;
  validation?: (value: any) => boolean | string;
}

/**
 * Plugin context
 */
export interface PluginContext {
  app: YukemuriApp;
  config: any;
  logger: Logger;
  utils: PluginUtils;
  dependencies: Record<string, any>;
}

/**
 * Lifecycle hooks
 */
export type InitHook = (context: PluginContext) => Promise<void> | void;
export type SetupHook = (context: PluginContext) => Promise<void> | void;
export type TeardownHook = (context: PluginContext) => Promise<void> | void;

/**
 * Client extensions
 */
export interface ClientExtensions {
  components?: ComponentConfig[];
  hooks?: HookConfig[];
  utilities?: UtilityConfig[];
}

/**
 * Component configuration
 */
export interface ComponentConfig {
  name: string;
  component: () => Promise<any>;
  props?: Record<string, any>;
}

/**
 * Hook configuration
 */
export interface HookConfig {
  name: string;
  hook: () => Promise<any>;
}

/**
 * Utility configuration
 */
export interface UtilityConfig {
  name: string;
  utility: () => Promise<any>;
}

/**
 * Command configuration
 */
export interface CommandConfig {
  name: string;
  description?: string;
  options?: CommandOption[];
  handler: (args: any[], options: Record<string, any>) => Promise<void> | void;
}

/**
 * Command option
 */
export interface CommandOption {
  name: string;
  alias?: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean';
  required?: boolean;
  default?: any;
}

/**
 * Plugin utilities
 */
export interface PluginUtils {
  env(key: string, fallback?: string): string | undefined;
  createLogger(scope: string): Logger;
  registerGlobal(name: string, value: any): void;
  schedule(fn: () => void | Promise<void>, delay: number): void;
  getDatabase(name?: string): any;
}

/**
 * Logger
 */
export interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  child(metadata: Record<string, any>): Logger;
}

/**
 * Static file configuration
 */
export interface AssetConfig {
  /** Local path */
  from: string;
  /** Public path */
  to: string;
}

// ===== Application Types =====

/**
 * Yukemuri application
 */
export interface YukemuriApp {
  /** Internal Hono instance */
  hono: Hono;
  /** Configuration */
  config: YukemuriConfig;
  /** Add a plugin */
  use(plugin: YukemuriPlugin, config?: any): Promise<YukemuriApp>;
  /** Add a route */
  route(config: RouteConfig): YukemuriApp;
  /** Add middleware */
  middleware(config: MiddlewareConfig): YukemuriApp;
  /** Start the application */
  start(port?: number): Promise<void>;
  /** Get request handler (for Cloudflare Workers) */
  fetch: (request: Request) => Promise<Response>;
}

// ===== CLI-Related Types =====

/**
 * CLI command type
 */
export interface CLICommand {
  name: string;
  description: string;
  options?: CLIOption[];
  action: (...args: any[]) => Promise<void> | void;
}

/**
 * CLI option type
 */
export interface CLIOption {
  flags: string;
  description: string;
  default?: any;
}

// ===== Template-Related Types =====

/**
 * Project template
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
 * Template file
 */
export interface TemplateFile {
  path: string;
  content: string;
  template?: boolean; // Whether this is a Mustache template
}

// ===== Yukemuri Client API Types =====

/**
 * PWA install prompt
 */
export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA management
 */
export interface PWAManager {
  install: () => Promise<boolean>
  isInstallable: () => boolean
  isInstalled: () => boolean
  getStatus: () => PWAStatus
}

/**
 * PWA status information
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
 * Notification management
 */
export interface NotificationManager {
  requestPermission: () => Promise<NotificationPermission>
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>
  subscribeToPush: () => Promise<PushSubscription | null>
  getPermissionStatus: () => NotificationPermission
}

/**
 * Notification options
 */
export interface NotificationOptions {
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

/**
 * QR code management
 */
export interface QRCodeManager {
  generate: (value: string, options?: QRCodeOptions) => Promise<string>
  getCurrentURL: (options?: QRCodeOptions) => Promise<string>
  download: (qrDataURL: string, filename?: string) => void
  generateSVG: (value: string, options?: QRCodeOptions) => Promise<string>
}

/**
 * QR code options
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
 * Storage management
 */
export interface StorageManager {
  local: <T>(key: string, defaultValue: T, options?: StorageOptions<T>) => StorageController<T>
  session: <T>(key: string, defaultValue: T, options?: StorageOptions<T>) => StorageController<T>
  persistent: <T>(key: string, defaultValue: T, options?: PersistentOptions<T>) => PersistentController<T>
}

/**
 * Storage controller
 */
export interface StorageController<T> {
  get: () => T
  set: (value: T | ((prev: T) => T)) => void
  clear: () => void
  subscribe: (callback: (value: T) => void) => () => void
}

/**
 * Persistent storage controller
 */
export interface PersistentController<T> extends StorageController<T> {
  sync: () => Promise<void>
  isSyncing: () => boolean
  lastSynced: () => Date | null
}

/**
 * Storage options
 */
export interface StorageOptions<T = any> {
  serializer?: {
    stringify: (value: T) => string
    parse: (value: string) => T
  }
  syncAcrossTabs?: boolean
}

/**
 * Persistent storage options
 */
export interface PersistentOptions<T = any> extends StorageOptions<T> {
  syncStrategy?: 'immediate' | 'batched' | 'manual'
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge'
  ttl?: number // Time to live in milliseconds
}

/**
 * Network management
 */
export interface NetworkManager {
  status: NetworkStatus
  offlineSync: OfflineSyncManager
  onStatusChange: (callback: (status: NetworkStatus) => void) => () => void
}

/**
 * Network status
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
 * Connection type
 */
export type ConnectionType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'

/**
 * Effective connection type
 */
export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g'

/**
 * Offline sync management
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
 * Queued request
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
 * Sync result
 */
export interface SyncResult {
  id: string
  success: boolean
  response?: Response
  error?: Error
}

/**
 * Device management
 */
export interface DeviceManager {
  info: DeviceInfo
  mediaQuery: (query: string) => boolean
  mediaQueries: (queries: Record<string, string>) => Record<string, boolean>
  onViewportChange: (callback: (viewport: ViewportInfo) => void) => () => void
  onOrientationChange: (callback: (orientation: 'portrait' | 'landscape') => void) => () => void
}

/**
 * Device information
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
 * Viewport information
 */
export interface ViewportInfo {
  width: number
  height: number
  availableWidth: number
  availableHeight: number
}

/**
 * Router management
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
 * Utilities management
 */
export interface UtilsManager {
  clipboard: ClipboardManager
  share: ShareManager
  fullscreen: FullscreenManager
}

/**
 * Clipboard management
 */
export interface ClipboardManager {
  copy: (text: string) => Promise<boolean>
  paste: () => Promise<string>
  isSupported: boolean
  isSecureContext: boolean
}

/**
 * Share management
 */
export interface ShareManager {
  share: (data: ShareData) => Promise<boolean>
  canShare: (data?: ShareData) => boolean
  isSupported: boolean
}

/**
 * Share data
 */
export interface ShareData {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

/**
 * Fullscreen management
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
 * Yukemuri Client API
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