import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

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
        
        // Check for updates periodically
        setInterval(() => {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage('CHECK_UPDATES');
          }
        }, 60000); // Check every minute
        
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
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
