// Enhanced service worker for Nedaxer trading platform
// Optimized for single-page applications with hash-based routing

// Cache version - change this when you update the service worker
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `nedaxer-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `nedaxer-dynamic-${CACHE_VERSION}`;

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Add cache-busting parameter to prevent stale content
function addCacheBuster(url) {
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_cb=${timestamp}`;
}

// Helper function for SPA navigation
function isSPARoute(url) {
  // Skip specific file extensions that are clearly not SPA routes
  return !url.match(/\.(js|css|png|jpg|jpeg|gif|svg|json|woff|woff2|ttf|eot)$/i) &&
         !url.match(/\/api\//i) &&
         !url.match(/\/ws\//i);
}

// Install event - precache key assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing version', CACHE_VERSION);
  
  // Skip waiting to activate this service worker immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[ServiceWorker] Pre-caching assets');
        // Add no-cache to ensure we get fresh copies
        const cachePromises = PRECACHE_ASSETS.map(url => {
          return fetch(new Request(url, { cache: 'no-cache' }))
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch ${url}`);
              }
              return cache.put(url, response);
            })
            .catch(error => {
              console.error('[ServiceWorker] Error caching', url, error);
            });
        });
        
        return Promise.all(cachePromises);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating version', CACHE_VERSION);
  
  // Delete old cache versions
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith('nedaxer-') && 
                    !cacheName.endsWith(CACHE_VERSION);
            })
            .map(cacheName => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network with appropriate strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (!url.origin.match(self.location.origin)) {
    return;
  }
  
  // API endpoints - network only with cache buster
  if (url.pathname.startsWith('/api/')) {
    // Use a cache buster for API requests to prevent stale data
    const bustUrl = addCacheBuster(event.request.url);
    const bustRequest = new Request(bustUrl, {
      method: event.request.method,
      headers: event.request.headers,
      mode: event.request.mode,
      credentials: event.request.credentials,
      redirect: event.request.redirect
    });
    
    // We don't cache API responses, just pass through
    return;
  }
  
  // WebSocket connections - pass through
  if (url.pathname.startsWith('/ws')) {
    return;
  }
  
  // SPA navigation - always serve index.html for client-side routing
  if (event.request.mode === 'navigate' || isSPARoute(url.pathname)) {
    event.respondWith(
      // Try the network first
      fetch(event.request)
        .catch(() => {
          // If network fails, serve from cache
          return caches.match('/index.html');
        })
    );
    return;
  }
  
  // Static assets (JS, CSS, images) - cache first, network fallback
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return the cached version
          return cachedResponse;
        }
        
        // Not in cache, get from network
        return fetch(event.request)
          .then(networkResponse => {
            // Don't cache problematic responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // Clone the response before using it
            const responseToCache = networkResponse.clone();
            
            // Cache the successful response for next time
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('[ServiceWorker] Error caching response:', error);
              });
            
            return networkResponse;
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data === 'CHECK_UPDATES') {
    console.log('[ServiceWorker] Checking for updates');
    
    // Update index.html to ensure latest version
    fetch('/index.html', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch index.html');
        }
        
        return caches.open(STATIC_CACHE)
          .then(cache => {
            return cache.put('/index.html', response);
          });
      })
      .then(() => {
        console.log('[ServiceWorker] Updated index.html in cache');
        
        // Notify clients that there might be updates
        self.clients.matchAll()
          .then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'CONTENT_UPDATED',
                timestamp: new Date().toISOString()
              });
            });
          });
      })
      .catch(error => {
        console.error('[ServiceWorker] Error checking for updates:', error);
      });
  }
  
  if (event.data === 'CLEAR_CACHE') {
    console.log('[ServiceWorker] Clearing all caches');
    
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('nedaxer-'))
            .map(name => caches.delete(name))
        );
      })
      .then(() => {
        console.log('[ServiceWorker] All caches cleared');
        
        // Notify the client that requested the cache clear
        if (event.source) {
          event.source.postMessage({
            type: 'CACHE_CLEARED',
            timestamp: new Date().toISOString()
          });
        }
      });
  }
});