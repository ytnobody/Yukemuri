/**
 * ログ関連のユーティリティ
 */
export function createLogger(namespace: string) {
  const log = (level: "info" | "warn" | "error", message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString()
    console[level](`[${timestamp}] [${namespace}] ${message}`, ...args)
  }

  return {
    info: (message: string, ...args: any[]) => log("info", message, ...args),
    warn: (message: string, ...args: any[]) => log("warn", message, ...args),
    error: (message: string, ...args: any[]) => log("error", message, ...args),
  }
}

/**
 * 環境変数を取得する（デフォルト値付き）
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || defaultValue
  }
  return defaultValue
}

/**
 * 必須環境変数を取得する
 */
export function requireEnv(key: string): string {
  const value = getEnv(key)
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`)
  }
  return value
}

/**
 * パスを正規化する
 */
export function normalizePath(path: string): string {
  // 先頭のスラッシュを確保
  if (!path.startsWith("/")) {
    path = "/" + path
  }

  // 末尾のスラッシュを削除（ルートパス以外）
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1)
  }

  return path
}

/**
 * オブジェクトをディープマージする
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue)
    } else {
      result[key] = sourceValue as T[Extract<keyof T, string>]
    }
  }

  return result
}

/**
 * 非同期処理をリトライする
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, onRetry } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxAttempts) {
        throw lastError
      }

      if (onRetry) {
        onRetry(attempt, lastError)
      }

      if (delay > 0) {
        await sleep(delay)
      }
    }
  }

  throw lastError!
}

/**
 * 指定した時間待機する
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * ランダムな文字列を生成する
 */
export function generateId(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
