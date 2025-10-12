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
      }),
      {
        name: 'configure-server',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/sw.js') {
              res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
              res.setHeader('Service-Worker-Allowed', '/')
            }
            next()
          })
        }
      },
      {
        name: 'dynamic-cors-hmr',
        configureServer(server) {
          // Log available network interfaces for easier external access
          const networkIfaces = require('os').networkInterfaces()
          const addresses = []
          
          for (const name of Object.keys(networkIfaces)) {
            for (const net of networkIfaces[name]) {
              if (net.family === 'IPv4' && !net.internal) {
                addresses.push(`http://${net.address}:${server.config.server.port || 5173}`)
              }
            }
          }
          
          if (addresses.length > 0) {
            console.log('\n🌐 External access available at:')
            addresses.forEach(addr => console.log(`  ${addr}`))
            console.log('\n💡 For ngrok: ngrok http 5173')
            console.log('💡 Set HMR_HOST environment variable if HMR doesn\'t work with external domains')
          }
          
          // Dynamic CORS headers for any origin
          server.middlewares.use((req, res, next) => {
            const origin = req.headers.origin
            if (origin) {
              res.setHeader('Access-Control-Allow-Origin', origin)
              res.setHeader('Access-Control-Allow-Credentials', 'true')
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            }
            next()
          })
        }
      }
    ],
    publicDir: 'public', // Explicitly specify static file directory
    server: {
      // Enable access from any host (LAN, ngrok, etc.)
      host: '0.0.0.0',
      // Enable CORS for all origins
      cors: true,
      // HMR configuration for external access
      hmr: {
        // If HOST environment variable is set, use it for HMR
        host: process.env.HMR_HOST || 'localhost',
        // Support custom port for HMR
        port: process.env.HMR_PORT ? parseInt(process.env.HMR_PORT) : undefined,
        // Enable HMR over HTTPS when needed
        protocol: process.env.HMR_PROTOCOL || 'ws'
      },
      fs: {
        // Allow file access outside project root
        allow: ['..']
      }
    },
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