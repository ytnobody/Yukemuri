export function generateServiceWorker() {
  return `// Yukemuri PWA Service Worker ♨️
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
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('♨️ Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('♨️ Service Worker: Taking control of all pages')
      return self.clients.claim()
    })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request)
        })
        .catch(() => {
          // Fallback for offline scenarios
          if (event.request.destination === 'document') {
            return caches.match('/')
          }
        })
    )
  }
})

console.log('♨️ Yukemuri Service Worker loaded')
`
}