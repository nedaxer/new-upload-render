// Cache name with version - update this version number to force cache refresh
const CACHE_NAME = 'nedaxer-app-v2';
const TIMESTAMP = new Date().toISOString(); // Add timestamp for cache-busting

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Function to add query string for cache busting
function addCacheBuster(url) {
  // Don't add cache busting to URLs with query parameters or non-GET requests
  const isCachableURL = url.includes('/api/') === false; // Don't cache API requests
  const hasNoQuery = url.indexOf('?') === -1;
  if (isCachableURL && hasNoQuery && (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.html'))) {
    return `${url}?v=${CACHE_NAME}`;
  }
  return url;
}

// Install event - cache assets and force update
self.addEventListener('install', event => {
  // Skip waiting - force the service worker to become active 
  // even if another service worker already controls the page
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  // Claim clients - take control of all pages immediately
  event.waitUntil(clients.claim());
  
  // Delete old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Check for updates function to be called from client
self.addEventListener('message', event => {
  if (event.data === 'CHECK_UPDATES') {
    console.log('[ServiceWorker] Checking for updates...');
    // Force clients to reload if they need a refresh
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'RELOAD_PAGE',
          timestamp: TIMESTAMP
        });
      });
    });
  }
});

// Network first then cache strategy for HTML/JS/CSS files
// Cache first for images and static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // For HTML, JS, and CSS files, use network first strategy
  if (event.request.method === 'GET' && 
      (url.pathname.endsWith('.html') || 
       url.pathname.endsWith('.js') || 
       url.pathname.endsWith('.css') ||
       url.pathname === '/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to store in cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request);
        })
    );
  } 
  // For other files, try cache first then network
  else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          
          // Clone the request - fetch() uses up the request once consumed
          const fetchRequest = event.request.clone();
          
          return fetch(fetchRequest)
            .then(response => {
              // Don't cache non-successful responses or non-GET methods
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response to store in cache
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
              
              return response;
            });
        })
    );
  }
});