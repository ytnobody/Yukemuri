/**
 * Hono type declarations for auth plugin
 */

declare module "hono" {
  export interface Context {
    json<T = any>(data: T, status?: number): Response
    req: {
      path: string
      header(name: string): string | undefined
    }
    get(key: string): any
    set(key: string, value: any): void
  }

  export function Hono(): any
  export type Hono = any
}
