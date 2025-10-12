import { Hono } from 'hono'
import type { Context } from 'hono'
import { readFileSync } from 'fs'
import { join } from 'path'
import { renderPage } from './document'
import { generateServiceWorker } from './utils/service-worker'
import App from './routes/index'
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
  return new Response(generateServiceWorker(), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache'
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
