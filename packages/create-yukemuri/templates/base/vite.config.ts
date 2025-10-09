import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import devServer from '@hono/vite-dev-server'
import UnoCSS from 'unocss/vite'

export default defineConfig(({ mode }: { mode: string }) => {
  if (mode === 'client') {
    return {
      plugins: [preact(), UnoCSS()],
      build: {
        rollupOptions: {
          input: './app/client.ts',
          output: {
            entryFileNames: 'static/client.js',
            format: 'es' as const
          }
        }
      }
    }
  }

  return {
    plugins: [
      preact(),
      UnoCSS(),
      devServer({
        entry: 'app/server.ts'
      })
    ],
    build: {
      rollupOptions: {
        input: './app/server.ts',
        external: ['hono', 'preact', 'preact-render-to-string'],
        output: {
          format: 'es' as const
        }
      }
    }
  }
})