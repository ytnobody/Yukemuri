import { Hono } from 'hono'
import { render } from 'preact-render-to-string'
import App from './routes/index'
import type { Context } from 'hono'

const app = new Hono()

// 静的ファイルの提供
app.get('/manifest.json', (c: Context) => {
  return c.json({
    name: "Yukemuri Application",
    short_name: "Yukemuri",
    description: "A PWA built with Yukemuri framework",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-72x72.svg",
        sizes: "72x72",
        type: "image/svg+xml",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-96x96.svg",
        sizes: "96x96",
        type: "image/svg+xml",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-128x128.svg",
        sizes: "128x128",
        type: "image/svg+xml",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-144x144.svg",
        sizes: "144x144",
        type: "image/svg+xml",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-152x152.svg",
        sizes: "152x152",
        type: "image/svg+xml",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-384x384.svg",
        sizes: "384x384",
        type: "image/svg+xml",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable any"
      }
    ],
    categories: ["productivity", "utilities"],
    lang: "ja",
    dir: "ltr"
  })
})

// Service Worker
app.get('/sw.js', (c: Context) => {
  c.header('Content-Type', 'application/javascript')
  c.header('Service-Worker-Allowed', '/')
  return c.text(`
// Yukemuri PWA Service Worker ♨️
const CACHE_NAME = 'yukemuri-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon.svg'
]

// インストール時
self.addEventListener('install', (event) => {
  console.log('♨️ Service Worker: Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// アクティベート時
self.addEventListener('activate', (event) => {
  console.log('♨️ Service Worker: Activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// フェッチ時
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/')
        }
      })
  )
})

console.log('♨️ Yukemuri Service Worker loaded')
  `)
})

// 静的ファイルの配信（Viteが処理しない場合のフォールバック）
app.get('/icons/*', (c: Context) => {
  const iconPath = c.req.path
  c.header('Content-Type', 'image/svg+xml')
  c.header('Cache-Control', 'public, max-age=31536000') // 1年キャッシュ
  
  console.log('📁 Serving icon:', iconPath)
  
  // シンプルな温泉アイコンデザイン
  return c.text(`<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#3b82f6"/>
  <g transform="translate(256, 256)">
    <!-- 湯気 -->
    <path d="M-80 -60 Q-80 -80 -60 -80 Q-40 -80 -40 -60 Q-40 -40 -60 -40 Q-80 -40 -80 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M-20 -60 Q-20 -80 0 -80 Q20 -80 20 -60 Q20 -40 0 -40 Q-20 -40 -20 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M40 -60 Q40 -80 60 -80 Q80 -80 80 -60 Q80 -40 60 -40 Q40 -40 40 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <!-- 温泉プール -->
    <ellipse cx="0" cy="20" rx="120" ry="80" fill="white"/>
    <ellipse cx="0" cy="10" rx="100" ry="60" fill="#3b82f6"/>
  </g>
</svg>`)
})

// Main page with SSR
app.get('/', (c: Context) => {
  const html = render(App())
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Yukemuri App ♨️</title>
      
      <!-- PWA Meta Tags -->
      <meta name="description" content="A PWA built with Yukemuri framework" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Yukemuri" />
      
      <!-- Web App Manifest -->
      <link rel="manifest" href="/manifest.json" />
      
      <!-- Icons -->
      <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
      <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
    </head>
    <body class="bg-gray-50 min-h-screen">
      <div id="app">${html}</div>
      <script type="module" src="/app/client.ts"></script>
    </body>
    </html>
  `)
})

// API route
app.get('/api/users', (c: Context) => {
  return c.json({
    users: [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' }
    ]
  })
})

app.get('/api/health', (c: Context) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

console.log('♨️ Yukemuri app initialized')

export default app
