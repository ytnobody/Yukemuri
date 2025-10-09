# Yukemuri ♨️

Internet edge framework for rapid building your PWA

## 概要

Yukemariは、小・中規模のサービスベンダーや個人開発者向けに開発速度を劇的に向上させるメタフレームワークです。湯けむりのように、温かく心地よい開発体験を提供します。

## 特徴

- **エッジファースト**: Cloudflare Workers上で動作
- **型安全**: TypeScript + HonoXベース  
- **高速データベース**: Turso (エッジ最適化SQLite)
- **プラグインシステム**: 必要な機能を段階的に追加
- **ゼロコンフィグ**: すぐに開発を始められる

## クイックスタート

```bash
# 新しいプロジェクトを作成
npx create-yukemuri my-app
cd my-app

# 開発サーバーを起動
npm run dev

# プラグインを追加
yukemuri add auth-google
yukemuri add payment-stripe
```

## パッケージ構成

- `@yukemuri/core` - コアフレームワーク
- `create-yukemuri` - プロジェクト作成ツール
- `@yukemuri/plugin-*` - 公式プラグイン

## ライセンス

MIT