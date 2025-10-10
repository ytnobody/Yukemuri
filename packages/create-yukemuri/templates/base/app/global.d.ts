/// <reference types="preact" />

// Hono modules (type definitions are provided in actual projects)
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

// Vite plugins (type definitions are provided in actual projects)
declare module '@preact/preset-vite' {
  const plugin: any
  export default plugin
}

declare module '@hono/vite-dev-server' {
  const plugin: any
  export default plugin
}

// UnoCSS modules (type definitions are provided in actual projects)
declare module 'unocss' {
  export function defineConfig(config: any): any
  export function presetUno(): any
  export function presetTypography(): any
}

declare module 'unocss/vite' {
  const plugin: any
  export default plugin
}

declare module '@unocss/preset-uno' {
  export default function presetUno(): any
}

declare module '@unocss/preset-typography' {
  export default function presetTypography(): any
}

declare module 'uno.css' {}

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