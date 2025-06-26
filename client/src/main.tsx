import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// PWA Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registered successfully:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, notify user
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    });
  }
}

// PWA Install Prompt handled by PWAInstallPrompt component

// PWA install functionality moved to PWAInstallPrompt component

// Clear service worker cache in development only
function clearServiceWorkerCache() {
  if (process.env.NODE_ENV === 'development' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
          console.log('Service worker unregistered');
        }
        
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

// Initialize PWA features
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker();
} else {
  clearServiceWorkerCache();
}

// Add no-cache headers for development environments
function addNoCacheHeaders() {
  if (process.env.NODE_ENV === 'development') {
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
}

// Setup no-cache headers
addNoCacheHeaders();

// Render the application
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <App />
  );
}
