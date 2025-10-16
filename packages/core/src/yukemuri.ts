import { createApp } from './app.js';
import type { 
  YukemuriConfig, 
  YukemuriApp, 
  YukemuriClient,
  PWAManager,
  NotificationManager,
  QRCodeManager,
  StorageManager,
  NetworkManager,
  DeviceManager,
  RouterManager,
  UtilsManager
} from './types.js';
import {
  PWAManagerImpl,
  NotificationManagerImpl,
  QRCodeManagerImpl,
  StorageManagerImpl,
  NetworkManagerImpl,
  DeviceManagerImpl,
  RouterManagerImpl,
  UtilsManagerImpl
} from './client/index.js';

/**
 * Yukemuriフレームワークのファクトリー関数
 */
export function YukemuriFactory(config?: Partial<YukemuriConfig>): YukemuriApp {
  return createApp(config);
}

/**
 * Yukemuri クライアントAPI クラス
 * ブラウザ環境でのPWA機能、UI操作、状態管理などを提供
 */
export class Yukemuri implements YukemuriClient {
  public readonly pwa: PWAManager
  public readonly notifications: NotificationManager
  public readonly qr: QRCodeManager
  public readonly storage: StorageManager
  public readonly network: NetworkManager
  public readonly device: DeviceManager
  public readonly router: RouterManager
  public readonly utils: UtilsManager

  constructor() {
    // 各マネージャーの初期化
    this.pwa = new PWAManagerImpl()
    this.notifications = new NotificationManagerImpl()
    this.qr = new QRCodeManagerImpl()
    this.storage = new StorageManagerImpl()
    this.network = new NetworkManagerImpl()
    this.device = new DeviceManagerImpl()
    this.router = new RouterManagerImpl()
    this.utils = new UtilsManagerImpl()
  }
}

/**
 * 開発用のクイック設定
 */
export function createDevApp(config?: Partial<YukemuriConfig>): YukemuriApp {
  return createApp({
    dev: true,
    ...config,
  });
}

/**
 * 本番用の設定
 */
export function createProdApp(config?: Partial<YukemuriConfig>): YukemuriApp {
  return createApp({
    dev: false,
    ...config,
  });
}