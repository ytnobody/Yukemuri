import type { 
  YukemuriPlugin, 
  ConfigSchema,
  ConfigProperty,
  InitHook,
  SetupHook,
  TeardownHook,
  RouteConfig, 
  MiddlewareConfig,
  AssetConfig,
  CommandConfig,
  ClientExtensions
} from '../types.js';

/**
 * プラグインを作成する
 */
export function createPlugin(options: {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  dependencies?: string[];
  peerDependencies?: string[];
  engines?: {
    yukemuri?: string;
    node?: string;
  };
  configSchema?: ConfigSchema;
  defaultConfig?: any;
  init?: InitHook;
  setup?: SetupHook;
  teardown?: TeardownHook;
  routes?: RouteConfig[];
  middleware?: MiddlewareConfig[];
  assets?: AssetConfig[];
  commands?: CommandConfig[];
  clientExtensions?: ClientExtensions;
}): YukemuriPlugin {
  return {
    name: options.name,
    version: options.version,
    description: options.description,
    author: options.author,
    license: options.license,
    homepage: options.homepage,
    repository: options.repository,
    dependencies: options.dependencies || [],
    peerDependencies: options.peerDependencies || [],
    engines: options.engines,
    configSchema: options.configSchema,
    defaultConfig: options.defaultConfig,
    init: options.init,
    setup: options.setup,
    teardown: options.teardown,
    routes: options.routes || [],
    middleware: options.middleware || [],
    assets: options.assets || [],
    commands: options.commands || [],
    clientExtensions: options.clientExtensions,
  };
}

/**
 * プラグインの設定スキーマを作成する
 */
export function createConfigSchema(properties: Record<string, any>, required?: string[]): ConfigSchema {
  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false
  };
}

/**
 * プラグインバンドルを作成する（複数のプラグインを組み合わせ）
 */
export function createPluginBundle(options: {
  name: string;
  version: string;
  description?: string;
  plugins: YukemuriPlugin[];
}): YukemuriPlugin {
  const allRoutes = options.plugins.flatMap(p => p.routes || []);
  const allMiddleware = options.plugins.flatMap(p => p.middleware || []);
  const allAssets = options.plugins.flatMap(p => p.assets || []);
  const allCommands = options.plugins.flatMap(p => p.commands || []);

  return createPlugin({
    name: options.name,
    version: options.version,
    description: options.description,
    init: async (context) => {
      // Initialize all bundled plugins
      for (const plugin of options.plugins) {
        if (plugin.init) {
          await plugin.init(context);
        }
      }
    },
    routes: allRoutes,
    middleware: allMiddleware,
    assets: allAssets,
    commands: allCommands
  });
}

/**
 * プラグインの設定を検証する
 */
export function validatePluginConfig(
  config: any,
  schema: Record<string, ConfigProperty>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, property] of Object.entries(schema)) {
    const value = config[key];

    // 必須チェック
    if (property.required && (value === undefined || value === null)) {
      errors.push(`Required property "${key}" is missing`);
      continue;
    }

    // 型チェック
    if (value !== undefined && !checkType(value, property.type)) {
      errors.push(`Property "${key}" must be of type ${property.type}`);
    }

    // カスタムバリデーション
    if (value !== undefined && property.validation) {
      const result = property.validation(value);
      if (typeof result === 'string') {
        errors.push(`Property "${key}": ${result}`);
      } else if (!result) {
        errors.push(`Property "${key}" failed validation`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 型チェック用のヘルパー関数
 */
function checkType(value: any, expectedType: string): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    default:
      return true;
  }
}

/**
 * プラグインのルートをマージする
 */
export function mergeRoutes(...routeArrays: RouteConfig[][]): RouteConfig[] {
  return routeArrays.flat();
}

/**
 * プラグインのミドルウェアをマージする
 */
export function mergeMiddleware(...middlewareArrays: MiddlewareConfig[][]): MiddlewareConfig[] {
  return middlewareArrays.flat();
}