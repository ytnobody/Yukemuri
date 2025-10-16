# Yukemuri Framework Features Specification ♨️

Yukemuriフレームワークが提供するコア機能とAPIの仕様定義

## 🏗️ Core Framework API

### `Yukemuri` Class
フレームワークのメインクラス。すべての機能にアクセスするためのエントリーポイント

**基本使用法:**
```typescript
import { Yukemuri } from 'yukemuri'

const yu = new Yukemuri()
```

---

## 📱 PWA (Progressive Web App) Functions

### `yu.pwa`
PWAの基本機能を管理するためのAPI群

**機能概要:**
- アプリのインストール機能
- インストール状態の確認
- PWA対応状況の診断

**API仕様:**
```typescript
interface PWAManager {
  install: () => Promise<boolean>
  isInstallable: () => boolean
  isInstalled: () => boolean
  getStatus: () => PWAStatus
}

interface PWAStatus {
  hasServiceWorker: boolean
  hasManifest: boolean
  isHTTPS: boolean
  installPromptAvailable: boolean
  isInstalled: boolean
  notificationPermission: NotificationPermission
}
```

**使用例:**
```typescript
const yu = new Yukemuri()

// アプリをインストール
if (yu.pwa.isInstallable()) {
  await yu.pwa.install()
}

// PWA診断情報を取得
const status = yu.pwa.getStatus()
console.log('PWA Status:', status)
```

---

### `yu.notifications`
プッシュ通知機能を管理するAPI

**機能概要:**
- 通知許可の管理
- プッシュ通知の送信
- VAPID対応のプッシュ購読

**API仕様:**
```typescript
interface NotificationManager {
  requestPermission: () => Promise<NotificationPermission>
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>
  subscribeToPush: () => Promise<PushSubscription | null>
  getPermissionStatus: () => NotificationPermission
}

interface NotificationOptions {
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}
```

**使用例:**
```typescript
const yu = new Yukemuri()

// 通知許可を要求
const permission = await yu.notifications.requestPermission()

if (permission === 'granted') {
  // テスト通知を送信
  await yu.notifications.sendNotification('Yukemuri ♨️', {
    body: '通知が有効になりました！',
    icon: '/icons/icon-192x192.png'
  })
  
  // プッシュ通知に購読
  const subscription = await yu.notifications.subscribeToPush()
}
```

---

## 📊 QR Code Functions

### `yu.qr`
QRコード生成・管理機能

**機能概要:**
- 任意のテキストからQRコード生成
- 現在のURLのQRコード生成
- QRコードのダウンロード機能
- カスタマイズ可能なスタイリング

**API仕様:**
```typescript
interface QRCodeManager {
  generate: (value: string, options?: QRCodeOptions) => Promise<string>
  getCurrentURL: (options?: QRCodeOptions) => Promise<string>
  download: (qrDataURL: string, filename?: string) => void
  generateSVG: (value: string, options?: QRCodeOptions) => Promise<string>
}

interface QRCodeOptions {
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
```

**使用例:**
```typescript
const yu = new Yukemuri()

// カスタムQRコード生成
const qrDataURL = await yu.qr.generate('https://example.com', {
  size: 300,
  color: { dark: '#1a365d', light: '#ffffff' }
})

// 現在のページのQRコード
const currentQR = await yu.qr.getCurrentURL({ size: 200 })

// QRコードをダウンロード
yu.qr.download(qrDataURL, 'my-qr-code.png')
```

---

## 🔄 State Management Functions

### `yu.storage`
各種ストレージとの連携機能

**機能概要:**
- LocalStorageとの自動同期
- SessionStorageとの自動同期
- PWA対応のオフライン状態管理
- 型安全な値の管理

**API仕様:**
```typescript
interface StorageManager {
  local: <T>(key: string, defaultValue: T, options?: StorageOptions) => StorageController<T>
  session: <T>(key: string, defaultValue: T, options?: StorageOptions) => StorageController<T>
  persistent: <T>(key: string, defaultValue: T, options?: PersistentOptions) => PersistentController<T>
}

interface StorageController<T> {
  get: () => T
  set: (value: T | ((prev: T) => T)) => void
  clear: () => void
  subscribe: (callback: (value: T) => void) => () => void
}

interface PersistentController<T> extends StorageController<T> {
  sync: () => Promise<void>
  isSyncing: () => boolean
  lastSynced: () => Date | null
}
```

**使用例:**
```typescript
const yu = new Yukemuri()

// LocalStorage
const username = yu.storage.local('username', '')
username.set('user123')
console.log(username.get()) // 'user123'

// SessionStorage  
const tempData = yu.storage.session('temp-data', { count: 0 })
tempData.set(prev => ({ ...prev, count: prev.count + 1 }))

// Persistent Storage (PWA対応)
const userData = yu.storage.persistent('user-data', { preferences: {} })
await userData.sync()
```

---

## 🌐 Network Functions

### `yu.network`
ネットワーク接続状態の監視とオフライン対応

**機能概要:**
- リアルタイム接続状態監視
- 接続タイプの検出
- オフライン時のリクエストキューイング
- オンライン復帰時の自動同期

**API仕様:**
```typescript
interface NetworkManager {
  status: NetworkStatus
  offlineSync: OfflineSyncManager
  onStatusChange: (callback: (status: NetworkStatus) => void) => () => void
}

interface NetworkStatus {
  isOnline: boolean
  isOffline: boolean
  connectionType: ConnectionType
  effectiveType: EffectiveConnectionType
  downlink: number
  rtt: number
  saveData: boolean
}

interface OfflineSyncManager {
  queueRequest: (request: QueuedRequest) => Promise<string>
  syncWhenOnline: () => Promise<SyncResult[]>
  getPendingRequests: () => QueuedRequest[]
  clearQueue: () => Promise<void>
  retryFailedRequests: () => Promise<SyncResult[]>
  issyncing: boolean
  pendingCount: number
}
```

**使用例:**
```typescript
const yu = new Yukemuri()

// ネットワーク状態の監視
console.log('Online:', yu.network.status.isOnline)

yu.network.onStatusChange((status) => {
  if (status.isOffline) {
    showOfflineMessage()
  }
})

// オフライン時のリクエストキューイング
if (yu.network.status.isOffline) {
  await yu.network.offlineSync.queueRequest({
    url: '/api/users',
    method: 'POST',
    body: userData,
    priority: 'high'
  })
} else {
  // オンライン時は即座に送信
  await fetch('/api/users', { method: 'POST', body: JSON.stringify(userData) })
}
```

---

## 📱 Device Information Functions

### `yu.device`
デバイス情報の取得とレスポンシブ対応

**機能概要:**
- デバイスタイプの判定
- 画面サイズとビューポート情報
- メディアクエリの監視
- タッチ対応状況

**API仕様:**
```typescript
interface DeviceManager {
  info: DeviceInfo
  mediaQuery: (query: string) => boolean
  mediaQueries: (queries: Record<string, string>) => Record<string, boolean>
  onViewportChange: (callback: (viewport: ViewportInfo) => void) => () => void
  onOrientationChange: (callback: (orientation: 'portrait' | 'landscape') => void) => () => void
}

interface DeviceInfo {
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

interface ViewportInfo {
  width: number
  height: number
  availableWidth: number
  availableHeight: number
}
```

**使用例:**
```typescript
const yu = new Yukemuri()

// デバイス情報の取得
const { isMobile, isTablet, viewport } = yu.device.info

// レスポンシブレイアウトの調整
const layoutClass = isMobile ? 'mobile-layout' : isTablet ? 'tablet-layout' : 'desktop-layout'

// メディアクエリの監視
const isMobileView = yu.device.mediaQuery('(max-width: 768px)')

// 複数のブレークポイント監視
const breakpoints = yu.device.mediaQueries({
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)'
})

// ビューポート変更の監視
yu.device.onViewportChange((viewport) => {
  console.log('Viewport changed:', viewport.width, 'x', viewport.height)
})
```

---

## 🛣️ Routing Functions

### `yu.router`
ファイルベースルーティングの制御

**機能概要:**
- プログラマティックナビゲーション
- ルートパラメーターの取得
- 履歴管理
- ナビゲーションガード

**API仕様:**
```typescript
interface RouterManager {
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
```

**使用例:**
```typescript
const yu = new Yukemuri()

// プログラマティックナビゲーション
const navigateToUser = (userId: string) => {
  yu.router.push(`/users/${userId}`)
}

// パラメーターの取得
const params = yu.router.getParams() // { id: "123" } for /users/123
const query = yu.router.getQuery()   // URLSearchParams for ?tab=profile&sort=name

// 条件付きナビゲーション
const handleSave = async () => {
  try {
    await saveData()
    yu.router.push('/success')
  } catch (error) {
    yu.router.push('/error', { error: error.message })
  }
}

// ナビゲーション監視
yu.router.onNavigate((path) => {
  console.log('Navigated to:', path)
})
```

---

## 🔧 Utility Functions

### `yu.utils`
便利なユーティリティ機能群

**機能概要:**
- クリップボード操作
- Web Share API統合
- フルスクリーン制御
- その他の便利機能

**API仕様:**
```typescript
interface UtilsManager {
  clipboard: ClipboardManager
  share: ShareManager
  fullscreen: FullscreenManager
}

interface ClipboardManager {
  copy: (text: string) => Promise<boolean>
  paste: () => Promise<string>
  isSupported: boolean
  isSecureContext: boolean
}

interface ShareManager {
  share: (data: ShareData) => Promise<boolean>
  canShare: (data?: ShareData) => boolean
  isSupported: boolean
}

interface FullscreenManager {
  enter: (element?: HTMLElement) => Promise<void>
  exit: () => Promise<void>
  toggle: (element?: HTMLElement) => Promise<void>
  isFullscreen: boolean
  isSupported: boolean
  element: Element | null
}
```

**使用例:**
```typescript
const yu = new Yukemuri()

// クリップボード操作
if (yu.utils.clipboard.isSupported) {
  const success = await yu.utils.clipboard.copy(window.location.href)
  if (success) {
    showToast('URLをコピーしました')
  }
}

// 共有機能
const shareData = {
  title: 'Yukemuri App',
  text: '素晴らしいPWAフレームワーク',
  url: window.location.href
}

if (yu.utils.share.canShare(shareData)) {
  await yu.utils.share.share(shareData)
}

// フルスクリーン制御
if (yu.utils.fullscreen.isSupported) {
  await yu.utils.fullscreen.toggle()
}
```

---

## 🏗️ Implementation Priority

### High Priority (即座に実装)
- `yu.pwa` - 既存コードのリファクタリング
- `yu.notifications` - 既存コードのリファクタリング  
- `yu.qr` - 既存コンポーネントの関数化
- `yu.router` - ファイルベースルーティングとの統合

### Medium Priority (次フェーズ)
- `yu.storage` - 基本的な状態管理機能
- `yu.network` - PWAの基盤機能
- `yu.device` - レスポンシブ対応機能

### Low Priority (将来実装)
- `yu.storage.persistent()` - 高度な状態管理
- `yu.network.offlineSync` - 複雑な同期機能
- `yu.utils` - 便利機能群

---

## 📋 Implementation Notes

### Framework Design Principles
- すべての機能はYukemuriクラスのインスタンスから提供
- TypeScriptで型安全に実装
- Preact環境での最適化
- ServiceWorkerとの連携を考慮
- エラーハンドリングとローディング状態を標準装備
- ブラウザ互換性とフォールバック対応
- PWA要件への準拠
- パフォーマンスとメモリ効率の最適化

### API Design Guidelines
- 一貫性のあるメソッド命名
- プロミスベースの非同期処理
- オプション引数による柔軟な設定
- イベントリスナーによるリアクティブな更新
- チェーンメソッドによる直感的なAPI