// WebSocket client connection handler
import { useState, useEffect } from 'react';
let socket: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let authenticated = false;

// Listeners for WebSocket events
const listeners: { [key: string]: Set<(data: any) => void> } = {
  'exchangeRates': new Set(),
  'userData': new Set(),
  'notification': new Set(),
  'connected': new Set(),
  'disconnected': new Set(),
  'error': new Set()
};

// Initialize WebSocket connection
export function initializeWebSocket(userId?: string) {
  // If already connected, don't reconnect
  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  // Clear any existing reconnection timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  try {
    // Create WebSocket URL from current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log(`Connecting to WebSocket at ${wsUrl}`);
    socket = new WebSocket(wsUrl);

    // Handle WebSocket open event
    socket.onopen = () => {
      console.log('WebSocket connection established');
      
      // Notify listeners that connection is established
      notifyListeners('connected', null);
      
      // If userId is provided, authenticate WebSocket connection
      if (userId) {
        authenticateWebSocket(userId);
      }
    };

    // Handle WebSocket message event
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Check message type and notify appropriate listeners
        if (data.type && listeners[data.type]) {
          notifyListeners(data.type, data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Handle WebSocket close event
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      authenticated = false;
      
      // Notify listeners that connection is closed
      notifyListeners('disconnected', null);
      
      // Attempt to reconnect after delay
      reconnectTimeout = setTimeout(() => {
        initializeWebSocket(userId);
      }, 5000);
    };

    // Handle WebSocket error event
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      notifyListeners('error', error);
    };
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    
    // Attempt to reconnect after delay
    reconnectTimeout = setTimeout(() => {
      initializeWebSocket(userId);
    }, 5000);
  }
}

// Authenticate WebSocket connection with user ID
export function authenticateWebSocket(userId: string) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('Cannot authenticate WebSocket: not connected');
    return;
  }

  const authMessage = JSON.stringify({
    type: 'auth',
    userId: userId
  });

  socket.send(authMessage);
  authenticated = true;
  console.log(`WebSocket authenticated for user ${userId}`);
}

// Close WebSocket connection
export function closeWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }

  // Clear any existing reconnection timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // Reset authentication state
  authenticated = false;
}

// Send message to WebSocket server
export function sendWebSocketMessage(message: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('Cannot send WebSocket message: not connected');
    return false;
  }

  try {
    socket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
}

// Add listener for WebSocket events
export function addWebSocketListener(type: string, callback: (data: any) => void): () => void {
  if (!listeners[type]) {
    listeners[type] = new Set();
  }

  listeners[type].add(callback);

  // Return function to remove listener
  return () => {
    if (listeners[type]) {
      listeners[type].delete(callback);
    }
  };
}

// Notify listeners of WebSocket events
function notifyListeners(type: string, data: any) {
  if (listeners[type]) {
    listeners[type].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in WebSocket listener for ${type}:`, error);
      }
    });
  }
}

// Get current WebSocket connection status
export function getWebSocketStatus() {
  if (!socket) {
    return { connected: false, authenticated: false };
  }

  return {
    connected: socket.readyState === WebSocket.OPEN,
    authenticated: authenticated
  };
}

// React hook for using WebSocket data
export function useWebSocketData<T>(type: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);

  useEffect(() => {
    // Add listener for data type
    const removeListener = addWebSocketListener(type, (newData) => {
      setData(newData);
    });

    // Clean up listener when component unmounts
    return () => {
      removeListener();
    };
  }, [type]);

  return data;
}