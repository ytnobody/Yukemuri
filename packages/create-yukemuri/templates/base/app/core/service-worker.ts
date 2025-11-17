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

// Push event for notifications
self.addEventListener('push', (event) => {
  console.log('♨️ Service Worker: Push event received')
  
  let options = {
    body: 'Hello from Yukemuri ♨️',
    icon: '/icons/icon-192x192.png',
    tag: 'yukemuri-push',
    badge: '/icons/icon-192x192.png',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Close' }
    ]
  }

  if (event.data) {
    try {
      const data = event.data.json()
      options = { ...options, ...data }
    } catch (e) {
      options.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification('Yukemuri ♨️', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('♨️ Service Worker: Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('♨️ Service Worker: Notification closed')
})

console.log('♨️ Yukemuri Service Worker loaded')
`
}
