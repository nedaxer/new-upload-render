import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

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

// PWA Install Prompt
let deferredPrompt: any;

function showInstallPromotion() {
  if (document.getElementById('pwa-install-banner')) return;
  
  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #0033a0;
    color: white;
    padding: 10px;
    text-align: center;
    z-index: 9999;
    font-family: Arial, sans-serif;
  `;
  banner.innerHTML = `
    <span>Install Nedaxer App for better experience</span>
    <button id="pwa-install-btn" style="margin-left: 10px; padding: 5px 10px; background: #f59e0b; color: white; border: none; border-radius: 3px;">Install</button>
    <button id="pwa-dismiss-btn" style="margin-left: 10px; padding: 5px 10px; background: transparent; color: white; border: 1px solid white; border-radius: 3px;">Later</button>
  `;
  document.body.appendChild(banner);

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show install button or notification
    showInstallPromotion();
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    // Hide install promotion
    hideInstallPromotion();
  });
}

function showInstallPromotion() {
  // Create install banner if it doesn't exist
  if (!document.getElementById('pwa-install-banner')) {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: #0033a0;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Install Nedaxer App</div>
          <div style="font-size: 14px; opacity: 0.9;">Get the full app experience</div>
        </div>
        <div>
          <button id="pwa-install-btn" style="
            background: white;
            color: #0033a0;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            margin-right: 8px;
            cursor: pointer;
          ">Install</button>
          <button id="pwa-dismiss-btn" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
          ">×</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    // Install button click handler
    document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        hideInstallPromotion();
      }
    });

    // Dismiss button click handler
    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      hideInstallPromotion();
    });
  }
}
}

function hideInstallPromotion() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.remove();
  }
}

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
  setupInstallPrompt();
} else {
  clearServiceWorkerCache();
}

// Add no-cache headers for development environment
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
}s
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

// Render the application with QueryClientProvider
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
