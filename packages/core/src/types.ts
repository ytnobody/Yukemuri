import type { Hono, Context, MiddlewareHandler } from 'hono';

// ===== 基本型定義 =====

/**
 * Yukemariアプリケーションの設定
 */
export interface YukemariConfig {
  /** アプリケーション名 */
  name: string;
  /** バージョン */
  version?: string;
  /** 開発モードかどうか */
  dev?: boolean;
  /** データベース設定 */
  database?: DatabaseConfig;
  /** プラグイン設定 */
  plugins?: YukemariPlugin[];
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
 * Yukemariプラグイン
 */
export interface YukemariPlugin {
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
  init: (app: YukemariApp, config?: any) => Promise<void> | void;
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
 * Yukemariアプリケーション
 */
export interface YukemariApp {
  /** 内部のHonoインスタンス */
  hono: Hono;
  /** 設定 */
  config: YukemariConfig;
  /** プラグインを追加 */
  use(plugin: YukemariPlugin, config?: any): Promise<YukemariApp>;
  /** ルートを追加 */
  route(config: RouteConfig): YukemariApp;
  /** ミドルウェアを追加 */
  middleware(config: MiddlewareConfig): YukemariApp;
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