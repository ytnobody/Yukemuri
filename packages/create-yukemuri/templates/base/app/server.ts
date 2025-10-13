import { Hono } from 'hono'
import type { Context } from 'hono'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { renderPage } from './document'
import { generateServiceWorker } from './utils/service-worker'
import api from './api'
import 'virtual:uno.css'

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = new Hono()

// ============================================
// PWA Essential Routes
// ============================================

// Web App Manifest
app.get('/manifest.json', (c: Context) => {
  return c.json({
    name: "Yukemuri Application",
    short_name: "Yukemuri",
    description: "Internet edge PWA framework ♨️",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    scope: "/",
    prefer_related_applications: false,
    icons: [
      {
        src: "/static/icons/icon-72x72.svg",
        sizes: "72x72",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/static/icons/icon-96x96.svg",
        sizes: "96x96",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/static/icons/icon-128x128.svg",
        sizes: "128x128",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/static/icons/icon-144x144.svg",
        sizes: "144x144",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/static/icons/icon-152x152.svg",
        sizes: "152x152",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/static/icons/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: "/static/icons/icon-384x384.svg",
        sizes: "384x384",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/static/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ],
    categories: ["productivity", "utilities"],
    lang: "ja",
    dir: "ltr",
    display_override: ["window-controls-overlay", "standalone"],
    edge_side_panel: {},
    handle_links: "preferred"
  })
})

// Service Worker
app.get('/sw.js', (c: Context) => {
  return new Response(generateServiceWorker(), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache'
    }
  })
})

// ============================================
// Static File Serving
// ============================================

// Static files from app/static
app.get('/static/*', (c: Context) => {
  const filePath = c.req.path.replace('/static', '')
  const fullPath = join(__dirname, 'static', filePath)
  
  try {
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath, 'utf-8')
      
      // Determine content type based on file extension
      let contentType = 'text/plain'
      if (filePath.endsWith('.svg')) {
        contentType = 'image/svg+xml; charset=utf-8'
      } else if (filePath.endsWith('.png')) {
        contentType = 'image/png'
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        contentType = 'image/jpeg'
      } else if (filePath.endsWith('.css')) {
        contentType = 'text/css; charset=utf-8'
      } else if (filePath.endsWith('.js')) {
        contentType = 'application/javascript; charset=utf-8'
      }
      
      return new Response(content, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000'
        }
      })
    }
  } catch (error) {
    console.error('Error serving static file:', error)
  }
  
  return new Response('Not Found', { status: 404 })
})

// Legacy icon route redirect (backward compatibility)
app.get('/icons/*', (c: Context) => {
  const iconPath = c.req.path.replace('/icons', '/static/icons')
  return new Response(null, {
    status: 301,
    headers: {
      'Location': iconPath
    }
  })
})

// ============================================
// API Routes
// ============================================

// Mount API routes using Hono's route method for grouping
app.route('/api', api)

// ============================================
// Application Routes
// ============================================

// Main page with SSR
app.get('/', (c: Context) => {
  return c.html(renderPage())
})

console.log('♨️ Yukemuri app initialized')

export default app