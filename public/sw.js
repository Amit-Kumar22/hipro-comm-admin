// Service Worker for HiproCom Admin Panel
// This will cache API responses and static assets for better performance

const CACHE_NAME = 'hipro-admin-v1.0';
const API_CACHE_NAME = 'hipro-admin-api-v1.0';

// Cache these static assets
const STATIC_CACHE_URLS = [
  '/',
  '/products',
  '/categories', 
  '/orders',
  '/users',
  '/stock',
  '/_next/static/css/',
  '/_next/static/js/',
  '/favicon.ico'
];

// Cache API responses for these endpoints (admin endpoints)
const API_CACHE_PATTERNS = [
  /\/api\/admin\/products/,
  /\/api\/admin\/categories/,
  /\/api\/admin\/orders/,
  /\/api\/admin\/users/,
  /\/api\/admin\/inventory/,
  /\/api\/admin\/dashboard/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🔧 Admin: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('🗑️ Admin: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle admin API requests with network-first strategy
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests only
          if (request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              // Cache with shorter TTL for admin data (5 minutes)
              cache.put(request, responseClone);
              console.log('🔧 Admin: Cached API response:', url.pathname);
            });
          }
          return response;
        })
        .catch(() => {
          // Serve from cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('🔧 Admin: Serving from cache (offline):', url.pathname);
              return cachedResponse;
            }
            // Return a custom offline page for admin
            return new Response('Admin Panel Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'document' || 
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image') {
    
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('⚡ Admin: Serving from cache:', url.pathname);
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});

// Handle admin-specific background tasks
self.addEventListener('sync', (event) => {
  if (event.tag === 'admin-data-sync') {
    event.waitUntil(syncAdminData());
  }
});

// Sync admin data when back online
async function syncAdminData() {
  try {
    console.log('🔧 Admin: Syncing data with server...');
    
    // Clear old cache to get fresh admin data
    const cache = await caches.open(API_CACHE_NAME);
    const keys = await cache.keys();
    
    // Delete cached admin API responses older than 5 minutes
    keys.forEach(async (request) => {
      const response = await cache.match(request);
      if (response) {
        const cacheDate = new Date(response.headers.get('date'));
        const now = new Date();
        const diffMinutes = (now - cacheDate) / (1000 * 60);
        
        if (diffMinutes > 5) {
          await cache.delete(request);
          console.log('🗑️ Admin: Cleared stale cache for:', request.url);
        }
      }
    });
    
    console.log('✅ Admin: Data sync completed');
  } catch (error) {
    console.error('❌ Admin: Background sync failed:', error);
  }
}