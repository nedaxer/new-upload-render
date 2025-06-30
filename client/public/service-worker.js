// Service worker for Nedaxer PWA

const CACHE_NAME = 'nedaxer-cache-v3';

// Add cache bust parameter to URLs to prevent caching issues
function addCacheBuster(url) {
  const cacheBuster = `cache-bust=${Date.now()}`;
  const hasParams = url.includes('?');
  return `${url}${hasParams ? '&' : '?'}${cacheBuster}`;
}

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json',
  // Splash screen assets for offline availability
  '/splash-assets/background.png', // Background
  '/splash-assets/letter-n.png', // N letter
  '/splash-assets/letter-e1.png', // E letter 1
  '/splash-assets/letter-d.png', // D letter
  '/splash-assets/letter-a.png', // A letter
  '/splash-assets/letter-x.png', // X letter
  '/splash-assets/letter-e2.png', // E letter 2
  '/splash-assets/letter-r.png', // R letter
  '/splash-assets/nedaxer-logo.png', // Nedaxer logo
  '/splash-assets/nedaxer-icon.png', // Nedaxer icon for landing page
  // Pull-to-refresh assets for offline mobile app functionality
  '/splash-assets/refresh-logo.png', // Pull refresh logo
  '/splash-assets/pull-letter-n.png', // Pull N letter
  '/splash-assets/pull-letter-e1.png', // Pull E letter 1
  '/splash-assets/pull-letter-d.png', // Pull D letter
  '/splash-assets/pull-letter-a.png', // Pull A letter
  '/splash-assets/pull-letter-x.png', // Pull X letter
  '/splash-assets/pull-letter-e2.png', // Pull E letter 2
  '/splash-assets/pull-letter-r.png', // Pull R letter
];

// Install event - precache key assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Pre-caching assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('[ServiceWorker] Removing old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );

  // Take control of all clients immediately
  return self.clients.claim();
});

// Fetch event - comprehensive offline support for mobile app
self.addEventListener('fetch', event => {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || 
      event.request.method !== 'GET') {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // For API requests, network first with offline fallback
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses for offline access
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('[ServiceWorker] API fetch failed, checking cache');
          // Return cached version when offline
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                console.log('[ServiceWorker] Serving cached API response');
                return cachedResponse;
              }
              // Return offline fallback for critical API endpoints
              if (url.pathname.includes('/user') || url.pathname.includes('/balances')) {
                return new Response(JSON.stringify({
                  success: false,
                  message: 'Offline - using cached data',
                  offline: true
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              throw new Error('No cached response available');
            });
        })
    );
    return;
  }

  // Images and static assets - cache first for optimal offline performance
  if (event.request.destination === 'image' || 
      url.pathname.includes('/assets/') || 
      url.pathname.includes('/splash-assets/') ||
      url.pathname.includes('/icons/') ||
      url.pathname.includes('/src/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('[ServiceWorker] Serving cached asset:', url.pathname);
            return response;
          }
          
          console.log('[ServiceWorker] Fetching asset:', url.pathname);
          return fetch(event.request)
            .then(fetchResponse => {
              if (fetchResponse && fetchResponse.status === 200) {
                const responseToCache = fetchResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return fetchResponse;
            })
            .catch(() => {
              console.log('[ServiceWorker] Asset failed to load:', url.pathname);
              // Return transparent placeholder for missing images when offline
              if (event.request.destination === 'image') {
                return new Response('', { 
                  status: 200,
                  headers: { 'Content-Type': 'image/png' }
                });
              }
              throw new Error('Asset not available offline');
            });
        })
    );
    return;
  }

  // For page navigations, use a network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(error => {
        console.log('[ServiceWorker] Navigation fetch failed, serving from cache');
        return caches.match(event.request) || caches.match('/');
      })
    );
    return;
  }
  
  // CSS and JS files - stale while revalidate strategy
  if (event.request.destination === 'style' || 
      event.request.destination === 'script' ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          const fetchPromise = fetch(event.request)
            .then(fetchResponse => {
              if (fetchResponse && fetchResponse.status === 200) {
                const responseToCache = fetchResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return fetchResponse;
            })
            .catch(() => {
              console.log('[ServiceWorker] Script/Style fetch failed');
            });

          // Return cached version immediately, update in background
          if (response) {
            fetchPromise.catch(() => {}); // Suppress errors for background updates
            return response;
          }
          
          return fetchPromise;
        })
    );
    return;
  }
  
  // For all other requests, use a cache-first strategy
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log('[ServiceWorker] Serving from cache:', event.request.url);
        return response;
      }
      
      console.log('[ServiceWorker] Fetching from network:', event.request.url);
      return fetch(event.request).then(networkResponse => {
        // Don't cache responses that aren't successful
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Cache the new response
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      });
    })
  );
});

// Handle messages sent to the service worker
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[ServiceWorker] Clearing cache by request');
    caches.delete(CACHE_NAME).then(() => {
      console.log('[ServiceWorker] Cache cleared successfully');
    });
  }
});