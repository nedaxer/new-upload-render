import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

// Clear service worker cache and force reload for development
function clearServiceWorkerCache() {
  if ('serviceWorker' in navigator) {
    // Clear all caches and unregister service workers in development
    window.addEventListener('load', async () => {
      try {
        // Unregister all service workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
          console.log('Service worker unregistered');
        }
        
        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
          console.log('All caches cleared');
        }
      } catch (error) {
        console.error('Error clearing service worker cache:', error);
      }
    });
  }
}

// Clear cache in development
clearServiceWorkerCache();

// Add no-cache headers for development environments
function addNoCacheHeaders() {
  // Create a meta tag to prevent caching in the browser
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Cache-Control';
  meta.content = 'no-cache, no-store, must-revalidate';
  document.head.appendChild(meta);
  
  const pragma = document.createElement('meta');
  pragma.httpEquiv = 'Pragma';
  pragma.content = 'no-cache';
  document.head.appendChild(pragma);
  
  const expires = document.createElement('meta');
  expires.httpEquiv = 'Expires';
  expires.content = '0';
  document.head.appendChild(expires);
}

// Setup no-cache headers
addNoCacheHeaders();

// Render the application with QueryClientProvider
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
