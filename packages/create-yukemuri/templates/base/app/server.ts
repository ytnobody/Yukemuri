import { Hono } from 'hono'
import type { Context } from 'hono'
import { readFileSync } from 'fs'
import { join } from 'path'
import { existsSync } from 'fs'
import { renderPage } from './document'
import { generateServiceWorker } from './utils/service-worker'
import App from './routes/index'
import api from './api'
import 'virtual:uno.css'

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

// Static file serving from app/static
app.get('/static/*', (c: Context) => {
  const filePath = c.req.path.replace('/static', '')
  const fullPath = join(__dirname, 'static', filePath)
  
  console.log('📁 Serving static file:', filePath)
  
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

// Legacy icon route (fallback - redirect to static)
app.get('/icons/*', (c: Context) => {
  const iconPath = c.req.path.replace('/icons', '/static/icons')
  console.log('📁 Redirecting icon request to:', iconPath)
  
  return new Response(null, {
    status: 301,
    headers: {
      'Location': iconPath
    }
  })
})

// Main page with SSR
app.get('/', (c: Context) => {
  return c.html(renderPage())
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
