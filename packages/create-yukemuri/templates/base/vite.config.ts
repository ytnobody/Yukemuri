import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import devServer from '@hono/vite-dev-server'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [UnoCSS()],
      build: {
        rollupOptions: {
          input: './app/client.ts',
          output: {
            entryFileNames: 'static/client.js',
            format: 'es'
          }
        }
      }
    }
  }

  return {
    plugins: [
      UnoCSS(),
      devServer({
        entry: 'app/server.ts',
        exclude: [
          /^\/@vite\//,           // Vite client files
          /^\/app\/client\.ts$/,  // Client entry point
          /^\/node_modules\//,    // Node modules
          /^\/src\//,             // Source files
          /^\/@fs\//,             // Vite file system access
          /^\/virtual:/,          // Virtual modules like uno.css
          /^\/@unocss\//,         // UnoCSS dev endpoints
          /^\/__uno\.css$/,       // UnoCSS virtual CSS file
          /^\/app\/routes\//,     // Route files (let Vite handle them)
          /\.tsx?$/,              // TypeScript files
          /\.jsx?$/               // JavaScript files
        ]
      }),
      {
        name: 'dynamic-host-handler',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // ngrokやトンネルサービスからのアクセスを許可
            const host = req.headers.host
            const origin = req.headers.origin
            
            if (host && (host.includes('.ngrok-free.app') || host.includes('.ngrok.io') || host.includes('localhost'))) {
              // Hostヘッダーを許可
              res.setHeader('Access-Control-Allow-Origin', origin || `https://${host}`)
              res.setHeader('Access-Control-Allow-Credentials', 'true')
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            }
            
            if (req.method === 'OPTIONS') {
              res.writeHead(200)
              res.end()
              return
            }
            
            next()
          })
        }
      }
    ],
    server: {
      host: '0.0.0.0',
      strictPort: false,
      cors: true,
      hmr: {
        port: 5174
      },
      fs: {
        allow: ['..', '.', './app', './src']
      },
      // 動的にngrokドメインを許可
      allowedHosts: true
    },
    publicDir: 'public',
    optimizeDeps: {
      include: ['preact', 'preact/hooks']
    }
  }
})