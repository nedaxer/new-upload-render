import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

// Add a timestamp to query strings for cache-busting
function addCacheBustParam(url: string): string {
  const timestamp = new Date().getTime();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_=${timestamp}`;
}

// Intercept fetch requests to add cache-busting
const originalFetch = window.fetch;
window.fetch = function(input, init) {
  if (typeof input === 'string') {
    // Add cache-busting parameter to GET requests
    if (!init || init.method === undefined || init.method === 'GET') {
      return originalFetch(addCacheBustParam(input), init);
    }
  }
  return originalFetch(input, init);
};

// Service Worker Registration for reliable updates
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Register the service worker
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('ServiceWorker registration successful with scope:', registration.scope);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('New service worker installing...');
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New content is available; refreshing...');
                window.location.reload();
              }
            });
          }
        });
        
        // Set up communication with the service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          // Handle messages from the service worker
          if (event.data && event.data.type === 'RELOAD_PAGE') {
            console.log('Received refresh request from service worker');
            window.location.reload();
          }
        });
        
        // Check for updates more frequently in development
        const updateInterval = process.env.NODE_ENV === 'development' ? 15000 : 60000;
        setInterval(() => {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage('CHECK_UPDATES');
          }
        }, updateInterval);
        
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    });
    
    // Handle page visibility changes to check for updates when tab becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.serviceWorker.controller) {
        console.log('Page became visible, checking for updates...');
        navigator.serviceWorker.controller.postMessage('CHECK_UPDATES');
      }
    });
  } else {
    console.log('Service workers are not supported by this browser');
  }
}

// Initialize the service worker
registerServiceWorker();

// Configure queryClient for better caching behavior
queryClient.setDefaultOptions({
  queries: {
    refetchOnWindowFocus: true,
    staleTime: process.env.NODE_ENV === 'development' ? 0 : 5 * 60 * 1000, // 0 in dev, 5min in prod
    retry: process.env.NODE_ENV === 'development' ? 0 : 1,
    retryDelay: 1000,
  },
});

// Handle initial URL hash navigation
const ensureHashPrefixOnLoad = () => {
  if (window.location.hash === '' && window.location.pathname !== '/') {
    const pathToConvert = window.location.pathname;
    window.history.replaceState(null, '', `/#${pathToConvert}`);
  }
};

// Make sure hash routing works properly on initial page load
ensureHashPrefixOnLoad();

// Ensure our WebSocket connections are properly closed when page unloads
window.addEventListener('beforeunload', () => {
  // Close any WebSocket connections cleanly
  const allWebSockets = Array.from(document.querySelectorAll('*'))
    .filter(el => el.constructor.name === 'WebSocket');
  
  allWebSockets.forEach(ws => {
    try {
      (ws as any).close();
    } catch (e) {
      console.error('Error closing WebSocket:', e);
    }
  });
});

// Render the application with QueryClientProvider
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
