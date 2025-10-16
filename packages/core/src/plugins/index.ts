import type { 
  YukemuriPlugin, 
  YukemuriApp, 
  RouteConfig, 
  MiddlewareConfig,
  ConfigProperty 
} from '../types.js';

/**
 * プラグインを作成する
 */
export function createPlugin(options: {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  configSchema?: Record<string, ConfigProperty>;
  init: (app: YukemuriApp, config?: any) => Promise<void> | void;
  routes?: RouteConfig[];
  middleware?: MiddlewareConfig[];
}): YukemuriPlugin {
  return {
    name: options.name,
    version: options.version,
    description: options.description,
    dependencies: options.dependencies || [],
    configSchema: options.configSchema,
    init: options.init,
    routes: options.routes || [],
    middleware: options.middleware || [],
  };
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