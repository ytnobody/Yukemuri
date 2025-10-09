// Yukemari PWA Service Worker ♨️
const CACHE_NAME = 'yukemari-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// インストール時: 静的リソースをキャッシュ
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static resources')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete')
        return self.skipWaiting()
      })
  )
})

// アクティベート時: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete')
        return self.clients.claim()
      })
  )
})

// フェッチ時: キャッシュ戦略を適用
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // 同一オリジンのリクエストのみ処理
  if (url.origin !== location.origin) return
  
  // APIリクエストの場合: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }
  
  // 静的リソースの場合: Cache First
  if (isStaticResource(url.pathname)) {
    event.respondWith(cacheFirst(request))
    return
  }
  
  // その他の場合: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request))
})

// Network First 戦略（API用）
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    // 成功した場合はキャッシュに保存
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🌐 Network failed, trying cache:', request.url)
    
    // ネットワークが失敗した場合はキャッシュから取得
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // キャッシュにもない場合はオフラインページを返す
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'No network connection' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Cache First 戦略（静的リソース用）
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  // キャッシュにない場合はネットワークから取得
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('❌ Failed to fetch resource:', request.url)
    throw error
  }
}

// Stale While Revalidate 戦略（一般的なページ用）
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  // バックグラウンドで更新
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // ネットワークエラーは無視
  })
  
  // キャッシュがあればすぐに返す、なければネットワークを待つ
  return cachedResponse || fetchPromise
}

// 静的リソースかどうかを判定
function isStaticResource(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2']
  return staticExtensions.some(ext => pathname.endsWith(ext)) || pathname === '/manifest.json'
}

// Push通知の処理
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Yukemari',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'yukemari-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Yukemari ♨️', options)
  )
})

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'view') {
    // アプリを開く
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

console.log('♨️ Yukemari Service Worker loaded')