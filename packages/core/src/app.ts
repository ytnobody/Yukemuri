import { Hono } from 'hono';
import type { 
  YukemuriConfig, 
  YukemuriApp, 
  YukemuriPlugin, 
  RouteConfig, 
  MiddlewareConfig 
} from './types.js';
import { getDefaultConfig, mergeConfig } from './config.js';

/**
 * Yukemuriアプリケーションを作成する
 */
export function createApp(userConfig?: Partial<YukemuriConfig>): YukemuriApp {
  const config = mergeConfig(getDefaultConfig(), userConfig || {});
  const hono = new Hono();

  // 内部状態
  const state = {
    plugins: new Map<string, YukemuriPlugin>(),
    initialized: false,
  };

  /**
   * プラグインを追加する
   */
  const use = async (plugin: YukemuriPlugin, pluginConfig?: any): Promise<YukemuriApp> => {
    if (state.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    // プラグインを登録
    state.plugins.set(plugin.name, plugin);

    // プラグインの初期化
    await plugin.init(app, pluginConfig);

    // プラグインのルートを追加
    if (plugin.routes) {
      plugin.routes.forEach(route => {
        addRoute(route);
      });
    }

    // プラグインのミドルウェアを追加
    if (plugin.middleware) {
      plugin.middleware.forEach(middleware => {
        addMiddleware(middleware);
      });
    }

    return app;
  };

  /**
   * ルートを追加する
   */
  const route = (routeConfig: RouteConfig): YukemuriApp => {
    addRoute(routeConfig);
    return app;
  };

  /**
   * ミドルウェアを追加する
   */
  const middleware = (middlewareConfig: MiddlewareConfig): YukemuriApp => {
    addMiddleware(middlewareConfig);
    return app;
  };

  /**
   * アプリケーションを開始する（開発用）
   */
  const start = async (port = 3000): Promise<void> => {
    if (!state.initialized) {
      await initialize();
    }

    console.log(`🚀 Yukemuri server starting on http://localhost:${port}`);
    
    // Node.js環境での起動（開発用）
    const { serve } = await import('@hono/node-server');
    serve({
      fetch: hono.fetch,
      port,
    });
  };

  /**
   * Fetchハンドラーを取得する（Cloudflare Workers用）
   */
  const fetch = async (request: Request): Promise<Response> => {
    if (!state.initialized) {
      await initialize();
    }
    return hono.fetch(request);
  };

  /**
   * 初期化処理
   */
  const initialize = async (): Promise<void> => {
    if (state.initialized) return;

    // 設定からルートを追加
    config.routes?.forEach(routeConfig => {
      addRoute(routeConfig);
    });

    // 設定からミドルウェアを追加
    config.middleware?.forEach(middlewareConfig => {
      addMiddleware(middlewareConfig);
    });

    // 設定からプラグインを追加
    if (config.plugins) {
      for (const plugin of config.plugins) {
        await use(plugin);
      }
    }

    state.initialized = true;
  };

  /**
   * 内部関数: ルート追加
   */
  const addRoute = (routeConfig: RouteConfig): void => {
    const { method, path, handler, middleware: routeMiddleware } = routeConfig;
    
    if (routeMiddleware && routeMiddleware.length > 0) {
      // ミドルウェア付きルート - 各ミドルウェアを先に登録
      routeMiddleware.forEach(mw => hono.use(path, mw));
      hono.on(method.toLowerCase() as any, path, handler);
    } else {
      // シンプルルート
      hono.on(method.toLowerCase() as any, path, handler);
    }
  };

  /**
   * 内部関数: ミドルウェア追加
   */
  const addMiddleware = (middlewareConfig: MiddlewareConfig): void => {
    if (middlewareConfig.path) {
      hono.use(middlewareConfig.path, middlewareConfig.middleware);
    } else {
      hono.use(middlewareConfig.middleware);
    }
  };

  // アプリケーションオブジェクトを構築
  const app: YukemuriApp = {
    hono,
    config,
    use,
    route,
    middleware,
    start,
    fetch,
  };

  return app;
}