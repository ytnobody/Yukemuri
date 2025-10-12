import { Hono } from 'hono'
import { render } from 'preact-render-to-string'
import App from './routes/index'
import type { Context } from 'hono'
import { readFileSync } from 'fs'
import { join } from 'path'

const app = new Hono()

// Static file serving
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
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
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
  const swContent = `// Yukemuri PWA Service Worker ♨️
const CACHE_NAME = 'yukemuri-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png'
]

// Install event
self.addEventListener('install', (event) => {
  console.log('♨️ Service Worker: Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Try bulk add first; if it fails (404/invalid), fall back to per-resource fetch+put
        return cache.addAll(STATIC_CACHE_URLS).catch((err) => {
          console.warn('♨️ Service Worker: cache.addAll failed, falling back to individual caching', err)
          return Promise.all(STATIC_CACHE_URLS.map((url) =>
            fetch(url)
              .then((resp) => {
                if (!resp.ok) throw new Error('fetch failed: ' + url + ' status:' + resp.status)
                return cache.put(url, resp.clone())
              })
              .catch((e) => {
                console.warn('♨️ Service Worker: failed to cache', url, e)
                return null
              })
          ))
        })
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event
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

// Fetch event
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
`

  return new Response(swContent, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/'
    }
  })
})

// Static file distribution (fallback when Vite doesn't handle)
app.get('/icons/*', (c: Context) => {
  const iconPath = c.req.path
  console.log('📁 Serving icon:', iconPath)

  if (iconPath.endsWith('.svg')) {
    const svg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#3b82f6"/>
  <g transform="translate(256, 256)">
    <!-- Steam -->
    <path d="M-80 -60 Q-80 -80 -60 -80 Q-40 -80 -40 -60 Q-40 -40 -60 -40 Q-80 -40 -80 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M-20 -60 Q-20 -80 0 -80 Q20 -80 20 -60 Q20 -40 0 -40 Q-20 -40 -20 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M40 -60 Q40 -80 60 -80 Q80 -80 80 -60 Q80 -40 60 -40 Q40 -40 40 -60" 
          stroke="white" stroke-width="12" fill="none" stroke-linecap="round"/>
    <!-- Hot spring pool -->
    <ellipse cx="0" cy="20" rx="120" ry="80" fill="white"/>
    <ellipse cx="0" cy="10" rx="100" ry="60" fill="#3b82f6"/>
  </g>
</svg>`

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  }

  if (iconPath.endsWith('.png')) {
    try {
      const rel = iconPath.startsWith('/') ? iconPath.slice(1) : iconPath
      const filePath = join(process.cwd(), 'public', rel)
      const data = readFileSync(filePath)
      return new Response(new Uint8Array(data), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000'
        }
      })
    } catch (e) {
  console.error('📛 Failed to read icon file', e)
  return new Response('Not Found', { status: 404 })
    }
  }

  return new Response('Not Found', { status: 404 })
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
      
      <!-- Minimal CSS for styling -->
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #f9fafb; min-height: 100vh; }
        .container { max-width: 64rem; margin: 0 auto; padding: 2rem 1rem; }
        h1 { font-size: 2.25rem; font-weight: 700; text-align: center; margin-bottom: 1rem; color: #1f2937; }
        h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #374151; }
        h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #374151; }
        h4 { font-size: 1.125rem; font-weight: 500; margin-bottom: 0.5rem; color: #374151; }
        p { margin-bottom: 1.5rem; color: #6b7280; }
        .text-center { text-align: center; }
        .text-8xl { font-size: 6rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .card { background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .btn { display: inline-block; padding: 0.5rem 1rem; margin: 0.25rem; border: none; border-radius: 0.375rem; font-weight: 500; cursor: pointer; transition: background-color 0.2s; text-decoration: none; }
        .btn-primary { background: #3b82f6; color: white; } .btn-primary:hover { background: #2563eb; }
        .btn-danger { background: #ef4444; color: white; } .btn-danger:hover { background: #dc2626; }
        .btn-secondary { background: #6b7280; color: white; } .btn-secondary:hover { background: #4b5563; }
        .flex { display: flex; }
        .gap-3 { gap: 0.75rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .bg-yellow-50 { background: #fefce8; }
        .border-yellow-200 { border-color: #fde047; }
        .text-yellow-900 { color: #713f12; }
        .text-yellow-800 { color: #92400e; }
        .bg-gray-50 { background: #f9fafb; }
        .p-3 { padding: 0.75rem; }
        .p-4 { padding: 1rem; }
        .rounded { border-radius: 0.25rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .text-xl { font-size: 1.25rem; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .underline { text-decoration: underline; }
        .text-primary-600 { color: #2563eb; }
        .hover\\:text-primary-800:hover { color: #1e40af; }
        strong { color: #2563eb; }
        a { color: #2563eb; text-decoration: none; }
        a:hover { color: #1e40af; text-decoration: underline; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .rounded-full { border-radius: 9999px; }
        .bg-orange-100 { background: #fed7aa; }
        .text-orange-800 { color: #9a3412; }
        .bg-blue-100 { background: #dbeafe; }
        .text-blue-800 { color: #1e40af; }
        .ml-2 { margin-left: 0.5rem; }
        .mr-3 { margin-right: 0.75rem; }
        .mt-1 { margin-top: 0.25rem; }
      </style>
      
      <!-- Icons -->
  <link rel="icon" type="image/png" href="/icons/icon-192x192.png" />
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
    </head>
    <body class="bg-gray-50 min-h-screen">
      <div id="app">${html}</div>
      ${process.env.NODE_ENV !== 'production' ? '<script type="module" src="/@vite/client"></script>' : ''}
      <script type="module" src="/app/client.ts"></script>
      <script src="/debug-pwa.js"></script>
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

// PWA debug routes
app.get('/debug-pwa.js', (c: Context) => {
  c.header('Content-Type', 'application/javascript; charset=utf-8')
  return c.text(`
// PWA debug script
console.log('=== PWA Debug Info ===');

// 1. Service Worker check
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('📋 Service Worker registrations:', registrations.length);
    registrations.forEach((reg, index) => {
      console.log(\`  \${index + 1}. \${reg.scope} - State: \${reg.active?.state || 'inactive'}\`);
    });
  });
} else {
  console.log('❌ Service Worker not supported');
}

// 2. Manifest check
fetch('/manifest.json')
  .then(response => response.json())
  .then(manifest => {
    console.log('📄 Manifest loaded:', manifest.name);
    console.log('   Start URL:', manifest.start_url);
    console.log('   Display:', manifest.display);
    console.log('   Icons:', manifest.icons.length);
  })
  .catch(error => console.log('❌ Manifest error:', error));

// 3. PWA install criteria
setTimeout(() => {
  console.log('🔍 PWA Install Criteria Check:');
  console.log('  - HTTPS:', location.protocol === 'https:' || location.hostname === 'localhost');
  console.log('  - Service Worker:', 'serviceWorker' in navigator);
  console.log('  - Manifest Link:', !!document.querySelector('link[rel="manifest"]'));
  console.log('  - Icons in Manifest: checking...');
  
  // Add beforeinstallprompt event listener
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('🎉 beforeinstallprompt event fired! PWA is installable!');
    console.log('   Event:', e);
    e.preventDefault();
    window.deferredPrompt = e;
  });
  
  console.log('✨ PWA debug setup complete. Watch for beforeinstallprompt event.');
}, 3000);
  `)
})
