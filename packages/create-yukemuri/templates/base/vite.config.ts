import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import devServer from '@hono/vite-dev-server'

export default defineConfig(({ mode }: { mode: string }) => {
  if (mode === 'client') {
    return {
      plugins: [preact()],
      build: {
        lib: {
          entry: './app/client.ts',
          formats: ['es'],
          fileName: 'client'
        },
        rollupOptions: {
          output: {
            entryFileNames: 'static/client.js'
          }
        }
      }
    }
  }

  return {
    plugins: [
      preact(),
      devServer({
        entry: 'app/server.ts'
      })
    ],
    build: {
      lib: {
        entry: './app/server.ts',
        formats: ['es'],
        fileName: 'server'
      },
      rollupOptions: {
        external: ['hono', 'preact', 'preact/render-to-string']
      }
    }
  }
})