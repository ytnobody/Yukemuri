/// <reference types="preact" />

// Hono modules (実際のプロジェクトでは型定義が提供される)
declare module 'hono' {
  export class Hono {
    constructor()
    get(path: string, handler: any): void
    post(path: string, handler: any): void
    put(path: string, handler: any): void
    delete(path: string, handler: any): void
    use(path: string, handler: any): void
  }
  export interface Context {
    req: any
    res: any
    json(obj: any): any
    html(html: string): any
    text(text: string): any
    header(name: string, value: string): void
  }
}

// Vite plugins (実際のプロジェクトでは型定義が提供される)
declare module '@preact/preset-vite' {
  const plugin: any
  export default plugin
}

declare module '@hono/vite-dev-server' {
  const plugin: any
  export default plugin
}

declare module 'preact-render-to-string' {
  export function render(vnode: any): string
}

// JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}